const { DynamoDBclient} = require('@aws-sdk/client-dynamodb');
const client = new DynamoDBclient({})

module.exports = client;

