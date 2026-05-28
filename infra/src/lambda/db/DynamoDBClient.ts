import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const clientConfig: {
  endpoint?: string;
  credentials?: {
    accessKeyId: 'local';
    secretAccessKey: 'local';
  };
} = {
  endpoint: process.env.DYNAMODB_ENDPOINT,
};
if (process.env.ENV_TYPE === 'LOCAL') {
  clientConfig['credentials'] = {
    accessKeyId: 'local',
    secretAccessKey: 'local',
  };
}

export const dynamoDBDocumentClient = DynamoDBDocumentClient.from(new DynamoDBClient(clientConfig));
