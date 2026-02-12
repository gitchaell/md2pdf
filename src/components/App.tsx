import { Analytics } from "@vercel/analytics/react";
import { Eye, FileEdit, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "../store/useStore";
import { CodeEditor } from "./CodeEditor";
import { Preview } from "./Preview";
import { Sidebar } from "./Sidebar";
import { Input } from "./ui/Input";
import { cn } from "../lib/utils";

export function App() {
	const loadDocuments = useStore((state) => state.loadDocuments);
	const currentDoc = useStore((state) => state.currentDoc);
	const updateTitle = useStore((state) => state.updateTitle);
	const theme = useStore((state) => state.theme);
	const isLoading = useStore((state) => state.isLoading);
	const documents = useStore((state) => state.documents);
	const createDocument = useStore((state) => state.createDocument);
    const toggleSidebar = useStore((state) => state.toggleSidebar);

    const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

	useEffect(() => {
		loadDocuments();

        // On mobile, close sidebar by default
        if (window.innerWidth < 768) {
            useStore.setState({ sidebarOpen: false });
        }
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
		<div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-sans relative">
			<Sidebar />

			<div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 relative">
                {/* Mobile Tabs */}
                <div className="md:hidden flex items-center border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 shrink-0">
                    <button
                        type="button"
                        onClick={toggleSidebar}
                        className="px-4 py-3 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    >
                        <Menu className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('editor')}
                        className={cn(
                            "flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors",
                            activeTab === 'editor'
                                ? "border-primary text-primary bg-zinc-100 dark:bg-zinc-900"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <FileEdit className="w-4 h-4" />
                        Editor
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('preview')}
                        className={cn(
                            "flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors",
                            activeTab === 'preview'
                                ? "border-primary text-primary bg-zinc-100 dark:bg-zinc-900"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Eye className="w-4 h-4" />
                        Preview
                    </button>
                </div>

				<div className="flex-1 flex h-full overflow-hidden relative">
					{/* Editor Pane */}
					<div
                        className={cn(
                            "flex-1 flex flex-col h-full border-r border-zinc-200 dark:border-zinc-800 min-w-0 bg-background",
                            activeTab === 'editor' ? "block" : "hidden md:flex"
                        )}
                    >
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
					<div
                        className={cn(
                            "flex-1 h-full bg-gray-50 dark:bg-zinc-900 overflow-hidden relative",
                            activeTab === 'preview' ? "block" : "hidden md:block"
                        )}
                    >
						<Preview />
					</div>
				</div>
			</div>
            <Analytics />
		</div>
	);
}
