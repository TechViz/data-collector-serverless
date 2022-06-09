import aws from 'aws-sdk';
import { PreInitializationUser } from '../models/pre-initialization-user';

export async function createPreInitializationUser(
	email: string,
	accessKey: string,
	DYNAMODB_PRE_INITIALIZATION_USERS_TABLE: string,
) {
	const docClient = new aws.DynamoDB.DocumentClient();

	const Item: PreInitializationUser = {
		email,
		accessKey,
		creationDate: Date.now(),
	};

	await docClient.put({ TableName: DYNAMODB_PRE_INITIALIZATION_USERS_TABLE, Item }).promise();

	return Item;
}

export async function getPreInitializationUser(
	email: string,
	DYNAMODB_PRE_INITIALIZATION_USERS_TABLE: string,
) {
	const docClient = new aws.DynamoDB.DocumentClient();

	const result = await docClient
		.get({ TableName: DYNAMODB_PRE_INITIALIZATION_USERS_TABLE, Key: { email } })
		.promise();
	if (!result.Item) {
		return null;
	}

	return result.Item as unknown as PreInitializationUser;
}

export async function doesUserExist(
	email: string,
	DYNAMODB_PRE_INITIALIZATION_USERS_TABLE: string,
) {
	if (await getPreInitializationUser(email, DYNAMODB_PRE_INITIALIZATION_USERS_TABLE)) return true;
	return false;
}

export async function doesUserDoesNotExist(
	email: string,
	DYNAMODB_PRE_INITIALIZATION_USERS_TABLE: string,
) {
	return !(await doesUserExist(email, DYNAMODB_PRE_INITIALIZATION_USERS_TABLE));
}
