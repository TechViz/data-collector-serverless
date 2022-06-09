import aws from 'aws-sdk';
import { PreInitializationUser } from '../models/pre-initialization-user';
import { User } from '../models/user';

export async function createUser(
	initializationData: {
		cpf: string;
		hashedPassword: string;
	},
	uninitializedUser: PreInitializationUser,
	DYNAMODB_USERS_TABLE: string,
) {
	const docClient = new aws.DynamoDB.DocumentClient();

	const { hashedPassword, cpf } = initializationData;
	const { email, creationDate, accessKey } = uninitializedUser;

	// Don't use spread operator here to prevent unwanted keys to be stored in the DB
	const Item: User = {
		email,
		cpf,
		creationDate,
		hashedPassword,
		name: '', // The name will be provided after
		accessKey,
		initializationDate: Date.now(),
	};

	await docClient.put({ TableName: DYNAMODB_USERS_TABLE, Item }).promise();

	return Item;
}

export async function getUser(cpf: string, DYNAMODB_USERS_TABLE: string) {
	const docClient = new aws.DynamoDB.DocumentClient();

	const result = await docClient.get({ TableName: DYNAMODB_USERS_TABLE, Key: { cpf } }).promise();
	if (!result.Item) {
		return null;
	}

	return result.Item as unknown as User;
}

export async function doesUserExist(cpf: string, DYNAMODB_USERS_TABLE: string) {
	if (await getUser(cpf, DYNAMODB_USERS_TABLE)) return true;
	return false;
}

export async function doesUserDoesNotExist(cpf: string, DYNAMODB_USERS_TABLE: string) {
	return !(await doesUserExist(cpf, DYNAMODB_USERS_TABLE));
}

export async function addNameToUser(userCpf: string, name: string, DYNAMODB_USERS_TABLE: string) {
	const docClient = new aws.DynamoDB.DocumentClient();

	const data = await docClient
		.update({
			TableName: DYNAMODB_USERS_TABLE,
			Key: { cpf: userCpf },
			UpdateExpression: `set #un = :username`,
			ExpressionAttributeValues: { ':username': name },
			ExpressionAttributeNames: { '#un': 'name' },
			ReturnValues: 'ALL_NEW',
		})
		.promise();

	return data.Attributes as User;
}
