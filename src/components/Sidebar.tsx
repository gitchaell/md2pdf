import {
	FileText,
	Moon,
	Plus,
	Search,
	Sidebar as SidebarIcon,
	Sun,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";
import { useStore } from "../store/useStore";
import { Button } from "./ui/Button";
import { Dialog } from "./ui/Dialog";
import { Input } from "./ui/Input";

export function Sidebar() {
	const documents = useStore((state) => state.documents);
	const currentDoc = useStore((state) => state.currentDoc);
	const createDocument = useStore((state) => state.createDocument);
	const deleteDocument = useStore((state) => state.deleteDocument);
	const selectDocument = useStore((state) => state.selectDocument);
	const sidebarOpen = useStore((state) => state.sidebarOpen);
	const toggleSidebar = useStore((state) => state.toggleSidebar);
	const theme = useStore((state) => state.theme);
	const toggleTheme = useStore((state) => state.setTheme);

	const [search, setSearch] = useState("");
	const [deleteId, setDeleteId] = useState<number | null>(null);

	const filteredDocs = documents.filter((doc) =>
		doc.title.toLowerCase().includes(search.toLowerCase()),
	);

	if (!sidebarOpen) {
		return (
			<div className="h-full border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-2 flex flex-col items-center gap-4 pt-4">
				<Button variant="ghost" size="icon" onClick={toggleSidebar}>
					<SidebarIcon className="w-4 h-4" />
				</Button>
				<Button variant="ghost" size="icon" onClick={() => createDocument()}>
					<Plus className="w-4 h-4" />
				</Button>
			</div>
		);
	}

	return (
		<div className="h-full w-64 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 shrink-0 transition-all duration-300">
			<div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between h-14">
				<h1 className="font-semibold text-sm">Documents</h1>
				<div className="flex gap-1">
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={() => toggleTheme(theme === "dark" ? "light" : "dark")}
					>
						{theme === "dark" ? (
							<Sun className="w-4 h-4" />
						) : (
							<Moon className="w-4 h-4" />
						)}
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={toggleSidebar}
					>
						<SidebarIcon className="w-4 h-4" />
					</Button>
				</div>
			</div>

			<div className="p-4 space-y-4">
				<Button
					onClick={() => createDocument()}
					className="w-full justify-start"
				>
					<Plus className="w-4 h-4 mr-2" />
					New Document
				</Button>
				<div className="relative">
					<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search..."
						className="pl-8"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin">
				{filteredDocs.length === 0 ? (
					<div className="text-center text-xs text-muted-foreground mt-4">
						No documents found.
					</div>
				) : (
					<div className="space-y-1">
						{filteredDocs.map((doc) => (
							<button
								type="button"
								key={doc.id}
								className={cn(
									"group w-full flex items-center justify-between px-2 py-2 rounded-md cursor-pointer text-sm transition-colors border-none bg-transparent text-left",
									currentDoc?.id === doc.id
										? "bg-zinc-200 dark:bg-zinc-800 text-foreground"
										: "text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-foreground",
								)}
								// biome-ignore lint/style/noNonNullAssertion: doc.id is guaranteed from DB
								onClick={() => selectDocument(doc.id!)}
							>
								<div className="flex items-center truncate flex-1 mr-2">
									<FileText className="w-4 h-4 mr-2 shrink-0" />
									<span className="truncate">{doc.title}</span>
								</div>
								<button
									type="button"
									className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded text-muted-foreground hover:text-red-500 transition-all cursor-pointer"
									onClick={(e) => {
										e.stopPropagation();
										// biome-ignore lint/style/noNonNullAssertion: doc.id is guaranteed from DB
										setDeleteId(doc.id!);
									}}
								>
									<Trash2 className="w-3.5 h-3.5" />
								</button>
							</button>
						))}
					</div>
				)}
			</div>

			<Dialog
				open={!!deleteId}
				onOpenChange={(open) => !open && setDeleteId(null)}
				title="Delete Document"
				description="Are you sure you want to delete this document? This action cannot be undone."
			>
				<div className="flex justify-end gap-2 mt-4">
					<Button variant="outline" onClick={() => setDeleteId(null)}>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={() => {
							if (deleteId) deleteDocument(deleteId);
							setDeleteId(null);
						}}
					>
						Delete
					</Button>
				</div>
			</Dialog>
		</div>
	);
}
