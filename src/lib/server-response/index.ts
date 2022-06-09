import { HTTPStatusCodeNumbers, HTTPStatusCode } from './status-codes';

export class ServerResponse {
	public statusCode: HTTPStatusCodeNumbers;
	public body: string;
	public headers: Record<string, any>;

	constructor(
		statusCode: HTTPStatusCodeNumbers,
		success: boolean,
		message?: string,
		payload?: any,
	) {
		this.statusCode = statusCode;
		this.body = JSON.stringify({ success, message, payload });
		this.headers = {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Expose-Headers': '*',
			'Access-Control-Allow-Headers': '*',
		};
	}

	static success(payload: any, message?: string) {
		return new ServerResponse(200, true, message, payload);
	}

	static error(statusCode: HTTPStatusCodeNumbers, message?: string) {
		return new ServerResponse(statusCode, false, message);
	}

	static internalError() {
		return new ServerResponse(
			HTTPStatusCode.SERVER_ERROR.C500_INTERNAL_SERVER_ERROR,
			false,
			'Internal Error',
		);
	}
}
