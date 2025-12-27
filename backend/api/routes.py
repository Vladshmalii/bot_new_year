from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import Optional, List, Dict, Any
from datetime import datetime
import random
import re

from database import get_db, User, Character, UserCharacter, Location, Mob, MobInstance, Item, CharacterItem, Note, NoteTemplate, DiceRoll, LocationMob
from api.auth import authenticate_player, authenticate_master
from api.excel_import import import_excel_data
from api.schemas import (
    DiceRollRequest, NoteCreateRequest, LocationCreateRequest,
    MoveCharacterRequest, SpawnMobRequest, GiveItemRequest,
    AssignCharacterRequest, CharacterUpdateRequest,
    AuthPlayerRequest, AuthMasterRequest
)

router = APIRouter()


# Authentication endpoints
@router.post("/auth/player")
async def auth_player(
    character_name: str,
    db: AsyncSession = Depends(get_db)
):
    """Аутентификация игрока по имени персонажа"""
    return await authenticate_player(character_name, db)


@router.post("/auth/master")
async def auth_master(password: str):
    """Аутентификация мастера по паролю"""
    return await authenticate_master(password)


@router.get("/character/{character_id}")
async def get_character(
    character_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get character details"""
    result = await db.execute(select(Character).where(Character.id == character_id))
    character = result.scalar_one_or_none()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    
    # Get inventory
    result = await db.execute(
        select(Item, CharacterItem)
        .join(CharacterItem, Item.id == CharacterItem.item_id)
        .where(CharacterItem.character_id == character_id)
    )
    inventory_items = result.all()
    
    # Get notes
    result = await db.execute(
        select(Note).where(Note.character_id == character_id).order_by(Note.created_at.desc())
    )
    notes = result.scalars().all()
    
    # Get location
    location = None
    if character.location_id:
        result = await db.execute(select(Location).where(Location.id == character.location_id))
        location = result.scalar_one_or_none()
    
    return {
        "character": {
            "id": character.id,
            "name": character.name,
            "age": character.age,
            "description": character.description,
            "backstory": character.backstory,
            "hp_current": character.hp_current,
            "hp_max": character.hp_max,
            "damage_base": character.damage_base,
            "stats": character.stats or {},
            "abilities": character.abilities or [],
            "notes_visible_to_player": character.notes_visible_to_player or [],
            "location_id": character.location_id,
            "location": {
                "id": location.id,
                "name": location.name,
                "description": location.description,
                "tags": location.tags or []
            } if location else None
        },
        "inventory": [
            {
                "id": item.id,
                "name": item.name,
                "short_description": item.short_description,
                "long_description": item.long_description,
                "base_stats": item.base_stats or {},
                "rarity": item.rarity,
                "charges": item.charges,
                "cooldown": item.cooldown,
                "quantity": char_item.quantity,
                "state": char_item.state,
                "cooldown_until": char_item.cooldown_until.isoformat() if char_item.cooldown_until else None
            }
            for item, char_item in inventory_items
        ],
        "notes": [
            {
                "id": note.id,
                "text": note.text,
                "visibility": note.visibility,
                "from_gm": note.from_gm,
                "created_at": note.created_at.isoformat()
            }
            for note in notes
        ]
    }


@router.post("/dice/roll")
async def roll_dice(
    request: DiceRollRequest,
    character_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
    """Roll a dice and save the result"""
    # Parse dice type and roll
    dice_value = parse_and_roll_dice(request.dice_type)
    
    # Save roll if character_id provided
    if request.character_id:
        result = await db.execute(select(Character).where(Character.id == request.character_id))
        character = result.scalar_one_or_none()
        if character:
            # Find or create user for character
            result = await db.execute(
                select(UserCharacter).where(UserCharacter.character_id == request.character_id)
            )
            uc = result.scalar_one_or_none()
            user_id = uc.user_id if uc else None
            
            if not user_id:
                # Create dummy user
                user = User(telegram_id=0, role="player", name=character.name)
                db.add(user)
                await db.commit()
                await db.refresh(user)
                user_id = user.id
            
            dice_roll = DiceRoll(
                user_id=user_id,
                character_id=request.character_id,
                type=request.dice_type,
                value=dice_value,
                context=request.context or {}
            )
            db.add(dice_roll)
            await db.commit()
    
    return {
        "type": request.dice_type,
        "value": dice_value
    }


def parse_and_roll_dice(dice_pattern: str) -> int:
    """Parse dice pattern like '2d6+1' or 'd20' and roll"""
    # Simple patterns: d4, d6, d8, d10, d12, d20, d100
    simple_match = re.match(r'^d(\d+)$', dice_pattern.lower())
    if simple_match:
        sides = int(simple_match.group(1))
        return random.randint(1, sides)
    
    # Complex patterns: 2d6+1, 3d8-2, etc.
    complex_match = re.match(r'^(\d+)d(\d+)([+-]\d+)?$', dice_pattern.lower())
    if complex_match:
        count = int(complex_match.group(1))
        sides = int(complex_match.group(2))
        modifier = int(complex_match.group(3)) if complex_match.group(3) else 0
        
        total = sum(random.randint(1, sides) for _ in range(count))
        return total + modifier
    
    # Custom range: e.g., "1-100"
    range_match = re.match(r'^(\d+)-(\d+)$', dice_pattern)
    if range_match:
        min_val = int(range_match.group(1))
        max_val = int(range_match.group(2))
        return random.randint(min_val, max_val)
    
    # Default: try to parse as single number
    try:
        return int(dice_pattern)
    except:
        raise HTTPException(status_code=400, detail=f"Invalid dice pattern: {dice_pattern}")


@router.get("/dice/rolls")
async def get_dice_rolls(
    character_id: Optional[int] = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """Get dice roll history"""
    query = select(DiceRoll, Character).outerjoin(Character)
    
    if character_id:
        query = query.where(DiceRoll.character_id == character_id)
    
    query = query.order_by(DiceRoll.created_at.desc()).limit(limit)
    
    result = await db.execute(query)
    rolls = result.all()
    
    return [
        {
            "id": roll.id,
            "character_name": char.name if char else "Неизвестно",
            "type": roll.type,
            "value": roll.value,
            "context": roll.context or {},
            "created_at": roll.created_at.isoformat()
        }
        for roll, char in rolls
    ]


@router.get("/notes")
async def get_notes(
    character_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get notes for character"""
    query = select(Note)
    if character_id:
        query = query.where(Note.character_id == character_id)
    
    query = query.order_by(Note.created_at.desc())
    result = await db.execute(query)
    notes = result.scalars().all()
    
    return [
        {
            "id": note.id,
            "character_id": note.character_id,
            "text": note.text,
            "visibility": note.visibility,
            "from_gm": note.from_gm,
            "created_at": note.created_at.isoformat()
        }
        for note in notes
    ]


# Master-only routes
@router.get("/master/dashboard")
async def get_master_dashboard(
    db: AsyncSession = Depends(get_db)
):
    """Get master dashboard data"""
    # Get all characters
    result = await db.execute(select(Character))
    characters = result.scalars().all()
    
    # Get last dice rolls
    result = await db.execute(
        select(DiceRoll, Character)
        .outerjoin(Character)
        .order_by(DiceRoll.created_at.desc())
        .limit(10)
    )
    recent_rolls = result.all()
    
    characters_data = []
    for char in characters:
        # Get last roll for this character
        last_roll = None
        for roll, roll_char in recent_rolls:
            if roll_char and roll_char.id == char.id:
                last_roll = {"type": roll.type, "value": roll.value, "created_at": roll.created_at.isoformat()}
                break
        
        characters_data.append({
            "id": char.id,
            "name": char.name,
            "hp_current": char.hp_current,
            "hp_max": char.hp_max,
            "location_id": char.location_id,
            "last_roll": last_roll
        })
    
    return {"characters": characters_data}


@router.get("/master/characters")
async def get_all_characters(
    db: AsyncSession = Depends(get_db)
):
    """Get all characters (master only)"""
    result = await db.execute(select(Character))
    characters = result.scalars().all()
    
    return [
        {
            "id": char.id,
            "name": char.name,
            "hp_current": char.hp_current,
            "hp_max": char.hp_max,
            "location_id": char.location_id
        }
        for char in characters
    ]


@router.post("/master/notes")
async def create_note(
    request: NoteCreateRequest,
    db: AsyncSession = Depends(get_db)
):
    """Create a note (master only)"""
    note = Note(
        character_id=request.character_id,
        from_gm=True,
        text=request.text,
        visibility=request.visibility
    )
    db.add(note)
    await db.commit()
    await db.refresh(note)
    
    return {
        "id": note.id,
        "character_id": note.character_id,
        "text": note.text,
        "visibility": note.visibility,
        "created_at": note.created_at.isoformat()
    }


@router.post("/master/locations")
async def create_location(
    request: LocationCreateRequest,
    db: AsyncSession = Depends(get_db)
):
    """Create location (master only)"""
    location = Location(
        name=request.name,
        description=request.description,
        tags=request.tags or []
    )
    db.add(location)
    await db.commit()
    await db.refresh(location)
    
    return {
        "id": location.id,
        "name": location.name,
        "description": location.description,
        "tags": location.tags
    }


@router.get("/master/locations")
async def get_locations(
    db: AsyncSession = Depends(get_db)
):
    """Get all locations (master only)"""
    result = await db.execute(select(Location))
    locations = result.scalars().all()
    
    # Get characters in each location
    result = await db.execute(select(Character))
    characters = result.scalars().all()
    
    location_data = []
    for loc in locations:
        chars_in_location = [c for c in characters if c.location_id == loc.id]
        location_data.append({
            "id": loc.id,
            "name": loc.name,
            "description": loc.description,
            "tags": loc.tags or [],
            "is_active": loc.is_active,
            "characters": [
                {"id": c.id, "name": c.name}
                for c in chars_in_location
            ]
        })
    
    return location_data


@router.post("/master/move-character")
async def move_character(
    request: MoveCharacterRequest,
    db: AsyncSession = Depends(get_db)
):
    """Move character to location (master only)"""
    result = await db.execute(select(Character).where(Character.id == request.character_id))
    character = result.scalar_one_or_none()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    
    character.location_id = request.location_id
    await db.commit()
    
    return {"message": "Character moved successfully"}


@router.get("/master/mobs")
async def get_mobs(
    location_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get mobs (master only)"""
    query = select(Mob)
    if location_id:
        query = query.join(LocationMob).where(LocationMob.location_id == location_id)
    
    result = await db.execute(query)
    mobs = result.scalars().all()
    
    return [
        {
            "id": mob.id,
            "name": mob.name,
            "description": mob.description,
            "base_hp": mob.base_hp,
            "base_damage": mob.base_damage,
            "dice_pattern": mob.dice_pattern,
            "public_description": mob.public_description,
            "gm_notes": mob.gm_notes
        }
        for mob in mobs
    ]


@router.post("/master/spawn-mob")
async def spawn_mob(
    request: SpawnMobRequest,
    db: AsyncSession = Depends(get_db)
):
    """Spawn mob instance in location (master only)"""
    result = await db.execute(select(Mob).where(Mob.id == request.mob_id))
    mob = result.scalar_one_or_none()
    if not mob:
        raise HTTPException(status_code=404, detail="Mob not found")
    
    # Generate stats based on dice_pattern
    rolled_stats = {}
    if mob.dice_pattern:
        rolled_hp = parse_and_roll_dice(mob.dice_pattern)
        rolled_stats = {"hp": rolled_hp, "damage": mob.base_damage}
    
    # Create mob instance
    mob_instance = MobInstance(
        mob_id=request.mob_id,
        location_id=request.location_id,
        rolled_stats=rolled_stats,
        hp_current=rolled_stats.get("hp", mob.base_hp)
    )
    db.add(mob_instance)
    await db.commit()
    await db.refresh(mob_instance)
    
    return {
        "id": mob_instance.id,
        "mob": {
            "id": mob.id,
            "name": mob.name,
            "public_description": mob.public_description
        },
        "rolled_stats": rolled_stats,
        "hp_current": mob_instance.hp_current
    }


@router.get("/master/items")
async def get_items(
    db: AsyncSession = Depends(get_db)
):
    """Get all items (master only)"""
    result = await db.execute(select(Item))
    items = result.scalars().all()
    
    return [
        {
            "id": item.id,
            "name": item.name,
            "short_description": item.short_description,
            "long_description": item.long_description,
            "base_stats": item.base_stats or {},
            "rarity": item.rarity,
            "charges": item.charges,
            "cooldown": item.cooldown
        }
        for item in items
    ]


@router.post("/master/give-item")
async def give_item(
    request: GiveItemRequest,
    db: AsyncSession = Depends(get_db)
):
    """Give item to character (master only)"""
    result = await db.execute(
        select(CharacterItem).where(
            and_(
                CharacterItem.character_id == request.character_id,
                CharacterItem.item_id == request.item_id
            )
        )
    )
    char_item = result.scalar_one_or_none()
    
    if char_item:
        char_item.quantity += request.quantity
    else:
        char_item = CharacterItem(
            character_id=request.character_id,
            item_id=request.item_id,
            quantity=request.quantity
        )
        db.add(char_item)
    
    await db.commit()
    
    return {"message": "Item given successfully"}


@router.put("/master/character/{character_id}")
async def update_character(
    character_id: int,
    data: CharacterUpdateRequest,
    db: AsyncSession = Depends(get_db)
):
    """Update character (master only)"""
    result = await db.execute(select(Character).where(Character.id == character_id))
    character = result.scalar_one_or_none()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    
    # Update fields
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        if hasattr(character, key):
            setattr(character, key, value)
    
    await db.commit()
    await db.refresh(character)
    
    return {"message": "Character updated successfully"}


@router.post("/master/import/excel")
async def import_excel(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Import data from Excel file (master only)"""
    # Save file temporarily
    import os
    upload_dir = "/app/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    try:
        # Import data
        result = await import_excel_data(file_path, db)
        return result
    finally:
        # Clean up
        if os.path.exists(file_path):
            os.remove(file_path)
