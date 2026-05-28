import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyHandler } from 'aws-lambda';
import z, { ZodError } from 'zod';
import { dynamoDBDocumentClient } from './db/DynamoDBClient';

const AnswersSchema = z.record(z.string().min(1), z.string().min(1));

export const handler: APIGatewayProxyHandler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN ?? '',
    'Content-Type': 'application/json',
  };

  try {
    const rawAnswers = event.queryStringParameters?.answers;
    if (!rawAnswers) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'answers が指定されていません。', test: event.body }),
      };
    }

    const validatedAnswers = AnswersSchema.parse(JSON.parse(rawAnswers));
    const id = crypto.randomUUID();

    const command = new PutCommand({
      TableName: process.env.TABLE_NAME,
      Item: {
        id,
        answers: Object.entries(validatedAnswers).reduce(
          (answers, [key, value]) => {
            answers.push({
              key,
              value,
            });
            return answers;
          },
          [] as {
            key: string;
            value: string;
          }[],
        ),
        createdAt: new Date().getTime(),
      },
    });

    await dynamoDBDocumentClient.send(command);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ id }),
    };
  } catch (error) {
    console.error(error);
    if (error instanceof ZodError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: '指定されたanswers の型が不適切です。',
          error: error.message,
        }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'サーバー内部エラーが発生しました。' }),
    };
  }
};
