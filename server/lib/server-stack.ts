import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb'; // 👈 DynamoDBのモジュールをインポート
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ServerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new Table(this, 'FormMetadataTable', {
      tableName: 'MetaFormFieldsTable',
      partitionKey: { name: 'FormId', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
