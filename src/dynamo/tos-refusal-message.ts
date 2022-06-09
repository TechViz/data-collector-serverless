import aws from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { TOSRefusalMessage } from '../models/tos-refusal-message';

export async function createTOSRefusalMessage(
	message: string,
	DYNAMODB_TOS_REFUSAL_MESSAGE_TABLE: string,
) {
	const docClient = new aws.DynamoDB.DocumentClient();

	const Item: TOSRefusalMessage = {
		id: uuidv4(),
		message,
		creationDate: Date.now(),
	};

	await docClient.put({ TableName: DYNAMODB_TOS_REFUSAL_MESSAGE_TABLE, Item }).promise();
	return Item;
}
