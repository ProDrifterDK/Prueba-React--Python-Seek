import json
import boto3
import bcrypt
import jwt
import os
from datetime import datetime, timedelta

def lambda_handler(event, context):
    """
    Lambda function to handle user login using boto3 and DynamoDB
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
    
    # Find user
    try:
        # Query the UsernameIndex to find the user
        response = users_table.query(
            IndexName='UsernameIndex',
            KeyConditionExpression=boto3.dynamodb.conditions.Key('username').eq(username)
        )
        
        users = response.get('Items', [])
        if not users:
            return {
                'statusCode': 401,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': True,
                },
                'body': json.dumps({'message': 'Invalid credentials'})
            }
        
        user = users[0]
    except Exception as e:
        print(f"Error querying DynamoDB: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': True,
            },
            'body': json.dumps({'message': 'Error finding user'})
        }
    
    # Verify password
    try:
        if not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            return {
                'statusCode': 401,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': True,
                },
                'body': json.dumps({'message': 'Invalid credentials'})
            }
    except Exception as e:
        print(f"Error verifying password: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': True,
            },
            'body': json.dumps({'message': 'Error verifying credentials'})
        }
    
    # Generate JWT token
    try:
        expiration = datetime.utcnow() + timedelta(days=1)
        payload = {
            'user_id': user['user_id'],
            'username': user['username'],
            'exp': expiration
        }
        
        token = jwt.encode(payload, os.environ['JWT_SECRET'], algorithm='HS256')
    except Exception as e:
        print(f"Error generating token: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': True,
            },
            'body': json.dumps({'message': 'Error generating token'})
        }
    
    # Return response
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': True,
        },
        'body': json.dumps({
            'token': token,
            'user': {
                'user_id': user['user_id'],
                'username': user['username']
            }
        })
    }