import { Editor, useMonaco } from "@monaco-editor/react";
import { useEffect } from "react";
import { useStore } from "../store/useStore";

export function CodeEditor() {
	const currentDoc = useStore((state) => state.currentDoc);
	const theme = useStore((state) => state.theme);
	const updateCurrentDocument = useStore(
		(state) => state.updateCurrentDocument,
	);

	const monaco = useMonaco();

	useEffect(() => {
		if (monaco) {
			monaco.editor.defineTheme("custom-dark", {
				base: "vs-dark",
				inherit: true,
				rules: [],
				colors: {
					"editor.background": "#09090b", // zinc-950
				},
			});
			monaco.editor.defineTheme("custom-light", {
				base: "vs",
				inherit: true,
				rules: [],
				colors: {
					"editor.background": "#ffffff",
				},
			});
		}
	}, [monaco]);

	const handleEditorChange = (value: string | undefined) => {
		if (value !== undefined) {
			updateCurrentDocument(value);
		}
	};

	if (!currentDoc) {
		return (
			<div className="flex items-center justify-center h-full text-muted-foreground bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800">
				<p>Select or create a document to start editing.</p>
			</div>
		);
	}

	return (
		<div className="h-full w-full overflow-hidden border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
			<Editor
				height="100%"
				defaultLanguage="markdown"
				path={`doc-${currentDoc.id}`} // Unique path to preserve undo stack per document
				value={currentDoc.content}
				onChange={handleEditorChange}
				theme={theme === "dark" ? "vs-dark" : "light"}
				options={{
					minimap: { enabled: false },
					fontSize: 14,
					wordWrap: "on",
					fontFamily: '"Geist Mono", monospace',
					padding: { top: 24, bottom: 24 },
					scrollBeyondLastLine: false,
					lineNumbers: "off",
					glyphMargin: false,
					folding: false,
					renderLineHighlight: "all",
					hideCursorInOverviewRuler: true,
					overviewRulerBorder: false,
					overviewRulerLanes: 0,
				}}
				loading={
					<div className="flex items-center justify-center h-full text-muted-foreground">
						Loading Editor...
					</div>
				}
			/>
		</div>
	);
}
