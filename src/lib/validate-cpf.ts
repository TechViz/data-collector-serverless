export function validateCpf(cpf: string) {
	const cpfRegex = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/;
	return Boolean(cpfRegex.exec(cpf));
}
