import aws from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { Rating } from '../models/rating';

export async function createRating(
	userCpf: string,
	score: number,
	message: string = '',
	DYNAMODB_RATINGS_TABLE: string,
) {
	const docClient = new aws.DynamoDB.DocumentClient();

	const Item: Rating = {
		id: uuidv4(),
		userCpf,
		message,
		score,
		creationDate: Date.now(),
	};

	await docClient.put({ TableName: DYNAMODB_RATINGS_TABLE, Item }).promise();
	return Item;
}
