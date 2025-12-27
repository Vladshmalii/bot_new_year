from pydantic import BaseModel
from typing import Optional, Dict, Any, List


class DiceRollRequest(BaseModel):
    dice_type: str
    character_id: Optional[int] = None
    context: Optional[Dict[str, Any]] = None


class AuthPlayerRequest(BaseModel):
    character_name: str


class AuthMasterRequest(BaseModel):
    password: str


class NoteCreateRequest(BaseModel):
    character_id: int
    text: str
    visibility: str = "decide_yourself"


class LocationCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    tags: Optional[List[str]] = None


class MoveCharacterRequest(BaseModel):
    character_id: int
    location_id: int


class SpawnMobRequest(BaseModel):
    mob_id: int
    location_id: int


class GiveItemRequest(BaseModel):
    character_id: int
    item_id: int
    quantity: int = 1


class AssignCharacterRequest(BaseModel):
    user_id: int
    character_id: int


class CharacterUpdateRequest(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    description: Optional[str] = None
    backstory: Optional[str] = None
    hp_current: Optional[int] = None
    hp_max: Optional[int] = None
    damage_base: Optional[int] = None
    stats: Optional[Dict[str, Any]] = None
    abilities: Optional[List[str]] = None
    location_id: Optional[int] = None

