import json
import boto3
import os
from ..auth.utils import verify_token, create_error_response, create_success_response

def lambda_handler(event, context):
    """
    Lambda function to delete a task using boto3 and DynamoDB
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
    
    # Check if task exists and belongs to the user
    try:
        response = tasks_table.get_item(
            Key={'task_id': task_id}
        )
        task = response.get('Item')
        
        if not task or task.get('user_id') != user['user_id']:
            return create_error_response(404, 'Task not found')
    except Exception as e:
        print(f"Error getting item from DynamoDB: {str(e)}")
        return create_error_response(500, 'Error retrieving task')
    
    # Delete task
    try:
        tasks_table.delete_item(
            Key={'task_id': task_id}
        )
    except Exception as e:
        print(f"Error deleting item from DynamoDB: {str(e)}")
        return create_error_response(500, 'Error deleting task')
    
    # Return response
    return {
        'statusCode': 204,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': True,
        },
        'body': ''
    }