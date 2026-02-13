import { Editor, type Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useStore } from "../store/useStore";
import { db } from "../lib/db";

interface CodeEditorProps {
    onMount?: (editor: editor.IStandaloneCodeEditor) => void;
}

export function CodeEditor({ onMount }: CodeEditorProps) {
	const currentDoc = useStore((state) => state.currentDoc);
	const theme = useStore((state) => state.theme);
	const editorTheme = useStore((state) => state.editorTheme);
	const updateCurrentDocument = useStore(
		(state) => state.updateCurrentDocument,
	);

	const handleEditorWillMount = (monaco: Monaco) => {
		monaco.editor.defineTheme("custom-dark", {
			base: "vs-dark",
			inherit: true,
			rules: [],
			colors: {
				"editor.background": "#09090b", // zinc-950
				"editor.foreground": "#fafafa", // zinc-50
			},
		});
		monaco.editor.defineTheme("custom-light", {
			base: "vs",
			inherit: true,
			rules: [],
			colors: {
				"editor.background": "#ffffff",
				"editor.foreground": "#09090b", // zinc-950
			},
		});
		monaco.editor.defineTheme("github-dark", {
			base: "vs-dark",
			inherit: true,
			rules: [],
			colors: {
				"editor.background": "#0d1117",
				"editor.foreground": "#c9d1d9",
			},
		});
		monaco.editor.defineTheme("dracula", {
			base: "vs-dark",
			inherit: true,
			rules: [],
			colors: {
				"editor.background": "#282a36",
				"editor.foreground": "#f8f8f2",
			},
		});
		monaco.editor.defineTheme("monokai", {
			base: "vs-dark",
			inherit: true,
			rules: [],
			colors: {
				"editor.background": "#272822",
				"editor.foreground": "#f8f8f2",
			},
		});
		monaco.editor.defineTheme("solarized-dark", {
			base: "vs-dark",
			inherit: true,
			rules: [],
			colors: {
				"editor.background": "#002b36",
				"editor.foreground": "#839496",
			},
		});
		monaco.editor.defineTheme("solarized-light", {
			base: "vs",
			inherit: true,
			rules: [],
			colors: {
				"editor.background": "#fdf6e3",
				"editor.foreground": "#657b83",
			},
		});
		monaco.editor.defineTheme("nord", {
			base: "vs-dark",
			inherit: true,
			rules: [],
			colors: {
				"editor.background": "#2e3440",
				"editor.foreground": "#d8dee9",
			},
		});
	};

    const handleEditorMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
        onMount?.(editor);

        // Add event listener to the editor's dom node
        const domNode = editor.getDomNode();
        if (domNode) {
             // We need to use a type assertion or handle the event manually because
             // ClipboardEvent is not generic in standard DOM types in this context
            domNode.addEventListener('paste', async (event: Event) => {
                const e = event as ClipboardEvent;
                if (e.clipboardData && e.clipboardData.items) {
                    const items = e.clipboardData.items;
                    for (let i = 0; i < items.length; i++) {
                        if (items[i].type.indexOf("image") !== -1) {
                            e.preventDefault();
                            const blob = items[i].getAsFile();
                            if (blob) {
                                try {
                                    // Save to DB
                                    const id = await db.images.add({
                                        blob: blob,
                                        mimeType: blob.type,
                                        createdAt: new Date(),
                                    });

                                    // Insert markdown
                                    // We need to execute the edit on the editor model
                                    const selection = editor.getSelection();
                                    const idString = `local-image://${id}`;
                                    const text = `![Image](${idString})`;

                                    if (selection) {
                                        const op = {
                                            range: selection,
                                            text: text,
                                            forceMoveMarkers: true
                                        };
                                        editor.executeEdits("my-source", [op]);
                                    }
                                } catch (err) {
                                    console.error("Failed to save image", err);
                                }
                            }
                            return; // Handle only the first image
                        }
                    }
                }
            });
        }
    };

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
				beforeMount={handleEditorWillMount}
                onMount={handleEditorMount}
				theme={editorTheme}
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
