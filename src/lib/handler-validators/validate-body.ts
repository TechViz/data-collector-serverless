import { ServerResponse } from '../server-response';
import { HTTPStatusCode } from '../server-response/status-codes';

import type { V8nValidator, ValidationError } from 'v8n';
import { Middleware } from '../make-handler/middleware';

type RequiredData = {
	body: Record<string, any>;
};

type ResultData<BodyType> = {
	body: BodyType;
};

export function validateBody<BodyType extends Record<string, any>>(
	validator: V8nValidator,
): Middleware<RequiredData, ResultData<BodyType>, any> {
	return middlewareData => {
		try {
			validator.check(middlewareData.body);
		} catch (error: unknown) {
			const validationError = error as ValidationError;
			const {
				target,
				rule: { name },
			} = validationError;
			return ServerResponse.error(
				HTTPStatusCode.CLIENT_ERROR.C400_BAD_REQUEST,
				`Error validating body target "${target}" on rule "${name}"`,
			);
		}
		return null;
	};
}
