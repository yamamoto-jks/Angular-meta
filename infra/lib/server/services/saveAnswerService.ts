import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RemovalPolicy } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

export class SaveAnswerService extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: {
      api: RestApi;
    },
  ) {
    super(scope, id);

    const table = new Table(this, 'AnswersTable', {
      tableName: 'AnswersTable',
      partitionKey: { name: 'id', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const lambda = new NodejsFunction(this, 'SaveAnswerHandler', {
      runtime: Runtime.NODEJS_24_X,
      entry: 'src/lambda/save-answer.ts',
      handler: 'handler',
      environment: {
        TABLE_NAME: table.tableName,
        ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN ?? '*',
        ENV_TYPE: process.env.ENV_TYPE ?? 'PROD',
      },
    });

    table.grantWriteData(lambda);

    const answerResource = props.api.root.addResource('answer');
    answerResource.addMethod('POST', new LambdaIntegration(lambda));
  }
}
