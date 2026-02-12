import { X } from "lucide-react";
import type * as React from "react";

interface DialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	children: React.ReactNode;
}

export function Dialog({
	open,
	onOpenChange,
	title,
	description,
	children,
}: DialogProps) {
	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
			<div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg p-6 animate-in fade-in zoom-in-95 duration-200">
				<button
					type="button"
					onClick={() => onOpenChange(false)}
					className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground cursor-pointer"
				>
					<X className="h-4 w-4" />
					<span className="sr-only">Close</span>
				</button>
				<div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
					<h2 className="text-lg font-semibold leading-none tracking-tight">
						{title}
					</h2>
					{description && (
						<p className="text-sm text-muted-foreground">{description}</p>
					)}
				</div>
				{children}
			</div>
		</div>
	);
}
