import { APIGatewayProxyEvent } from 'aws-lambda';
import { Middleware } from '../make-handler/middleware';

import { ServerResponse } from '../server-response';
import { HTTPStatusCode } from '../server-response/status-codes';

function extractEventContentType(event: APIGatewayProxyEvent) {
	return (event.headers['content-type'] || event.headers['Content-Type']) as string;
}

type RequiredData = {};

type ResultData = {
	body: Record<string, any>;
};

type Options = {
	/** Which content-type to expect */
	contentType: 'application/json';
};

type UserOptions = Partial<Options>;

function applyDefaultOptions(userOptions: UserOptions) {
	return {
		contentType: 'application/json',
		...userOptions,
	} as Options;
}

/**
 * This middleware makes sure the request has a body, and in the correct content-type.
 * If the user doesn't have a body, or the HTTP Method is incorrect, or it has the wrong
 * content-type, the middleware will return an Error.
 *
 * If the request has a valid body, with valid content-type and HTTP Method, the body will
 * be parsed and stored in the middlewareData object
 */
export function expectBody(
	userOptions: UserOptions = {},
): Middleware<RequiredData, ResultData, APIGatewayProxyEvent> {
	const options = applyDefaultOptions(userOptions);
	return (middlewareData, event) => {
		const shouldMethodHaveEmptyBody = event.httpMethod === 'GET' || event.httpMethod === 'OPTIONS';

		if (shouldMethodHaveEmptyBody) {
			return ServerResponse.error(
				HTTPStatusCode.SERVER_ERROR.C500_INTERNAL_SERVER_ERROR,
				'User is expecting a body, but this HTTP method should not receive one',
			);
		}
		const contentType = extractEventContentType(event);
		if (!contentType)
			return ServerResponse.error(
				HTTPStatusCode.CLIENT_ERROR.C415_UNSUPPORTED_MEDIA_TYPE,
				`Missing Content-Type header`,
			);

		if (contentType !== options.contentType) {
			return ServerResponse.error(
				HTTPStatusCode.CLIENT_ERROR.C415_UNSUPPORTED_MEDIA_TYPE,
				`Invalid content-type. Expected "${options.contentType}", but instead got "${contentType}"`,
			);
		}

		if (!event.body) {
			return ServerResponse.error(HTTPStatusCode.CLIENT_ERROR.C400_BAD_REQUEST, `Missing body`);
		}

		try {
			middlewareData.body = JSON.parse(event.body!);
		} catch (e) {
			return ServerResponse.error(
				HTTPStatusCode.CLIENT_ERROR.C400_BAD_REQUEST,
				'Failed to parse body as JSON',
			);
		}

		return null;
	};
}
