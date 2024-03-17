import * as cdk from "aws-cdk-lib";
import { Policy, PolicyStatement, User } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export class BrIamStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const user = new User(this, "IamUser", {
      userName: "BrIamStack-BrClient",
    });

    const policy = new Policy(this, "Policy", {
      policyName: "IamUserPolicy",
      statements: [
        new PolicyStatement({
          actions: [
            "bedrock:InvokeModel",
            "bedrock:InvokeModelWithResponseStream",
          ],
          resources: ["arn:aws:bedrock:*::foundation-model/*"],
        }),
      ],
    });

    policy.attachToUser(user);
  }
}
