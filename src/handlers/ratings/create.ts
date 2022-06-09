import { createRating } from '../../dynamo/ratings';
import { expectAuth } from '../../lib/handler-validators/expect-auth';
import { expectBody } from '../../lib/handler-validators/expect-body';
import { validateBody } from '../../lib/handler-validators/validate-body';
import { makeGatewayHandler } from '../../lib/make-handler';
import { ServerResponse } from '../../lib/server-response';
import { Rating } from '../../models/rating';
import v8n from 'v8n';
import { expectEnv } from '../../lib/handler-validators/require-env';

export const create = makeGatewayHandler()
	.use(expectEnv('DYNAMODB_RATINGS_TABLE'))
	.use(expectEnv('JWT_SECRET'))
	.use(expectAuth())
	.use(expectBody())
	.use(
		validateBody<{ score: number; message?: string }>(
			v8n().schema({
				score: v8n().number().not.empty(),
				message: v8n().string(),
			}),
		),
	)
	.asHandler(async middlewareData => {
		const cpf = middlewareData.tokenContent.cpf;
		const body = middlewareData.body;

		const { score, message } = body;

		let rating: Rating;
		try {
			rating = await createRating(cpf, score, message, middlewareData.DYNAMODB_RATINGS_TABLE);
		} catch (e) {
			console.error(e);
			return ServerResponse.internalError();
		}
		return ServerResponse.success(rating, 'Sucesso');
	});
