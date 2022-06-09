import { Middleware } from '../make-handler/middleware';

type RequiredData = {};

/**
 * This is a middleware that extracts a variable from the function's environment.
 * If the variable is not found, or empty, the function throws an Error.
 * If the variable is found, it's value is stored in the `middlewareData`
 */
export function expectEnv<T extends string>(
	variableName: T,
): Middleware<RequiredData, Record<T, string>, any> {
	return async middlewareData => {
		const value = process.env[variableName] as string;

		if (!value) {
			throw new Error(`Environment variable '${variableName}' not found. Check your .env file`);
		}

		middlewareData[variableName] = value;

		return null;
	};
}
