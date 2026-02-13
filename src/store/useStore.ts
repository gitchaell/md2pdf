import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Document, db } from "../lib/db";

interface EditorState {
	documents: Document[];
	currentDoc: Document | null;
	theme: "light" | "dark";
	sidebarOpen: boolean;
	sidebarWidth: number;
	editorWidthPercent: number; // Percentage of the available space
	isLoading: boolean;
	editorTheme: string;
	previewFont: string;

	// Actions
	loadDocuments: () => Promise<void>;
	createDocument: () => Promise<void>;
	updateCurrentDocument: (content: string) => Promise<void>;
	clearCurrentDocument: () => Promise<void>;
	updateTitle: (id: number, title: string) => Promise<void>;
	deleteDocument: (id: number) => Promise<void>;
	selectDocument: (id: number) => void;
	setTheme: (theme: "light" | "dark") => void;
	setEditorTheme: (theme: string) => void;
	setPreviewFont: (font: string) => void;
	toggleSidebar: () => void;
	setSidebarWidth: (width: number) => void;
	setEditorWidthPercent: (percent: number) => void;
}

export const useStore = create<EditorState>()(
	persist(
		(set, get) => ({
			documents: [],
			currentDoc: null,
			theme:
				typeof window !== "undefined" &&
				window.matchMedia("(prefers-color-scheme: dark)").matches
					? "dark"
					: "light",
			sidebarOpen: true,
			sidebarWidth: 256, // Default 16rem
			editorWidthPercent: 50, // Default 50%
			isLoading: true,
			editorTheme: "vs-dark",
			previewFont: "sans",

			loadDocuments: async () => {
				const docs = await db.documents
					.orderBy("updatedAt")
					.reverse()
					.toArray();
				set({ documents: docs });

				// Select the most recent document if none selected
				if (!get().currentDoc && docs.length > 0) {
					set({ currentDoc: docs[0] });
				}
				set({ isLoading: false });
			},

			createDocument: async () => {
				const { documents } = get();

				// Check if an empty untitled document already exists
				const existingEmptyDoc = documents.find(
					(d) =>
						d.title === "Untitled Document" &&
						(d.content === "" ||
							d.content === "# New Document\n\nStart typing..."),
				);

				if (existingEmptyDoc) {
					set({ currentDoc: existingEmptyDoc });
					return;
				}

				const newDoc: Document = {
					title: "Untitled Document",
					content: "# New Document\n\nStart typing...",
					updatedAt: new Date(),
				};

				const id = await db.documents.add(newDoc);
				const docWithId = { ...newDoc, id: Number(id) };

				set((state) => ({
					documents: [docWithId, ...state.documents],
					currentDoc: docWithId,
				}));
			},

			updateCurrentDocument: async (content: string) => {
				const { currentDoc } = get();
				if (currentDoc && currentDoc.id !== undefined) {
					const updatedDoc = { ...currentDoc, content, updatedAt: new Date() };

					// Update local state immediately for responsiveness
					set((state) => ({
						currentDoc: updatedDoc,
						documents: state.documents.map((d) =>
							d.id === updatedDoc.id ? updatedDoc : d,
						),
					}));

					// Update DB
					await db.documents.put(updatedDoc);
				}
			},

			clearCurrentDocument: async () => {
				const { currentDoc } = get();
				if (currentDoc && currentDoc.id !== undefined) {
					const updatedDoc = {
						...currentDoc,
						content: "",
						updatedAt: new Date(),
					};

					// Update local state immediately for responsiveness
					set((state) => ({
						currentDoc: updatedDoc,
						documents: state.documents.map((d) =>
							d.id === updatedDoc.id ? updatedDoc : d,
						),
					}));

					// Update DB
					await db.documents.put(updatedDoc);
				}
			},

			updateTitle: async (id: number, title: string) => {
				const doc = await db.documents.get(id);
				if (doc) {
					const updatedDoc = { ...doc, title, updatedAt: new Date() };
					await db.documents.put(updatedDoc);

					set((state) => ({
						documents: state.documents.map((d) =>
							d.id === id ? updatedDoc : d,
						),
						currentDoc:
							state.currentDoc?.id === id ? updatedDoc : state.currentDoc,
					}));
				}
			},

			deleteDocument: async (id: number) => {
				await db.documents.delete(id);
				set((state) => {
					const newDocs = state.documents.filter((d) => d.id !== id);
					return {
						documents: newDocs,
						currentDoc:
							state.currentDoc?.id === id
								? newDocs[0] || null
								: state.currentDoc,
					};
				});
			},

			selectDocument: (id: number) => {
				const { documents } = get();
				const doc = documents.find((d) => d.id === id);
				if (doc) {
					set({ currentDoc: doc });
				}
			},

			setTheme: (theme) => {
				set({
					theme,
					// Auto-switch editor theme based on global theme for better UX
					editorTheme: theme === "dark" ? "vs-dark" : "custom-light",
				});
				if (typeof document !== "undefined") {
					if (theme === "dark") {
						document.documentElement.classList.add("dark");
					} else {
						document.documentElement.classList.remove("dark");
					}
				}
			},

			setEditorTheme: (theme) => set({ editorTheme: theme }),
			setPreviewFont: (font) => set({ previewFont: font }),

			toggleSidebar: () =>
				set((state) => ({ sidebarOpen: !state.sidebarOpen })),
			setSidebarWidth: (width) => set({ sidebarWidth: width }),
			setEditorWidthPercent: (percent) => set({ editorWidthPercent: percent }),
		}),
		{
			name: "editor-storage",
			partialize: (state) => ({
				theme: state.theme,
				editorTheme: state.editorTheme,
				previewFont: state.previewFont,
				sidebarWidth: state.sidebarWidth,
				editorWidthPercent: state.editorWidthPercent,
				sidebarOpen: state.sidebarOpen,
			}),
		},
	),
);
