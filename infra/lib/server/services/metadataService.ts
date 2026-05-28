import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RemovalPolicy } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

export class MetadataService extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: {
      api: RestApi;
    },
  ) {
    super(scope, id);
    const table = new Table(this, 'FormMetadataTable', {
      tableName: process.env.TABLE_NAME ?? 'MetaFormFieldsTable',
      partitionKey: { name: 'formId', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const getMetadataLambda = new NodejsFunction(this, 'GetMetadataHandler', {
      runtime: Runtime.NODEJS_24_X,
      entry: 'src/lambda/get-metadata.ts',
      handler: 'handler',
      environment: {
        TABLE_NAME: table.tableName,
        ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN ?? '*',
        ENV_TYPE: process.env.ENV_TYPE ?? 'PROD',
      },
    });

    table.grantReadData(getMetadataLambda);

    const metadataResource = props.api.root.addResource('metadata');
    metadataResource.addMethod('GET', new LambdaIntegration(getMetadataLambda));
  }
}
