import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {Code, Repository} from "aws-cdk-lib/aws-codecommit";
import {SubnetType, Vpc} from "aws-cdk-lib/aws-ec2";
import {Effect, ManagedPolicy, PolicyStatement, Role, ServicePrincipal} from "aws-cdk-lib/aws-iam";
import {CfnNotebookInstance} from "aws-cdk-lib/aws-sagemaker";
import * as path from "node:path";

export class FsiGenaiDemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const demoRepository = new Repository(this, 'Repository', {
      repositoryName: 'fsi-demo-space',
      code: Code.fromDirectory(path.join(__dirname, 'fsidemo-assets/'), 'develop'),
    });

    const defaultVpc = Vpc.fromLookup(this, 'VPC', { isDefault: true });
    const vpcSubnets = defaultVpc.selectSubnets({ subnetType: SubnetType.PUBLIC });

    const sagemakerExecutionRole = new Role(this, 'SageMakerExecutionRole', {
      assumedBy: new ServicePrincipal('sagemaker.amazonaws.com'),
      roleName: `SageMakerExecutionRole-${id}`,
    });
    sagemakerExecutionRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonSageMakerFullAccess'));
    sagemakerExecutionRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonBedrockFullAccess'));
    sagemakerExecutionRole.addToPolicy(
        new PolicyStatement({
          effect: Effect.ALLOW,
          resources: [demoRepository.repositoryArn],
          actions: ['codecommit:*'],
        }),
    );
    const userSettings = {
      executionRole: sagemakerExecutionRole.roleArn,
    };

    const notebook = new CfnNotebookInstance(this, 'notebook-instance', {
      instanceType: 'ml.t3.medium',
      roleArn: sagemakerExecutionRole.roleArn,
      notebookInstanceName: 'sample-notebook',
      volumeSizeInGb: 120,
      defaultCodeRepository: demoRepository.repositoryCloneUrlHttp,
    });
  }
}
