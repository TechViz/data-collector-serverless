import { AccessKey } from '../../models/access-key';
import v8n from 'v8n';
import { expectBody } from '../../lib/handler-validators/expect-body';
import { expectEnv } from '../../lib/handler-validators/require-env';
import { validateBody } from '../../lib/handler-validators/validate-body';
import { makeGatewayHandler } from '../../lib/make-handler';
import { ServerResponse } from '../../lib/server-response';
import { HTTPStatusCode } from '../../lib/server-response/status-codes';
import { getAccessKey } from '../../dynamo/access-key';
import { getPreInitializationUser } from '../../dynamo/pre-initialization-user';
import { PreInitializationUser } from '../../models/pre-initialization-user';

export const fetchAccessKey = makeGatewayHandler()
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

		let user: PreInitializationUser | null;
		try {
			user = await getPreInitializationUser(
				email,
				middlewareData.DYNAMODB_PRE_INITIALIZATION_USERS_TABLE,
			);
		} catch (e) {
			console.error(`Failed to fetch user ${email}`);
			return ServerResponse.internalError();
		}

		if (!user) {
			return ServerResponse.error(
				HTTPStatusCode.CLIENT_ERROR.C404_NOT_FOUND,
				'User with this email not found',
			);
		}

		if (!user.accessKey) {
			return ServerResponse.error(
				HTTPStatusCode.CLIENT_ERROR.C404_NOT_FOUND,
				`This users doesn't have an access key`,
			);
		}

		let accessKey: AccessKey | null;

		try {
			accessKey = await getAccessKey(user.accessKey, middlewareData.DYNAMODB_ACCESS_KEY_TABLE);
		} catch (e) {
			console.error('Failed to fetch access key', e);
			return ServerResponse.internalError();
		}

		if (!accessKey) {
			return ServerResponse.error(
				HTTPStatusCode.CLIENT_ERROR.C404_NOT_FOUND,
				'AccessKey not found',
			);
		}

		return ServerResponse.success({ accessKey }, 'Chave buscada com sucesso');
	});
