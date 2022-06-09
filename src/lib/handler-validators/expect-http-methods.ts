import { APIGatewayProxyEvent } from 'aws-lambda';
import { Middleware } from '../make-handler/middleware';

import { ServerResponse } from '../server-response';
import { HTTPStatusCode } from '../server-response/status-codes';

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';

type RequiredData = {};

type ResultData = {};

/**
 * This middleware makes sure the function received the right HTTP method.
 * If the wrong HTTP method is received, the middleware will send an Error response
 * to the client
 */
export function expectHTTPMethod(
	method: HTTPMethod,
): Middleware<RequiredData, ResultData, APIGatewayProxyEvent> {
	return (_middlewareData, event) => {
		if (event.httpMethod !== method) {
			return ServerResponse.error(
				HTTPStatusCode.CLIENT_ERROR.C405_METHOD_NOT_ALLOWED,
				`Method "${event.httpMethod}" is not allowed. Expecting method "${method}"`,
			);
		}

		return null;
	};
}
