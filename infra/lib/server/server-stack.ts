import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { Cors, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { MetadataService } from './services/metadataService';
import { SaveAnswerService } from './services/saveAnswerService';

export class ServerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new RestApi(this, 'MetaUiApi', {
      restApiName: 'MetaUiApi-dev',
      defaultCorsPreflightOptions: {
        allowOrigins: [process.env.ALLOWED_ORIGIN ?? '*'],
        allowMethods: Cors.ALL_METHODS,
      },
    });

    new MetadataService(this, 'MetadataService', { api });
    new SaveAnswerService(this, 'SaveAnswerService', { api });
  }
}
