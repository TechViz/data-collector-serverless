import { expectBody } from '../../lib/handler-validators/expect-body';
import { expectEnv } from '../../lib/handler-validators/require-env';
import { validateBody } from '../../lib/handler-validators/validate-body';
import { makeGatewayHandler } from '../../lib/make-handler';
import v8n from 'v8n';
import { ServerResponse } from '../../lib/server-response';
import { expectAccessKeyInBody } from '../../lib/handler-validators/expect-access-key';

export const validateAccessKey = makeGatewayHandler()
	.use(expectEnv('JWT_SECRET'))
	.use(expectEnv('DYNAMODB_ACCESS_KEY_TABLE'))
	.use(expectBody())
	.use(
		validateBody<{ accessKey: string }>(
			v8n().schema({
				accessKey: v8n().string().not.empty(),
			}),
		),
	)
	.use(expectAccessKeyInBody())
	.asHandler(async () => {
		return ServerResponse.success('Chave de acesso válida');
	});
