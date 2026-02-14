export const cleanupMarkdown = (text: string): string => {
	if (!text) return "";

	let cleaned = text;

	// Normalize line endings
	cleaned = cleaned.replace(/\r\n/g, "\n");
	cleaned = cleaned.replace(/\r/g, "\n");

	// Remove zero-width spaces and other invisible characters
	// \u200B: zero-width space
	// \u200C: zero-width non-joiner
	// \u200D: zero-width joiner
	// \uFEFF: zero-width no-break space
	cleaned = cleaned.replace(/[\u200B\u200C\u200D\uFEFF]/g, "");

	// Strip trailing whitespace from lines
	cleaned = cleaned
		.split("\n")
		.map((line) => line.trimEnd())
		.join("\n");

	return cleaned;
};
