from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON, Numeric
from datetime import datetime
from config import DATABASE_URL
import logging

logger = logging.getLogger(__name__)

# Convert postgresql:// to postgresql+asyncpg://
async_database_url = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

# Add connection pool settings and retry logic
engine = create_async_engine(
    async_database_url,
    echo=True,
    pool_pre_ping=True,  # Verify connections before using them
    pool_size=5,
    max_overflow=10,
    pool_recycle=3600,
)
async_session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()


# Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    telegram_id = Column(Integer, unique=True, nullable=False, index=True)
    role = Column(String(20), default="player", nullable=False)  # player or master
    name = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)


class Character(Base):
    __tablename__ = "characters"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    age = Column(Integer)
    description = Column(Text)
    backstory = Column(Text)
    hp_current = Column(Integer, default=100)
    hp_max = Column(Integer, default=100)
    damage_base = Column(Integer, default=1)
    stats = Column(JSON, default={})  # {str: int, dex: int, int: int, etc.}
    abilities = Column(JSON, default=[])  # List of ability names/descriptions
    notes_visible_to_player = Column(JSON, default=[])
    notes_hidden_from_player = Column(JSON, default=[])
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class UserCharacter(Base):
    __tablename__ = "user_characters"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    character_id = Column(Integer, ForeignKey("characters.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Location(Base):
    __tablename__ = "locations"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    tags = Column(JSON, default=[])  # ["город", "подземелье", etc.]
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Mob(Base):
    __tablename__ = "mobs"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    base_hp = Column(Integer, default=50)
    base_damage = Column(Integer, default=1)
    dice_pattern = Column(String(50))  # "2d6+1" or similar
    public_description = Column(Text)  # What players see
    gm_notes = Column(Text)  # What only GM sees
    created_at = Column(DateTime, default=datetime.utcnow)


class LocationMob(Base):
    __tablename__ = "location_mobs"
    
    id = Column(Integer, primary_key=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    mob_id = Column(Integer, ForeignKey("mobs.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class MobInstance(Base):
    __tablename__ = "mob_instances"
    
    id = Column(Integer, primary_key=True)
    mob_id = Column(Integer, ForeignKey("mobs.id"), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    rolled_stats = Column(JSON, default={})  # Generated stats for this instance
    hp_current = Column(Integer)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Item(Base):
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    short_description = Column(Text)
    long_description = Column(Text)
    base_stats = Column(JSON, default={})  # Bonuses to stats
    rarity = Column(String(50))  # common, uncommon, rare, epic, legendary
    charges = Column(Integer, default=0)  # 0 = unlimited
    cooldown = Column(Integer, default=0)  # Cooldown in seconds
    created_at = Column(DateTime, default=datetime.utcnow)


class CharacterItem(Base):
    __tablename__ = "character_items"
    
    id = Column(Integer, primary_key=True)
    character_id = Column(Integer, ForeignKey("characters.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    quantity = Column(Integer, default=1)
    state = Column(String(50), default="active")  # active, broken, cooldown
    cooldown_until = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Note(Base):
    __tablename__ = "notes"
    
    id = Column(Integer, primary_key=True)
    character_id = Column(Integer, ForeignKey("characters.id"), nullable=True)
    from_gm = Column(Boolean, default=True)
    text = Column(Text, nullable=False)
    visibility = Column(String(50), default="decide_yourself")  # tell_all, keep_secret, decide_yourself
    created_at = Column(DateTime, default=datetime.utcnow)


class NoteTemplate(Base):
    __tablename__ = "note_templates"
    
    id = Column(Integer, primary_key=True)
    text = Column(Text, nullable=False)
    visibility = Column(String(50), default="decide_yourself")
    created_at = Column(DateTime, default=datetime.utcnow)


class DiceRoll(Base):
    __tablename__ = "dice_rolls"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    character_id = Column(Integer, ForeignKey("characters.id"), nullable=True)
    type = Column(String(20), nullable=False)  # d4, d6, d8, d10, d12, d20, d100, custom
    value = Column(Integer, nullable=False)
    context = Column(JSON, default={})  # Additional context
    created_at = Column(DateTime, default=datetime.utcnow)


async def get_db():
    """Dependency for getting database session"""
    async with async_session_maker() as session:
        yield session

