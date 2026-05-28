import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { dynamoDBDocumentClient } from './db/DynamoDBClient';

export const handler: APIGatewayProxyHandler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN ?? '',
    'Content-Type': 'application/json',
  };

  try {
    const formId = event.queryStringParameters?.formId;
    if (!formId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'formId が指定されていません。' }),
      };
    }

    const command = new GetCommand({
      TableName: process.env.TABLE_NAME,
      Key: { formId },
    });

    const response = await dynamoDBDocumentClient.send(command);

    if (!response.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: '指定されたフォームが見つかりません。' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response.Item),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'サーバー内部エラーが発生しました。' }),
    };
  }
};
