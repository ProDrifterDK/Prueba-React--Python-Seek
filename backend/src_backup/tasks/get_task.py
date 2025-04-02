import json
import boto3
import os
from ..auth.utils import verify_token, create_error_response, create_success_response

def lambda_handler(event, context):
    """
    Lambda function to get a task by ID using boto3 and DynamoDB
    """
    # Verify token
    user = verify_token(event)
    if not user:
        return create_error_response(401, 'Unauthorized')
    
    # Get task ID from path parameters
    task_id = event.get('pathParameters', {}).get('id')
    if not task_id:
        return create_error_response(400, 'Task ID is required')
    
    # Initialize DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    tasks_table = dynamodb.Table('Tasks')
    
    # Get task
    try:
        response = tasks_table.get_item(
            Key={'task_id': task_id}
        )
        task = response.get('Item')
        
        # Check if task exists and belongs to the user
        if not task or task.get('user_id') != user['user_id']:
            return create_error_response(404, 'Task not found')
    except Exception as e:
        print(f"Error getting item from DynamoDB: {str(e)}")
        return create_error_response(500, 'Error retrieving task')
    
    # Return response
    return create_success_response(200, task)