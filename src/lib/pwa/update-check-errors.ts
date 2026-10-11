export function getUpdateCheckErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}

	if (typeof error === 'string') {
		return error;
	}

	return '';
}

export function isBenignUpdateCheckMiss(error: unknown): boolean {
	const message = getUpdateCheckErrorMessage(error).toLowerCase();

	return message.includes('newestworker is null');
}
