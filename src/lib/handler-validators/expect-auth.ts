import { ServerResponse } from '../server-response';
import { HTTPStatusCode } from '../server-response/status-codes';
import { JWTPayload, verifyJWT } from '../jwt';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { Middleware } from '../make-handler/middleware';
import jwt from 'jsonwebtoken';

type RequiredData = {
	/** Env variable. The secret to be used for JWT generation/decryption */
	JWT_SECRET: string;
};

type ResultData = {
	/** The contents that was stored inside the user token */
	tokenContent: JWTPayload & jwt.JwtPayload;
};

const extractAuthorizationToken = (event: APIGatewayProxyEvent) =>
	(event.headers['authorization'] || event.headers['Authorization']) as string | undefined;

export function expectAuth(): Middleware<RequiredData, ResultData, APIGatewayProxyEvent> {
	return async (middlewareData, event) => {
		const token = extractAuthorizationToken(event);

		if (!token) {
			return ServerResponse.error(
				HTTPStatusCode.CLIENT_ERROR.C401_UNAUTHORIZED,
				`Missing authorization header`,
			);
		}

		const tokenContent = verifyJWT(token, middlewareData.JWT_SECRET);

		if (!tokenContent) {
			return ServerResponse.error(
				HTTPStatusCode.CLIENT_ERROR.C401_UNAUTHORIZED,
				`Invalid authorization token`,
			);
		}

		middlewareData.tokenContent = tokenContent;

		return null;
	};
}
