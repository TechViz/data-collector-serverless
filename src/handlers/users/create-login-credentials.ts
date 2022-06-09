import v8n from 'v8n';
import { createUser, getUser } from '../../dynamo/users';
import { expectBody } from '../../lib/handler-validators/expect-body';
import { expectEnv } from '../../lib/handler-validators/require-env';
import { validateBody } from '../../lib/handler-validators/validate-body';
import { makeGatewayHandler } from '../../lib/make-handler';
import { ServerResponse } from '../../lib/server-response';
import { HTTPStatusCode } from '../../lib/server-response/status-codes';
import { User } from '../../models/user';
import bcrypt from 'bcryptjs';
import { generateJWT } from '../../lib/jwt';
import { validateCpf } from '../../lib/validate-cpf';
import { getPreInitializationUser } from '../../dynamo/pre-initialization-user';
import { expectAccessKeyInBody } from '../../lib/handler-validators/expect-access-key';
import { useAccessKeyToCreateLoginCredentials } from '../../dynamo/access-key';

export const createLoginCredentials = makeGatewayHandler()
	.use(expectEnv('JWT_SECRET'))
	.use(expectEnv('DYNAMODB_USERS_TABLE'))
	.use(expectEnv('DYNAMODB_PRE_INITIALIZATION_USERS_TABLE'))
	.use(expectEnv('DYNAMODB_ACCESS_KEY_TABLE'))
	.use(expectBody())
	.use(
		validateBody<{ accessKey: string; password: string; cpf: string }>(
			v8n().schema({
				accessKey: v8n().string().not.empty(),
				password: v8n().string().not.empty(),
				cpf: v8n().string().not.empty(),
			}),
		),
	)
	.use(expectAccessKeyInBody())
	.asHandler(async middlewareData => {
		const body = middlewareData.body;

		if (!validateCpf(body.cpf)) {
			return ServerResponse.error(
				HTTPStatusCode.CLIENT_ERROR.C400_BAD_REQUEST,
				'CPF inválido. Ele deve ser no formato XXX.XXX.XXX-XX',
			);
		}

		if (middlewareData.accessKey.wasUsedToCreateLoginCredentials) {
			return ServerResponse.error(
				HTTPStatusCode.CLIENT_ERROR.C400_BAD_REQUEST,
				'Este link já foi usado para criar um usuário. Você tem certeza que esse é o seu primeiro acesso?',
			);
		}

		try {
			const user = await getUser(body.cpf, middlewareData.DYNAMODB_USERS_TABLE);
			if (user) {
				return ServerResponse.error(
					HTTPStatusCode.CLIENT_ERROR.C400_BAD_REQUEST,
					'Já existe um usuário com este CPF. Você tem certeza que esse é o seu primeiro acesso?',
				);
			}
		} catch (e) {
			console.error(`Could not fetch user with cpf ${body.cpf} to verify if it already exists`);
			return ServerResponse.internalError();
		}

		const preInitializationUser = await getPreInitializationUser(
			middlewareData.accessKey.userEmail,
			middlewareData.DYNAMODB_PRE_INITIALIZATION_USERS_TABLE,
		);

		if (!preInitializationUser) {
			console.error(
				`No pre-user associated with access key "${middlewareData.accessKey.key}" was found`,
			);
			return ServerResponse.internalError();
		}

		const hashedPassword = bcrypt.hashSync(body.password, 10);

		let user: User;
		try {
			[user] = await Promise.all([
				createUser(
					{ hashedPassword, cpf: body.cpf },
					preInitializationUser,
					middlewareData.DYNAMODB_USERS_TABLE,
				),
				useAccessKeyToCreateLoginCredentials(
					middlewareData.accessKey.key,
					middlewareData.DYNAMODB_ACCESS_KEY_TABLE,
				),
			]);
		} catch (e) {
			console.error('Failed to initialize user or update access key', e);
			return ServerResponse.internalError();
		}

		const token = generateJWT(
			{ cpf: user.cpf },
			middlewareData.accessKey.expirationDate,
			middlewareData.JWT_SECRET,
		);

		const response = ServerResponse.success(
			{ token, user: { ...user, hashedPassword: null } },
			'Login bem sucedido',
		);

		response.headers['Authorization'] = token;

		return response;
	});
