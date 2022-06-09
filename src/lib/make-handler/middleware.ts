import { ServerResponse } from '../server-response';

export type Middleware<RequiredData, ResultData, EventType> = (
	middlewareData: RequiredData & ResultData,
	event: EventType,
) => ServerResponse | Promise<ServerResponse | null> | null;
