import {
	ChevronDown,
	Eye,
	FileEdit,
	Menu,
	Palette,
	Settings,
	Trash2,
	Wand2,
} from "lucide-react";
import type { editor } from "monaco-editor";
import { useEffect, useRef, useState } from "react";
import { useScrollSync } from "../hooks/useScrollSync";
import { formatMarkdown } from "../lib/formatter";
import { cn } from "../lib/utils";
import { useStore } from "../store/useStore";
import { CodeEditor } from "./CodeEditor";
import { Preview } from "./Preview";
import { Sidebar } from "./Sidebar";
import { Dialog } from "./ui/Dialog";
import { Input } from "./ui/Input";
import { Resizer } from "./ui/Resizer";

export function App() {
	const loadDocuments = useStore((state) => state.loadDocuments);
	const currentDoc = useStore((state) => state.currentDoc);
	const updateCurrentDocument = useStore(
		(state) => state.updateCurrentDocument,
	);
	const clearCurrentDocument = useStore((state) => state.clearCurrentDocument);
	const updateTitle = useStore((state) => state.updateTitle);
	const theme = useStore((state) => state.theme);
	const isLoading = useStore((state) => state.isLoading);
	const documents = useStore((state) => state.documents);
	const createDocument = useStore((state) => state.createDocument);
	const toggleSidebar = useStore((state) => state.toggleSidebar);
	const editorWidthPercent = useStore((state) => state.editorWidthPercent);
	const setEditorWidthPercent = useStore(
		(state) => state.setEditorWidthPercent,
	);
	const editorTheme = useStore((state) => state.editorTheme);
	const setEditorTheme = useStore((state) => state.setEditorTheme);
	const editorSettings = useStore((state) => state.editorSettings);
	const setEditorSettings = useStore((state) => state.setEditorSettings);

	const containerRef = useRef<HTMLDivElement>(null);
	const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
	const previewScrollRef = useRef<HTMLDivElement>(null);

	const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
	const [showSettings, setShowSettings] = useState(false);
	const [viewportHeight, setViewportHeight] = useState<number | undefined>(
		undefined,
	);

	useEffect(() => {
		// Handle visual viewport resizing (e.g., when virtual keyboard opens on mobile)
		const handleVisualViewportResize = () => {
			if (window.visualViewport) {
				setViewportHeight(window.visualViewport.height);
			}
		};

		if (window.visualViewport) {
			window.visualViewport.addEventListener(
				"resize",
				handleVisualViewportResize,
			);
			setViewportHeight(window.visualViewport.height);
		}

		return () => {
			if (window.visualViewport) {
				window.visualViewport.removeEventListener(
					"resize",
					handleVisualViewportResize,
				);
			}
		};
	}, []);

	// Enable scroll sync only when both panels are visible (Desktop)
	useScrollSync(
		editorRef,
		previewScrollRef,
		window.innerWidth >= 768 &&
			activeTab !== "preview" &&
			activeTab !== "editor",
	);

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
		const newPercent =
			((clientX - containerRect.left) / containerRect.width) * 100;

		// Limit between 20% and 80%
		const limitedPercent = Math.max(20, Math.min(80, newPercent));
		setEditorWidthPercent(limitedPercent);
	};

	const handleFormat = async () => {
		if (currentDoc) {
			const formatted = await formatMarkdown(currentDoc.content);
			updateCurrentDocument(formatted);
		}
	};

	return (
		<div
			className="flex w-screen overflow-hidden bg-background text-foreground font-sans relative"
			style={{ height: viewportHeight ? `${viewportHeight}px` : "100dvh" }}
		>
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
						onClick={() => setActiveTab("editor")}
						className={cn(
							"flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors",
							activeTab === "editor"
								? "border-primary text-primary bg-zinc-100 dark:bg-zinc-900"
								: "border-transparent text-muted-foreground hover:text-foreground",
						)}
					>
						<FileEdit className="w-4 h-4" />
						Editor
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("preview")}
						className={cn(
							"flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors",
							activeTab === "preview"
								? "border-primary text-primary bg-zinc-100 dark:bg-zinc-900"
								: "border-transparent text-muted-foreground hover:text-foreground",
						)}
					>
						<Eye className="w-4 h-4" />
						Preview
					</button>
				</div>

				<div
					ref={containerRef}
					className="flex-1 flex h-full overflow-hidden relative"
				>
					{/* Editor Pane */}
					<div
						className={cn(
							"flex flex-col h-full border-r border-zinc-200 dark:border-zinc-800 min-w-0 bg-background",
							activeTab === "editor"
								? "flex w-full md:w-auto"
								: "hidden md:flex",
						)}
						style={{
							width:
								activeTab === "editor" && window.innerWidth < 768
									? "100%"
									: `${editorWidthPercent}%`,
						}}
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
								<button
									type="button"
									onClick={() => {
										if (
											window.confirm(
												"Are you sure you want to clear the editor? This action cannot be undone.",
											)
										) {
											clearCurrentDocument();
										}
									}}
									className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
									title="Clear Editor"
								>
									<Trash2 size={16} />
								</button>
								<button
									type="button"
									onClick={handleFormat}
									className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-muted-foreground transition-colors cursor-pointer"
									title="Format Document"
								>
									<Wand2 size={16} />
								</button>
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
								<button
									type="button"
									onClick={() => setShowSettings(true)}
									className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-muted-foreground transition-colors cursor-pointer"
									title="Editor Settings"
								>
									<Settings size={16} />
								</button>
							</div>
						</div>
						<div className="flex-1 overflow-hidden relative">
							<CodeEditor
								onMount={(editor) => {
									editorRef.current = editor;
								}}
							/>
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
							activeTab === "preview" ? "block w-full" : "hidden md:block",
						)}
						style={{
							width:
								activeTab === "preview" && window.innerWidth < 768
									? "100%"
									: `${100 - editorWidthPercent}%`,
						}}
					>
						<Preview scrollRef={previewScrollRef} />
					</div>
				</div>
			</div>
			<Dialog
				open={showSettings}
				onOpenChange={setShowSettings}
				title="Editor Settings"
			>
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<label className="text-sm font-medium">Word Wrap</label>
						<select
							value={editorSettings.wordWrap}
							// biome-ignore lint/suspicious/noExplicitAny: enum casting
							onChange={(e) =>
								setEditorSettings({ wordWrap: e.target.value as any })
							}
							className="h-8 rounded-md border border-input bg-background px-3 text-sm"
						>
							<option value="on">On</option>
							<option value="off">Off</option>
							<option value="wordWrapColumn">Word Wrap Column</option>
							<option value="bounded">Bounded</option>
						</select>
					</div>
					<div className="flex items-center justify-between">
						<label className="text-sm font-medium">Line Numbers</label>
						<select
							value={editorSettings.lineNumbers}
							// biome-ignore lint/suspicious/noExplicitAny: enum casting
							onChange={(e) =>
								setEditorSettings({ lineNumbers: e.target.value as any })
							}
							className="h-8 rounded-md border border-input bg-background px-3 text-sm"
						>
							<option value="on">On</option>
							<option value="off">Off</option>
							<option value="relative">Relative</option>
							<option value="interval">Interval</option>
						</select>
					</div>
					<div className="flex items-center justify-between">
						<label className="text-sm font-medium">Minimap</label>
						<input
							type="checkbox"
							checked={editorSettings.minimap}
							onChange={(e) => setEditorSettings({ minimap: e.target.checked })}
							className="h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary"
						/>
					</div>
					<div className="flex items-center justify-between">
						<label className="text-sm font-medium">Folding</label>
						<input
							type="checkbox"
							checked={editorSettings.folding}
							onChange={(e) => setEditorSettings({ folding: e.target.checked })}
							className="h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary"
						/>
					</div>
					<div className="flex items-center justify-between">
						<label className="text-sm font-medium">Font Size</label>
						<input
							type="number"
							value={editorSettings.fontSize}
							onChange={(e) =>
								setEditorSettings({ fontSize: parseInt(e.target.value) })
							}
							className="h-8 w-20 rounded-md border border-input bg-background px-3 text-sm"
							min={10}
							max={30}
						/>
					</div>
				</div>
			</Dialog>
		</div>
	);
}
