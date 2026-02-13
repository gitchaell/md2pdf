import { Analytics } from "@vercel/analytics/react";
import { ChevronDown, Eye, FileEdit, Menu, Palette } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { editor } from "monaco-editor";
import { useStore } from "../store/useStore";
import { CodeEditor } from "./CodeEditor";
import { Preview } from "./Preview";
import { Sidebar } from "./Sidebar";
import { Input } from "./ui/Input";
import { cn } from "../lib/utils";
import { Resizer } from "./ui/Resizer";
import { useScrollSync } from "../hooks/useScrollSync";

export function App() {
	const loadDocuments = useStore((state) => state.loadDocuments);
	const currentDoc = useStore((state) => state.currentDoc);
	const updateTitle = useStore((state) => state.updateTitle);
	const theme = useStore((state) => state.theme);
	const isLoading = useStore((state) => state.isLoading);
	const documents = useStore((state) => state.documents);
	const createDocument = useStore((state) => state.createDocument);
    const toggleSidebar = useStore((state) => state.toggleSidebar);
    const editorWidthPercent = useStore((state) => state.editorWidthPercent);
    const setEditorWidthPercent = useStore((state) => state.setEditorWidthPercent);
    const editorTheme = useStore((state) => state.editorTheme);
    const setEditorTheme = useStore((state) => state.setEditorTheme);

    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const previewScrollRef = useRef<HTMLDivElement>(null);

    const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

    // Enable scroll sync only when both panels are visible (Desktop)
    useScrollSync(editorRef, previewScrollRef, window.innerWidth >= 768 && activeTab !== 'preview' && activeTab !== 'editor');

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

    const handlePanelResize = (clientX: number) => {
        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const newPercent = ((clientX - containerRect.left) / containerRect.width) * 100;

        // Limit between 20% and 80%
        const limitedPercent = Math.max(20, Math.min(80, newPercent));
        setEditorWidthPercent(limitedPercent);
    };

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

				<div ref={containerRef} className="flex-1 flex h-full overflow-hidden relative">
					{/* Editor Pane */}
					<div
                        className={cn(
                            "flex flex-col h-full border-r border-zinc-200 dark:border-zinc-800 min-w-0 bg-background",
                            activeTab === 'editor' ? "flex w-full md:w-auto" : "hidden md:flex"
                        )}
                        style={{ width: activeTab === 'editor' && window.innerWidth < 768 ? '100%' : `${editorWidthPercent}%` }}
                    >
						<div className="h-14 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 bg-white dark:bg-zinc-950 shrink-0">
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
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Palette className="absolute left-2 top-2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    <select
                                        value={editorTheme}
                                        onChange={(e) => setEditorTheme(e.target.value)}
                                        className="h-8 w-40 appearance-none rounded-md border border-input bg-background pl-8 pr-8 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="vs-dark">Dark (Default)</option>
                                        <option value="custom-light">Light</option>
                                        <option value="github-dark">GitHub Dark</option>
                                        <option value="dracula">Dracula</option>
                                        <option value="monokai">Monokai</option>
                                        <option value="solarized-dark">Solarized Dark</option>
                                        <option value="solarized-light">Solarized Light</option>
                                        <option value="nord">Nord</option>
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-2 top-2 h-4 w-4 text-muted-foreground opacity-50" />
                                </div>
                            </div>
						</div>
						<div className="flex-1 overflow-hidden relative">
							<CodeEditor onMount={(editor) => { editorRef.current = editor; }} />
						</div>
					</div>

                    {/* Resizer - Desktop Only */}
                    <div
                        className="hidden md:block absolute top-0 bottom-0 z-10 translate-x-[-50%]"
                        style={{ left: `${editorWidthPercent}%` }}
                    >
                        <Resizer onResize={handlePanelResize} />
                    </div>

					{/* Preview Pane */}
					<div
                        className={cn(
                            "h-full bg-gray-50 dark:bg-zinc-900 overflow-hidden relative",
                            activeTab === 'preview' ? "block w-full" : "hidden md:block"
                        )}
                        style={{ width: activeTab === 'preview' && window.innerWidth < 768 ? '100%' : `${100 - editorWidthPercent}%` }}
                    >
						<Preview scrollRef={previewScrollRef} />
					</div>
				</div>
			</div>
            <Analytics />
		</div>
	);
}
