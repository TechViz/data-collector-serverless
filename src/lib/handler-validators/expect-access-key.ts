import { ServerResponse } from '../server-response';
import { HTTPStatusCode } from '../server-response/status-codes';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { Middleware } from '../make-handler/middleware';
import { AccessKey } from '../../models/access-key';
import { getAccessKey } from '../../dynamo/access-key';

type RequiredData = {
	/** Env variable. The name of the access key table. */
	DYNAMODB_ACCESS_KEY_TABLE: string;

	body: { accessKey: string };
};

type ResultData = {
	accessKey: AccessKey;
};

export function expectAccessKeyInBody(): Middleware<
	RequiredData,
	ResultData,
	APIGatewayProxyEvent
> {
	return async middlewareData => {
		const key = middlewareData.body.accessKey;

		let accessKey: AccessKey | null;
		try {
			accessKey = await getAccessKey(key, middlewareData.DYNAMODB_ACCESS_KEY_TABLE);
		} catch (e) {
			console.error('Failed to fetch access key', e);
			return ServerResponse.internalError();
		}

		if (!accessKey) {
			return ServerResponse.error(
				HTTPStatusCode.CLIENT_ERROR.C404_NOT_FOUND,
				'Chave de acesso inválida',
			);
		}

		if (Date.now() > accessKey.expirationDate) {
			return ServerResponse.error(
				HTTPStatusCode.CLIENT_ERROR.C401_UNAUTHORIZED,
				'Chave de acesso expirada',
			);
		}

		middlewareData.accessKey = accessKey;

		return null;
	};
}
