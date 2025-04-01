import uuid
from datetime import datetime
from typing import List, Dict, Optional

from src.models.task import TaskCreate, TaskUpdate, TaskInDB, TaskResponse, TaskStats
from src.utils.database import get_collection

# Task collection
tasks_collection = get_collection("tasks")

async def create_task(task: TaskCreate, user_id: str) -> TaskResponse:
    """
    Create a new task.
    
    Args:
        task (TaskCreate): Task data
        user_id (str): User ID
        
    Returns:
        TaskResponse: Created task
    """
    # Generate task ID
    task_id = str(uuid.uuid4())
    
    # Get current time
    now = datetime.utcnow()
    
    # Create task document
    task_doc = TaskInDB(
        id=task_id,
        user_id=user_id,
        title=task.title,
        description=task.description,
        status=task.status,
        created_at=now,
        updated_at=now,
    )
    
    # Insert task document
    await tasks_collection.insert_one(task_doc.dict())
    
    # Return task response
    return TaskResponse(
        id=task_id,
        title=task.title,
        description=task.description,
        status=task.status,
        created_at=now,
        updated_at=now,
    )

async def get_tasks(user_id: str) -> List[TaskResponse]:
    """
    Get all tasks for a user.
    
    Args:
        user_id (str): User ID
        
    Returns:
        List[TaskResponse]: List of tasks
    """
    # Find tasks for user
    cursor = tasks_collection.find({"user_id": user_id})
    
    # Convert cursor to list
    tasks = await cursor.to_list(length=None)
    
    # Convert tasks to response model
    return [
        TaskResponse(
            id=task["id"],
            title=task["title"],
            description=task["description"],
            status=task["status"],
            created_at=task["created_at"],
            updated_at=task["updated_at"],
        )
        for task in tasks
    ]

async def get_task_by_id(task_id: str, user_id: str) -> Optional[TaskResponse]:
    """
    Get a task by ID.
    
    Args:
        task_id (str): Task ID
        user_id (str): User ID
        
    Returns:
        Optional[TaskResponse]: Task if found, None otherwise
    """
    # Find task
    task = await tasks_collection.find_one({"id": task_id, "user_id": user_id})
    
    # Check if task exists
    if not task:
        return None
    
    # Return task response
    return TaskResponse(
        id=task["id"],
        title=task["title"],
        description=task["description"],
        status=task["status"],
        created_at=task["created_at"],
        updated_at=task["updated_at"],
    )

async def update_task(task_id: str, task_update: TaskUpdate, user_id: str) -> Optional[TaskResponse]:
    """
    Update a task.
    
    Args:
        task_id (str): Task ID
        task_update (TaskUpdate): Task update data
        user_id (str): User ID
        
    Returns:
        Optional[TaskResponse]: Updated task if found, None otherwise
    """
    # Find task
    task = await tasks_collection.find_one({"id": task_id, "user_id": user_id})
    
    # Check if task exists
    if not task:
        return None
    
    # Get current time
    now = datetime.utcnow()
    
    # Create update data
    update_data = {"updated_at": now}
    
    # Add fields to update
    if task_update.title is not None:
        update_data["title"] = task_update.title
    
    if task_update.description is not None:
        update_data["description"] = task_update.description
    
    if task_update.status is not None:
        update_data["status"] = task_update.status
    
    # Update task
    await tasks_collection.update_one(
        {"id": task_id, "user_id": user_id},
        {"$set": update_data},
    )
    
    # Get updated task
    updated_task = await tasks_collection.find_one({"id": task_id, "user_id": user_id})
    
    # Return updated task response
    return TaskResponse(
        id=updated_task["id"],
        title=updated_task["title"],
        description=updated_task["description"],
        status=updated_task["status"],
        created_at=updated_task["created_at"],
        updated_at=updated_task["updated_at"],
    )

async def delete_task(task_id: str, user_id: str) -> bool:
    """
    Delete a task.
    
    Args:
        task_id (str): Task ID
        user_id (str): User ID
        
    Returns:
        bool: True if task was deleted, False otherwise
    """
    # Delete task
    result = await tasks_collection.delete_one({"id": task_id, "user_id": user_id})
    
    # Check if task was deleted
    return result.deleted_count > 0

async def get_task_stats(user_id: str) -> TaskStats:
    """
    Get task statistics for a user.
    
    Args:
        user_id (str): User ID
        
    Returns:
        TaskStats: Task statistics
    """
    # Find tasks for user
    cursor = tasks_collection.find({"user_id": user_id})
    
    # Convert cursor to list
    tasks = await cursor.to_list(length=None)
    
    # Count tasks by status
    total = len(tasks)
    todo = sum(1 for task in tasks if task["status"] == "todo")
    in_progress = sum(1 for task in tasks if task["status"] == "in_progress")
    completed = sum(1 for task in tasks if task["status"] == "completed")
    
    # Return task statistics
    return TaskStats(
        total=total,
        todo=todo,
        in_progress=in_progress,
        completed=completed,
    )