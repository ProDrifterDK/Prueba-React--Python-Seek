from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class TaskBase(BaseModel):
    """Base task model"""
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    status: str = Field("todo", description="Task status: todo, in_progress, completed")

    class Config:
        schema_extra = {
            "example": {
                "title": "Implement login feature",
                "description": "Create login page with JWT authentication",
                "status": "todo"
            }
        }

class TaskCreate(TaskBase):
    """Task creation model"""
    pass

class TaskUpdate(BaseModel):
    """Task update model"""
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    status: Optional[str] = Field(None, description="Task status: todo, in_progress, completed")

    class Config:
        schema_extra = {
            "example": {
                "title": "Implement login feature",
                "description": "Create login page with JWT authentication",
                "status": "in_progress"
            }
        }

class TaskInDB(TaskBase):
    """Task model in database"""
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

class TaskResponse(TaskBase):
    """Task response model"""
    id: str
    created_at: datetime
    updated_at: datetime

class TaskStats(BaseModel):
    """Task statistics model"""
    total: int
    todo: int
    in_progress: int
    completed: int