import { ServerResponse } from '../../lib/server-response';
import { getSubmission } from '../../dynamo/submissions';
import { Submission } from '../../models/submission';
import { makeGatewayHandler } from '../../lib/make-handler';
import { expectEnv } from '../../lib/handler-validators/require-env';
import { expectAuth } from '../../lib/handler-validators/expect-auth';

export const get = makeGatewayHandler()
	.use(expectEnv('JWT_SECRET'))
	.use(expectEnv('DYNAMODB_SUBMISSIONS_TABLE'))
	.use(expectAuth())
	.asHandler(async middlewareData => {
		const userCpf = middlewareData.tokenContent.cpf;
		let submission: Submission | null;

		try {
			submission = await getSubmission(userCpf, middlewareData.DYNAMODB_SUBMISSIONS_TABLE);
		} catch (e) {
			console.log(e);
			return ServerResponse.internalError();
		}

		return ServerResponse.success(submission);
	});
