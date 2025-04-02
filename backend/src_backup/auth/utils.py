import jwt
import os
import json
from datetime import datetime

def verify_token(event):
    """
    Verify JWT token from Authorization header
    
    Args:
        event: Lambda event object
        
    Returns:
        dict: User data from token if valid, None otherwise
    """
    # Get token from Authorization header
    auth_header = event.get('headers', {}).get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.split(' ')[1]
    
    try:
        # Decode token
        payload = jwt.decode(token, os.environ['JWT_SECRET'], algorithms=['HS256'])
        
        # Check if token is expired
        if 'exp' in payload and datetime.utcnow().timestamp() > payload['exp']:
            return None
        
        return payload
    except Exception as e:
        print(f"Error verifying token: {str(e)}")
        return None

def create_error_response(status_code, message):
    """
    Create error response
    
    Args:
        status_code: HTTP status code
        message: Error message
        
    Returns:
        dict: Error response
    """
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': True,
            'Content-Type': 'application/json'
        },
        'body': json.dumps({'message': message})
    }

def create_success_response(status_code, data):
    """
    Create success response
    
    Args:
        status_code: HTTP status code
        data: Response data
        
    Returns:
        dict: Success response
    """
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': True,
            'Content-Type': 'application/json'
        },
        'body': json.dumps(data)
    }

def create_dynamodb_tables():
    """
    Create DynamoDB tables for the application
    
    Returns:
        dict: Created tables
    """
    import boto3
    
    dynamodb = boto3.resource('dynamodb')
    
    # Create Users table
    users_table = dynamodb.create_table(
        TableName='Users',
        KeySchema=[
            {'AttributeName': 'user_id', 'KeyType': 'HASH'}
        ],
        AttributeDefinitions=[
            {'AttributeName': 'user_id', 'AttributeType': 'S'},
            {'AttributeName': 'username', 'AttributeType': 'S'}
        ],
        GlobalSecondaryIndexes=[
            {
                'IndexName': 'UsernameIndex',
                'KeySchema': [
                    {'AttributeName': 'username', 'KeyType': 'HASH'}
                ],
                'Projection': {'ProjectionType': 'ALL'},
                'ProvisionedThroughput': {
                    'ReadCapacityUnits': 5,
                    'WriteCapacityUnits': 5
                }
            }
        ],
        ProvisionedThroughput={'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
    )
    
    # Create Tasks table
    tasks_table = dynamodb.create_table(
        TableName='Tasks',
        KeySchema=[
            {'AttributeName': 'task_id', 'KeyType': 'HASH'}
        ],
        AttributeDefinitions=[
            {'AttributeName': 'task_id', 'AttributeType': 'S'},
            {'AttributeName': 'user_id', 'AttributeType': 'S'}
        ],
        GlobalSecondaryIndexes=[
            {
                'IndexName': 'UserIdIndex',
                'KeySchema': [
                    {'AttributeName': 'user_id', 'KeyType': 'HASH'}
                ],
                'Projection': {'ProjectionType': 'ALL'},
                'ProvisionedThroughput': {
                    'ReadCapacityUnits': 5,
                    'WriteCapacityUnits': 5
                }
            }
        ],
        ProvisionedThroughput={'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
    )
    
    return {
        'users_table': users_table,
        'tasks_table': tasks_table
    }