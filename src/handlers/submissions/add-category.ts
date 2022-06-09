import { ServerResponse } from '../../lib/server-response';
import { addCategoryToSubmission, createSubmission, getSubmission } from '../../dynamo/submissions';
import { Submission, SubmissionCategory } from '../../models/submission';
import { makeGatewayHandler } from '../../lib/make-handler';
import { expectEnv } from '../../lib/handler-validators/require-env';
import { expectBody } from '../../lib/handler-validators/expect-body';
import { expectAuth } from '../../lib/handler-validators/expect-auth';
import { validateBody } from '../../lib/handler-validators/validate-body';
import v8n from 'v8n';
import { HTTPStatusCode } from '../../lib/server-response/status-codes';

export const addCategory = makeGatewayHandler()
	.use(expectEnv('JWT_SECRET'))
	.use(expectEnv('DYNAMODB_SUBMISSIONS_TABLE'))
	.use(expectBody())
	.use(validateBody<{ [name: string]: SubmissionCategory }>(v8n().object().not.empty()))
	.use(expectAuth())
	.asHandler(async middlewareData => {
		const userCpf = middlewareData.tokenContent.cpf;
		const body = middlewareData.body;

		if (Object.values(body).some(category => typeof category !== 'object')) {
			return ServerResponse.error(
				HTTPStatusCode.CLIENT_ERROR.C400_BAD_REQUEST,
				'Invalid category contents',
			);
		}

		let submission: Submission;

		try {
			const result = await getSubmission(userCpf, middlewareData.DYNAMODB_SUBMISSIONS_TABLE);
			if (!result) {
				submission = await createSubmission(
					userCpf,
					body,
					middlewareData.DYNAMODB_SUBMISSIONS_TABLE,
				);
				return ServerResponse.success(submission, 'Categoria salva com sucesso!');
			} else {
				submission = result;
			}
		} catch (e) {
			console.log(e);
			return ServerResponse.internalError();
		}
		console.log('Submission is now', submission);

		const result = await addCategoryToSubmission(
			userCpf,
			body,
			middlewareData.DYNAMODB_SUBMISSIONS_TABLE,
		);

		return ServerResponse.success(result, 'Formulário submetido com sucesso');
	});
