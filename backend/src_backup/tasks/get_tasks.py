import json
import boto3
import os
from boto3.dynamodb.conditions import Key
from ..auth.utils import verify_token, create_error_response, create_success_response

def lambda_handler(event, context):
    """
    Lambda function to get all tasks for a user using boto3 and DynamoDB
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
    except Exception as e:
        print(f"Error querying DynamoDB: {str(e)}")
        return create_error_response(500, 'Error retrieving tasks')
    
    # Return response
    return create_success_response(200, tasks)