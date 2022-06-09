import aws from 'aws-sdk';
import { generateRandomAccessKey } from '../lib/generate-random-access-key';
import { AccessKey } from '../models/access-key';

const DAYS_TO_EXPIRE = 14;

export async function createAccessKey(userEmail: string, DYNAMODB_ACCESS_KEY_TABLE: string) {
	const docClient = new aws.DynamoDB.DocumentClient();

	const key = generateRandomAccessKey();
	const expirationDate = new Date();
	expirationDate.setDate(expirationDate.getDate() + DAYS_TO_EXPIRE);

	const Item: AccessKey = {
		key,
		creationDate: Date.now(),
		expirationDate: expirationDate.getTime(),
		userEmail,
		wasUsedToCreateLoginCredentials: false,
	};

	await docClient.put({ TableName: DYNAMODB_ACCESS_KEY_TABLE, Item }).promise();

	return Item;
}

export async function useAccessKeyToCreateLoginCredentials(
	key: string,
	DYNAMODB_ACCESS_KEY_TABLE: string,
) {
	const docClient = new aws.DynamoDB.DocumentClient();

	const data = await docClient
		.update({
			TableName: DYNAMODB_ACCESS_KEY_TABLE,
			Key: { key },
			UpdateExpression: `set #k = :val`,
			ExpressionAttributeValues: { ':val': true },
			ExpressionAttributeNames: { '#k': 'wasUsedToCreateLoginCredentials' },
			ReturnValues: 'ALL_NEW',
		})
		.promise();

	return data.Attributes as AccessKey;
}

export async function getAccessKey(key: string, DYNAMODB_USERS_TABLE: string) {
	const docClient = new aws.DynamoDB.DocumentClient();

	const result = await docClient.get({ TableName: DYNAMODB_USERS_TABLE, Key: { key } }).promise();
	if (!result.Item) {
		return null;
	}

	return result.Item as unknown as AccessKey;
}
