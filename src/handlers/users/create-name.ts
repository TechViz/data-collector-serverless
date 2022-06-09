import v8n from 'v8n';
import { addNameToUser } from '../../dynamo/users';
import { expectBody } from '../../lib/handler-validators/expect-body';
import { expectEnv } from '../../lib/handler-validators/require-env';
import { validateBody } from '../../lib/handler-validators/validate-body';
import { makeGatewayHandler } from '../../lib/make-handler';
import { ServerResponse } from '../../lib/server-response';
import { User } from '../../models/user';
import { expectAuth } from '../../lib/handler-validators/expect-auth';

export const createName = makeGatewayHandler()
	.use(expectEnv('JWT_SECRET'))
	.use(expectEnv('DYNAMODB_USERS_TABLE'))
	.use(expectBody())
	.use(expectAuth())
	.use(
		validateBody<{ name: string }>(
			v8n().schema({
				name: v8n().string().not.empty(),
			}),
		),
	)
	.asHandler(async middlewareData => {
		let user: User;
		try {
			user = await addNameToUser(
				middlewareData.tokenContent.cpf,
				middlewareData.body.name,
				middlewareData.DYNAMODB_USERS_TABLE,
			);
		} catch (e) {
			console.error('Failed to update user name', e);
			return ServerResponse.internalError();
		}

		return ServerResponse.success(
			{ user: { ...user, hashedPassword: null } },
			'Nome mudado com sucesso',
		);
	});
