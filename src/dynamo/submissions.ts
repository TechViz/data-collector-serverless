import aws from 'aws-sdk';
import { Submission, SubmissionCategory } from '../models/submission';

export async function createSubmission(
	userCpf: string,
	categories: { [name: string]: SubmissionCategory },
	DYNAMODB_SUBMISSIONS_TABLE: string,
) {
	const docClient = new aws.DynamoDB.DocumentClient();

	const newCategories: typeof categories = {};
	for (let key of Object.keys(categories)) {
		(newCategories as any)[key] = { ...(categories as any)[key], creationDate: Date.now() };
	}

	const Item: Submission = {
		userCpf,
		categories: newCategories,
	};

	await docClient.put({ TableName: DYNAMODB_SUBMISSIONS_TABLE, Item }).promise();
	return Item;
}

export async function getSubmission(userCpf: string, DYNAMODB_SUBMISSIONS_TABLE: string) {
	const docClient = new aws.DynamoDB.DocumentClient();
	const result = await docClient
		.get({ TableName: DYNAMODB_SUBMISSIONS_TABLE, Key: { userCpf } })
		.promise();

	if (!result.Item) {
		return null;
	}

	return result.Item as unknown as Submission;
}

export async function readAllSubmissions(DYNAMODB_SUBMISSIONS_TABLE: string) {
	const docClient = new aws.DynamoDB.DocumentClient();

	const data = await docClient.scan({ TableName: DYNAMODB_SUBMISSIONS_TABLE }).promise();

	if (!data.Items) return null;
	return data.Items as Submission[];
}

export async function addCategoryToSubmission(
	userCpf: string,
	categories: { [name: string]: SubmissionCategory },
	DYNAMODB_SUBMISSIONS_TABLE: string,
) {
	const docClient = new aws.DynamoDB.DocumentClient();

	const UpdateExpression = `set ${Object.keys(categories)
		.map(name => `categories.${name} = :${name}`)
		.join(', ')}`;

	const newCategories: typeof categories = {};
	for (let key of Object.keys(categories)) {
		newCategories[`:${key}`] = {
			...categories[key],
			creationDate: Date.now(),
			categoryName: key,
		};
	}

	const data = await docClient
		.update({
			TableName: DYNAMODB_SUBMISSIONS_TABLE,
			Key: { userCpf },
			UpdateExpression,
			ExpressionAttributeValues: newCategories,
			ReturnValues: 'ALL_NEW',
		})
		.promise();

	return data.Attributes as SubmissionCategory;
}
