require('dotenv').config();
const fs = require('fs');
const policyTemplate = (logs, resources) => `{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "dynamodb:BatchGetItem",
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:BatchWriteItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem"
        ],
        "Resource": ${JSON.stringify(resources)}
      },
      {
        "Effect": "Allow",
        "Action": ["logs:CreateLogStream", "logs:PutLogEvents"],
        "Resource": "${logs}"
      },
      {
        "Effect": "Allow",
        "Action": "logs:CreateLogGroup",
        "Resource": "*"
      }
    ]
  }`;

const policy = policyTemplate(process.env.LOGS_ARN, [
  process.env.SESSION_TABLE_ARN,
  process.env.POLLS_TABLE_ARN,
]);

console.log(policy);

fs.writeFileSync('policies/access-dynamodb.json', policy);
