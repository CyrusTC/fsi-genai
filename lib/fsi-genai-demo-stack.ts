import * as cdk from "aws-cdk-lib";
import { Code, Repository } from "aws-cdk-lib/aws-codecommit";
import {
  Effect,
  ManagedPolicy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { CfnNotebookInstance } from "aws-cdk-lib/aws-sagemaker";
import { Construct } from "constructs";
import * as path from "node:path";

export class FsiGenaiDemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const demoRepository = new Repository(this, "Repository", {
      repositoryName: "fsi-demo-space",
      code: Code.fromDirectory(
        path.join(__dirname, "fsidemo-assets/"),
        "develop"
      ),
    });

    const sagemakerExecutionRole = new Role(this, "SageMakerExecutionRole", {
      assumedBy: new ServicePrincipal("sagemaker.amazonaws.com"),
      roleName: `SageMakerExecutionRole-${id}`,
    });
    sagemakerExecutionRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("AmazonSageMakerFullAccess")
    );
    sagemakerExecutionRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("AmazonBedrockFullAccess")
    );
    sagemakerExecutionRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: [demoRepository.repositoryArn],
        actions: ["codecommit:*"],
      })
    );
    const userSettings = {
      executionRole: sagemakerExecutionRole.roleArn,
    };

    const notebook = new CfnNotebookInstance(this, "notebook-instance", {
      instanceType: "ml.t3.medium",
      roleArn: sagemakerExecutionRole.roleArn,
      notebookInstanceName: "sample-notebook",
      volumeSizeInGb: 120,
      defaultCodeRepository: demoRepository.repositoryCloneUrlHttp,
    });
  }
}
