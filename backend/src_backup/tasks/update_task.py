import json
import boto3
import os
from datetime import datetime
from ..auth.utils import verify_token, create_error_response, create_success_response

def lambda_handler(event, context):
    """
    Lambda function to update a task using boto3 and DynamoDB
    """
    # Verify token
    user = verify_token(event)
    if not user:
        return create_error_response(401, 'Unauthorized')
    
    # Get task ID from path parameters
    task_id = event.get('pathParameters', {}).get('id')
    if not task_id:
        return create_error_response(400, 'Task ID is required')
    
    # Parse request body
    try:
        body = json.loads(event['body'])
    except:
        return create_error_response(400, 'Invalid request body')
    
    # Validate input
    title = body.get('title')
    description = body.get('description')
    status = body.get('status')
    
    if status and status not in ['todo', 'in_progress', 'completed']:
        return create_error_response(400, 'Invalid status')
    
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
    
    # Build update expression and attribute values
    update_expression = "SET updated_at = :updated_at"
    expression_attribute_values = {
        ':updated_at': datetime.now().isoformat()
    }
    
    if title:
        update_expression += ", title = :title"
        expression_attribute_values[':title'] = title
    
    if description is not None:
        update_expression += ", description = :description"
        expression_attribute_values[':description'] = description
    
    if status:
        update_expression += ", #status = :status"
        expression_attribute_values[':status'] = status
    
    # Update task
    try:
        # Use expression_attribute_names if we're updating status (reserved keyword)
        expression_attribute_names = {'#status': 'status'} if status else None
        
        response = tasks_table.update_item(
            Key={'task_id': task_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ExpressionAttributeNames=expression_attribute_names if expression_attribute_names else None,
            ReturnValues='ALL_NEW'
        )
        
        updated_task = response.get('Attributes', {})
    except Exception as e:
        print(f"Error updating item in DynamoDB: {str(e)}")
        return create_error_response(500, 'Error updating task')
    
    # Return response
    return create_success_response(200, updated_task)