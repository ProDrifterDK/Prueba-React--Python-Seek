from fastapi import APIRouter, HTTPException, Depends, status, Path
from typing import List

from src.models.task import TaskCreate, TaskUpdate, TaskResponse, TaskStats
from src.tasks.service import (
    create_task,
    get_tasks,
    get_task_by_id,
    update_task,
    delete_task,
    get_task_stats,
)
from src.utils.auth import get_current_user

# Create router
router = APIRouter()

@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task_endpoint(
    task: TaskCreate,
    current_user: dict = Depends(get_current_user),
):
    """
    Create a new task.
    
    Args:
        task (TaskCreate): Task data
        current_user (dict): Current user data from token
        
    Returns:
        TaskResponse: Created task
    """
    try:
        # Create task
        return await create_task(task, current_user["user_id"])
    except Exception as e:
        # Handle errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating the task",
        )

@router.get("", response_model=List[TaskResponse])
async def get_tasks_endpoint(
    current_user: dict = Depends(get_current_user),
):
    """
    Get all tasks for the current user.
    
    Args:
        current_user (dict): Current user data from token
        
    Returns:
        List[TaskResponse]: List of tasks
    """
    try:
        # Get tasks
        return await get_tasks(current_user["user_id"])
    except Exception as e:
        # Handle errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while getting tasks",
        )

@router.get("/stats", response_model=TaskStats)
async def get_task_stats_endpoint(
    current_user: dict = Depends(get_current_user),
):
    """
    Get task statistics for the current user.
    
    Args:
        current_user (dict): Current user data from token
        
    Returns:
        TaskStats: Task statistics
    """
    try:
        # Get task statistics
        return await get_task_stats(current_user["user_id"])
    except Exception as e:
        # Handle errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while getting task statistics",
        )

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task_endpoint(
    task_id: str = Path(..., title="Task ID"),
    current_user: dict = Depends(get_current_user),
):
    """
    Get a task by ID.
    
    Args:
        task_id (str): Task ID
        current_user (dict): Current user data from token
        
    Returns:
        TaskResponse: Task
    """
    try:
        # Get task
        task = await get_task_by_id(task_id, current_user["user_id"])
        
        # Check if task exists
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found",
            )
        
        return task
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle other errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while getting the task",
        )

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task_endpoint(
    task_update: TaskUpdate,
    task_id: str = Path(..., title="Task ID"),
    current_user: dict = Depends(get_current_user),
):
    """
    Update a task.
    
    Args:
        task_update (TaskUpdate): Task update data
        task_id (str): Task ID
        current_user (dict): Current user data from token
        
    Returns:
        TaskResponse: Updated task
    """
    try:
        # Update task
        task = await update_task(task_id, task_update, current_user["user_id"])
        
        # Check if task exists
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found",
            )
        
        return task
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle other errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the task",
        )

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task_endpoint(
    task_id: str = Path(..., title="Task ID"),
    current_user: dict = Depends(get_current_user),
):
    """
    Delete a task.
    
    Args:
        task_id (str): Task ID
        current_user (dict): Current user data from token
    """
    try:
        # Delete task
        deleted = await delete_task(task_id, current_user["user_id"])
        
        # Check if task was deleted
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found",
            )
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle other errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while deleting the task",
        )