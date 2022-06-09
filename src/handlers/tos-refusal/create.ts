import v8n from 'v8n';
import { createTOSRefusalMessage } from '../../dynamo/tos-refusal-message';
import { expectBody } from '../../lib/handler-validators/expect-body';
import { expectEnv } from '../../lib/handler-validators/require-env';
import { validateBody } from '../../lib/handler-validators/validate-body';
import { makeGatewayHandler } from '../../lib/make-handler';
import { ServerResponse } from '../../lib/server-response';

export const create = makeGatewayHandler()
	.use(expectEnv('DYNAMODB_TOS_REFUSAL_MESSAGE_TABLE'))
	.use(expectBody())
	.use(
		validateBody<{ message: string }>(
			v8n().schema({
				message: v8n().string().not.empty(),
			}),
		),
	)
	.asHandler(async middlewareData => {
		try {
			await createTOSRefusalMessage(
				middlewareData.body.message,
				middlewareData.DYNAMODB_TOS_REFUSAL_MESSAGE_TABLE,
			);
			return ServerResponse.success(undefined, '');
		} catch (e) {
			console.error('Failed to create TOS Resfusal Message', e);
			return ServerResponse.internalError();
		}
	});
