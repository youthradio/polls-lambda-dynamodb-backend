# Polls Lambda / Dynamodb backend

Setting up local env

### Local Environment 


.aws/credentials

```bash
aws configure

[local]
AWS Access Key ID: "fakeMyKeyId"
AWS Secret Access Key: "fakeSecretAccessKey"
```

OSZ Instal local dynamodb
```bash

$ brew cask install dynamodb-local
$ dynamodb-local & 

test 

$ aws dynamodb list-tables --endpoint-url http://localhost:8000   
```

### Create table

```bash
create table 

$ AWS_PROFILE=your aws dynamodb create-table --cli-input-json  file://schemas/table.json

or

$ npm run aws:create-table
```