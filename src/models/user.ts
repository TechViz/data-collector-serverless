import { PreInitializationUser } from './pre-initialization-user';

export type User = PreInitializationUser & {
	name: string;
	cpf: string;
	hashedPassword: string;
	initializationDate: number;
};
