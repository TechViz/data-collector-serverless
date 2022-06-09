import { APIGatewayProxyEvent } from 'aws-lambda';
import { Middleware } from '../make-handler/middleware';

import { ServerResponse } from '../server-response';
import { HTTPStatusCode } from '../server-response/status-codes';

type RequiredData = {};

type ResultData = {};

/**
 * This middleware makes sure the request has an empty body. If a body is found,
 * the middleware will return am Error response
 */
export function expectEmptyBody(): Middleware<RequiredData, ResultData, APIGatewayProxyEvent> {
	return (_middlewareData, event) => {
		if (event.body) {
			return ServerResponse.error(
				HTTPStatusCode.CLIENT_ERROR.C400_BAD_REQUEST,
				'Expected no body in request',
			);
		}

		return null;
	};
}
