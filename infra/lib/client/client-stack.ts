import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import {
  CachedMethods,
  Distribution,
  ErrorResponse,
  ResponseHeadersPolicy,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import path from 'path';

export class ClientStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const websiteBucket = new Bucket(this, 'MetaFormWebsiteBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    const distribution = new Distribution(this, 'MetaUiDistribution', {
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(websiteBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachedMethods: CachedMethods.CACHE_GET_HEAD,
        responseHeadersPolicy: new ResponseHeadersPolicy(this, 'CustomResponseHeadersPolicy', {
          corsBehavior: {
            accessControlAllowOrigins: ['*'],
            accessControlAllowMethods: ['GET', 'HEAD', 'OPTIONS'],
            accessControlAllowHeaders: ['*'],
            accessControlAllowCredentials: false,
            originOverride: true,
          },
        }),
      },
      errorResponses: [403, 404].map(
        (errorStatusCode): ErrorResponse => ({
          httpStatus: errorStatusCode,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: Duration.seconds(0),
        }),
      ),
      defaultRootObject: 'index.html',
    });

    new BucketDeployment(this, 'DeployMetaUi', {
      sources: [Source.asset(path.join(__dirname, '../../../dist/meta_ui/browser'))],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    new CfnOutput(this, 'MetaUiAppUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'The URL of the Angular Application',
    });
  }
}
