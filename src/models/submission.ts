export type Submission = {
	userCpf: string;
	categories: {
		[name: string]: SubmissionCategory;
	};
};

export type SubmissionCategory = {
	creationDate: number;
	categoryName: string;
	[key: string]: any;
};
