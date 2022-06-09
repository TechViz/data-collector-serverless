import { APIGatewayProxyEvent, DynamoDBStreamEvent } from 'aws-lambda';
import { ServerResponse } from '../server-response';
import { Middleware } from './middleware';

type ObjAny = Record<any, any>;

class Handler<DataType extends ObjAny, EventType> {
	private middlewares: Middleware<DataType, any, EventType>[] = [];

	use<RequiredData extends DataType, ResultData extends ObjAny>(
		middleware: Middleware<RequiredData, ResultData, EventType>,
	): Handler<DataType & ResultData, EventType> {
		this.middlewares.push(middleware as any);
		return this;
	}

	asHandler(handler: Middleware<{}, DataType, EventType>) {
		return async (event: EventType) => {
			try {
				const data = {};
				for (const middleware of this.middlewares) {
					let value = await middleware(data as any, event);
					if (value instanceof ServerResponse) return value;
				}
				return handler(data as any, event);
			} catch (e) {
				console.error(e);
				return ServerResponse.internalError();
			}
		};
	}
}

/**
 * Creates a lambda handler, which allows for middleware functions. To attach a
 * middleware, you'd do something like `makeHandler().use(middleware)`. You can
 * chain multiple middlewares like so: `makeHandler().use(middleware1).use(middleware2)`
 *
 * @example
 * ```typescript
 * export const getPost = makeHandler()
 * 	.use(expectEnv('JWT_SECRET'))
 * 	.use(expectEnv('POSTS_TABLE_NAME'))
 * 	.use(expectAuth())
 * 	.asGatewayHandler((middlewareData, gatewayEvent) => {
 * 		// Your middleware
 * 	});
 * ```
 */
export function makeGatewayHandler() {
	return new Handler<{}, APIGatewayProxyEvent>();
}

export function makeDynamoDBStreamHandler() {
	return new Handler<{}, DynamoDBStreamEvent>();
}
