import json
import boto3
import uuid
import os
from datetime import datetime
from ..auth.utils import verify_token, create_error_response, create_success_response

def lambda_handler(event, context):
    """
    Lambda function to create a new task using boto3 and DynamoDB
    """
    # Verify token
    user = verify_token(event)
    if not user:
        return create_error_response(401, 'Unauthorized')
    
    # Parse request body
    try:
        body = json.loads(event['body'])
    except:
        return create_error_response(400, 'Invalid request body')
    
    # Validate input
    title = body.get('title')
    description = body.get('description')
    status = body.get('status', 'todo')
    
    if not title:
        return create_error_response(400, 'Title is required')
    
    if status not in ['todo', 'in_progress', 'completed']:
        return create_error_response(400, 'Invalid status')
    
    # Initialize DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    tasks_table = dynamodb.Table('Tasks')
    
    # Create task
    task_id = str(uuid.uuid4())
    created_at = datetime.now().isoformat()
    updated_at = created_at
    
    # Create task item
    task = {
        'task_id': task_id,
        'user_id': user['user_id'],
        'title': title,
        'description': description if description else '',
        'status': status,
        'created_at': created_at,
        'updated_at': updated_at
    }
    
    # Put item in DynamoDB
    try:
        tasks_table.put_item(Item=task)
    except Exception as e:
        print(f"Error putting item in DynamoDB: {str(e)}")
        return create_error_response(500, 'Error creating task')
    
    # Return response
    return create_success_response(201, task)