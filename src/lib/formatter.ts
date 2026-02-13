import * as prettier from "prettier/standalone";
import * as markdownPlugin from "prettier/plugins/markdown";

export const formatMarkdown = async (code: string): Promise<string> => {
	try {
		return await prettier.format(code, {
			parser: "markdown",
			plugins: [markdownPlugin],
		});
	} catch (error) {
		console.error("Format failed:", error);
		return code;
	}
};
