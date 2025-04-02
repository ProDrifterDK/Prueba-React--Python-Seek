import json
import boto3
import uuid
import bcrypt
import os
from datetime import datetime

def lambda_handler(event, context):
    """
    Lambda function to handle user registration using boto3 and DynamoDB
    """
    # Parse request body
    try:
        body = json.loads(event['body'])
    except:
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': True,
            },
            'body': json.dumps({'message': 'Invalid request body'})
        }
    
    username = body.get('username')
    password = body.get('password')
    
    # Validate input
    if not username or not password:
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': True,
            },
            'body': json.dumps({'message': 'Username and password are required'})
        }
    
    # Initialize DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    users_table = dynamodb.Table('Users')
    
    # Check if username already exists
    try:
        # Query the UsernameIndex to check if username exists
        response = users_table.query(
            IndexName='UsernameIndex',
            KeyConditionExpression=boto3.dynamodb.conditions.Key('username').eq(username)
        )
        
        if response.get('Items'):
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': True,
                },
                'body': json.dumps({'message': 'Username already exists'})
            }
    except Exception as e:
        print(f"Error querying DynamoDB: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': True,
            },
            'body': json.dumps({'message': 'Error checking username'})
        }
    
    # Hash password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Create user
    user_id = str(uuid.uuid4())
    created_at = datetime.now().isoformat()
    
    # Create user item
    user = {
        'user_id': user_id,
        'username': username,
        'password': hashed_password,
        'created_at': created_at
    }
    
    # Put item in DynamoDB
    try:
        users_table.put_item(Item=user)
    except Exception as e:
        print(f"Error putting item in DynamoDB: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': True,
            },
            'body': json.dumps({'message': 'Error creating user'})
        }
    
    # Return response
    return {
        'statusCode': 201,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': True,
        },
        'body': json.dumps({
            'user_id': user_id,
            'username': username,
            'created_at': created_at
        })
    }