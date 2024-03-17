#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import "source-map-support/register";
import { BrIamStack } from "../lib/br-iam-stack";
import { FsiGenaiDemoStack } from "../lib/fsi-genai-demo-stack";

const app = new cdk.App();
new FsiGenaiDemoStack(app, "FsiGenaiDemoStack", {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: "us-west-2" },
});

new BrIamStack(app, "BrIamStack", {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: "us-west-2" },
});
