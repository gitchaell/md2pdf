import { FileText, Moon, Plus, Search, Sidebar as SidebarIcon, Sun, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { Button } from './ui/Button';
import { Dialog } from './ui/Dialog';
import { Input } from './ui/Input';
import { Resizer } from './ui/Resizer';

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
  const sidebarWidth = useStore((state) => state.sidebarWidth);
  const setSidebarWidth = useStore((state) => state.setSidebarWidth);

  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filteredDocs = documents.filter((doc) =>
    doc.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleResize = (newX: number) => {
    // Limit width between 150px and 500px
    const width = Math.max(150, Math.min(500, newX));
    setSidebarWidth(width);
  };

  if (!sidebarOpen) {
    return (
      <div className="hidden md:flex h-full border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-2 flex-col items-center gap-4 pt-4">
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
    <>
        {/* Mobile Backdrop */}
        <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={toggleSidebar}
            aria-hidden="true"
        />

        <div
            className={cn(
                "h-full flex flex-row bg-zinc-50 dark:bg-zinc-950 transition-all duration-300 md:duration-0",
                "fixed inset-y-0 left-0 z-50 md:relative md:z-auto"
            )}
            style={{ width: window.innerWidth >= 768 ? sidebarWidth : '16rem' }}
        >
            <div className="flex-1 flex flex-col min-w-0 border-r border-zinc-200 dark:border-zinc-800">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between h-14 shrink-0">
                    <h1 className="font-semibold text-sm truncate">Documents</h1>
                    <div className="flex gap-1 shrink-0">
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

                <div className="p-4 space-y-4 shrink-0">
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
                            onClick={() => {
                                selectDocument(doc.id!);
                                // On mobile, close sidebar after selection
                                if (window.innerWidth < 768) {
                                    toggleSidebar();
                                }
                            }}
                        >
                            <div className="flex items-center truncate flex-1 mr-2">
                            <FileText className="w-4 h-4 mr-2 shrink-0" />
                            <span className="truncate">{doc.title}</span>
                            </div>
                            <div
                            role="button"
                            tabIndex={0}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded text-muted-foreground hover:text-red-500 transition-all cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                setDeleteId(doc.id!);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.stopPropagation();
                                    setDeleteId(doc.id!);
                                }
                            }}
                            >
                            <Trash2 className="w-3.5 h-3.5" />
                            </div>
                        </button>
                        ))}
                    </div>
                    )}
                </div>
            </div>
            {/* Resizer Handle - Visible only on Desktop */}
            <div className="hidden md:block absolute right-0 top-0 bottom-0 z-50 translate-x-[50%]">
                 <Resizer onResize={handleResize} />
            </div>
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
    </>
  );
}
