export interface AccessKey {
	key: string;
	creationDate: number;
	expirationDate: number;
	userEmail: string;
	wasUsedToCreateLoginCredentials: boolean;
}
