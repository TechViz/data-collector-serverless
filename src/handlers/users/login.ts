import { expectBody } from '../../lib/handler-validators/expect-body';
import { expectEnv } from '../../lib/handler-validators/require-env';
import { validateBody } from '../../lib/handler-validators/validate-body';
import { makeGatewayHandler } from '../../lib/make-handler';
import v8n from 'v8n';
import { ServerResponse } from '../../lib/server-response';
import { HTTPStatusCode } from '../../lib/server-response/status-codes';
import { generateJWT } from '../../lib/jwt';
import bcrypt from 'bcryptjs';
import { getSubmission } from '../../dynamo/submissions';
import { Submission } from '../../models/submission';
import { User } from '../../models/user';
import { getUser } from '../../dynamo/users';
import { expectAccessKeyInBody } from '../../lib/handler-validators/expect-access-key';

export const login = makeGatewayHandler()
	.use(expectEnv('JWT_SECRET'))
	.use(expectEnv('DYNAMODB_USERS_TABLE'))
	.use(expectEnv('DYNAMODB_ACCESS_KEY_TABLE'))
	.use(expectEnv('DYNAMODB_SUBMISSIONS_TABLE'))
	.use(expectBody())
	.use(
		validateBody<{ cpf: string; password: string; accessKey: string }>(
			v8n().schema({
				cpf: v8n().string().not.empty(),
				password: v8n().string().not.empty(),
				accessKey: v8n().string().not.empty(),
			}),
		),
	)
	.use(expectAccessKeyInBody())
	.asHandler(async middlewareData => {
		const body = middlewareData.body;

		let user: User | null;
		let submissions: Submission | null;

		try {
			[user, submissions] = await Promise.all([
				getUser(middlewareData.body.cpf, middlewareData.DYNAMODB_USERS_TABLE),
				getSubmission(middlewareData.body.cpf, middlewareData.DYNAMODB_SUBMISSIONS_TABLE),
			]);
		} catch (e) {
			console.error('Failed to fetch user or submissions', e);
			return ServerResponse.internalError();
		}

		if (!user) {
			return ServerResponse.error(
				HTTPStatusCode.CLIENT_ERROR.C401_UNAUTHORIZED,
				'CPF ou senha incorretos',
			);
		}

		if (!bcrypt.compareSync(body.password, user.hashedPassword)) {
			return ServerResponse.error(
				HTTPStatusCode.CLIENT_ERROR.C401_UNAUTHORIZED,
				'CPF ou senha incorretos',
			);
		}

		const token = generateJWT(
			{ cpf: user.cpf },
			middlewareData.accessKey.expirationDate,
			middlewareData.JWT_SECRET,
		);

		const response = ServerResponse.success({ user, token, submissions });
		response.headers['Authorization'] = token;

		return response;
	});
