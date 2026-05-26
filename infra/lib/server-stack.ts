import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Cors, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';

export class ServerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new Table(this, 'FormMetadataTable', {
      tableName: process.env.TABLE_NAME ?? 'MetaFormFieldsTable',
      partitionKey: { name: 'formId', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const getMetadataLambda = new NodejsFunction(this, 'GetMetadataHandler', {
      runtime: Runtime.NODEJS_24_X,
      entry: 'src/lambda/get-metadata.ts',
      handler: 'handler',
      environment: {
        TABLE_NAME: table.tableName,
        ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN ?? '*',
      },
    });

    table.grantReadData(getMetadataLambda);

    const api = new RestApi(this, 'MetaUiApi', {
      restApiName: 'MetaUiApi-dev',
      defaultCorsPreflightOptions: {
        allowOrigins: [process.env.ALLOWED_ORIGIN ?? '*'],
        allowMethods: Cors.ALL_METHODS,
      },
    });

    const metadataResource = api.root.addResource('metadata');
    metadataResource.addMethod('GET', new LambdaIntegration(getMetadataLambda));
  }
}
