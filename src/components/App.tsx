import { useEffect } from "react";
import { useStore } from "../store/useStore";
import { CodeEditor } from "./CodeEditor";
import { Preview } from "./Preview";
import { Sidebar } from "./Sidebar";
import { Input } from "./ui/Input";

export function App() {
	const loadDocuments = useStore((state) => state.loadDocuments);
	const currentDoc = useStore((state) => state.currentDoc);
	const updateTitle = useStore((state) => state.updateTitle);
	const theme = useStore((state) => state.theme);
	const isLoading = useStore((state) => state.isLoading);
	const documents = useStore((state) => state.documents);
	const createDocument = useStore((state) => state.createDocument);

	useEffect(() => {
		loadDocuments();
	}, [loadDocuments]);

	useEffect(() => {
		if (theme === "dark") {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	}, [theme]);

	// Auto-create document if list is empty after loading
	useEffect(() => {
		if (!isLoading && documents.length === 0) {
			createDocument();
		}
	}, [isLoading, documents.length, createDocument]);

	return (
		<div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-sans">
			<Sidebar />

			<div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
				<div className="flex-1 flex h-full overflow-hidden">
					{/* Editor Pane */}
					<div className="flex-1 flex flex-col h-full border-r border-zinc-200 dark:border-zinc-800 min-w-0">
						<div className="h-14 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4 bg-white dark:bg-zinc-950 shrink-0">
							{currentDoc ? (
								<Input
									value={currentDoc.title}
									// biome-ignore lint/style/noNonNullAssertion: currentDoc is checked
									onChange={(e) => updateTitle(currentDoc.id!, e.target.value)}
									className="max-w-md h-8 font-semibold border-transparent bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:bg-zinc-100 dark:focus:bg-zinc-900 focus:ring-0 px-2 truncate text-sm"
								/>
							) : (
								<span className="text-sm text-muted-foreground">
									Select a document
								</span>
							)}
						</div>
						<div className="flex-1 overflow-hidden relative">
							<CodeEditor />
						</div>
					</div>

					{/* Preview Pane */}
					<div className="flex-1 h-full bg-gray-50 dark:bg-zinc-900 hidden md:block overflow-hidden relative">
						<Preview />
					</div>
				</div>
			</div>
		</div>
	);
}
