import { AccessKey } from '../../models/access-key';
import v8n from 'v8n';
import { createPreInitializationUser } from '../../dynamo/pre-initialization-user';
import { expectBody } from '../../lib/handler-validators/expect-body';
import { expectEnv } from '../../lib/handler-validators/require-env';
import { validateBody } from '../../lib/handler-validators/validate-body';
import { makeGatewayHandler } from '../../lib/make-handler';
import { ServerResponse } from '../../lib/server-response';
import { HTTPStatusCode } from '../../lib/server-response/status-codes';
import { createAccessKey } from '../../dynamo/access-key';
import { validateEmail } from '../../lib/validate-email';

export const create = makeGatewayHandler()
	.use(expectEnv('SIGNUP_SECRET'))
	.use(expectEnv('DYNAMODB_PRE_INITIALIZATION_USERS_TABLE'))
	.use(expectEnv('DYNAMODB_ACCESS_KEY_TABLE'))
	.use(expectBody())
	.use(
		validateBody<{ secret: string; email: string }>(
			v8n().schema({
				secret: v8n().string().not.empty(),
				email: v8n().string().not.empty(),
			}),
		),
	)
	.asHandler(async middlewareData => {
		const body = middlewareData.body;

		const isSecretInvalid = body.secret !== middlewareData.SIGNUP_SECRET;
		if (isSecretInvalid) {
			return ServerResponse.error(HTTPStatusCode.CLIENT_ERROR.C400_BAD_REQUEST, 'Invalid secret');
		}

		const email = body.email;

		if (!validateEmail(email)) {
			return ServerResponse.error(
				HTTPStatusCode.CLIENT_ERROR.C400_BAD_REQUEST,
				'Formato de e-mail inválido',
			);
		}

		let accessKey: AccessKey;

		try {
			accessKey = await createAccessKey(email, middlewareData.DYNAMODB_ACCESS_KEY_TABLE);
		} catch (e) {
			console.error('Failed to create access key', e);
			return ServerResponse.internalError();
		}

		try {
			const user = await createPreInitializationUser(
				email,
				accessKey.key,
				middlewareData.DYNAMODB_PRE_INITIALIZATION_USERS_TABLE,
			);
			return ServerResponse.success(
				{ user, accessKey: accessKey.key },
				'Usuário criado com sucesso',
			);
		} catch (e) {
			console.error('Failed to create user', e);
			return ServerResponse.internalError();
		}
	});
