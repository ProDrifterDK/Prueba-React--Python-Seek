import json
import boto3
import os
from boto3.dynamodb.conditions import Key, Attr
from ..auth.utils import verify_token, create_error_response, create_success_response

def lambda_handler(event, context):
    """
    Lambda function to get task statistics using boto3 and DynamoDB
    """
    # Verify token
    user = verify_token(event)
    if not user:
        return create_error_response(401, 'Unauthorized')
    
    # Initialize DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    tasks_table = dynamodb.Table('Tasks')
    
    # Query tasks by user_id using the UserIdIndex
    try:
        # Get all tasks for the user
        response = tasks_table.query(
            IndexName='UserIdIndex',
            KeyConditionExpression=Key('user_id').eq(user['user_id'])
        )
        tasks = response.get('Items', [])
        
        # Handle pagination if there are more items
        while 'LastEvaluatedKey' in response:
            response = tasks_table.query(
                IndexName='UserIdIndex',
                KeyConditionExpression=Key('user_id').eq(user['user_id']),
                ExclusiveStartKey=response['LastEvaluatedKey']
            )
            tasks.extend(response.get('Items', []))
        
        # Count tasks by status
        todo_count = sum(1 for task in tasks if task.get('status') == 'todo')
        in_progress_count = sum(1 for task in tasks if task.get('status') == 'in_progress')
        completed_count = sum(1 for task in tasks if task.get('status') == 'completed')
        total_count = len(tasks)
        
        # Create statistics
        stats = {
            'total': total_count,
            'todo': todo_count,
            'in_progress': in_progress_count,
            'completed': completed_count
        }
    except Exception as e:
        print(f"Error querying DynamoDB: {str(e)}")
        return create_error_response(500, 'Error retrieving task statistics')
    
    # Return response
    return create_success_response(200, stats)