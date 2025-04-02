import boto3
import os
import json
import time

def create_dynamodb_tables():
    """
    Create DynamoDB tables for the application
    """
    print("Creating DynamoDB tables...")
    
    # Initialize DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    
    # Create Users table
    try:
        print("Creating Users table...")
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
        print("Users table created successfully.")
    except dynamodb.meta.client.exceptions.ResourceInUseException:
        print("Users table already exists.")
        users_table = dynamodb.Table('Users')
    
    # Create Tasks table
    try:
        print("Creating Tasks table...")
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
        print("Tasks table created successfully.")
    except dynamodb.meta.client.exceptions.ResourceInUseException:
        print("Tasks table already exists.")
        tasks_table = dynamodb.Table('Tasks')
    
    # Wait for tables to be created
    print("Waiting for tables to be created...")
    users_table.meta.client.get_waiter('table_exists').wait(TableName='Users')
    tasks_table.meta.client.get_waiter('table_exists').wait(TableName='Tasks')
    
    print("Tables created successfully.")
    return {
        'users_table': users_table,
        'tasks_table': tasks_table
    }

def lambda_handler(event, context):
    """
    Lambda function to set up DynamoDB tables
    """
    try:
        tables = create_dynamodb_tables()
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': True,
            },
            'body': json.dumps({'message': 'DynamoDB tables created successfully'})
        }
    except Exception as e:
        print(f"Error creating DynamoDB tables: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': True,
            },
            'body': json.dumps({'message': f'Error creating DynamoDB tables: {str(e)}'})
        }

if __name__ == '__main__':
    # If running locally, create tables
    create_dynamodb_tables()