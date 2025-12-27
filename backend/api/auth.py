from typing import Optional, Dict, Any
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import User, Character

MASTER_PASSWORD = "2365"  # Пароль для мастера


async def authenticate_player(character_name: str, db: AsyncSession) -> Dict[str, Any]:
    """Аутентификация игрока по имени персонажа"""
    result = await db.execute(
        select(Character).where(Character.name.ilike(character_name))
    )
    character = result.scalar_one_or_none()
    
    if not character:
        raise HTTPException(status_code=404, detail="Персонаж не найден")
    
    return {
        "type": "player",
        "character_id": character.id,
        "character_name": character.name
    }


async def authenticate_master(password: str) -> Dict[str, Any]:
    """Аутентификация мастера по паролю"""
    if password != MASTER_PASSWORD:
        raise HTTPException(status_code=401, detail="Неверный пароль")
    
    return {
        "type": "master"
    }
