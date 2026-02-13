import { GripVertical } from "lucide-react";
import { type MouseEvent, useEffect, useState } from "react";
import { cn } from "../../lib/utils";

interface ResizerProps {
	onResize: (newWidth: number) => void;
	direction?: "horizontal" | "vertical"; // Currently only horizontal implemented
	className?: string;
}

export function Resizer({
	onResize,
	direction = "horizontal",
	className,
}: ResizerProps) {
	const [isDragging, setIsDragging] = useState(false);

	useEffect(() => {
		const handleMouseMove = (e: globalThis.MouseEvent) => {
			if (!isDragging) return;
			onResize(e.clientX);
		};

		const handleMouseUp = () => {
			setIsDragging(false);
			document.body.style.cursor = "default";
			document.body.style.userSelect = "auto";
		};

		if (isDragging) {
			window.addEventListener("mousemove", handleMouseMove);
			window.addEventListener("mouseup", handleMouseUp);
		}

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isDragging, onResize]);

	const handleMouseDown = (e: MouseEvent) => {
		e.preventDefault();
		setIsDragging(true);
		document.body.style.cursor = "col-resize";
		document.body.style.userSelect = "none";
	};

	return (
		<div
			className={cn(
				"w-1 h-full cursor-col-resize hover:bg-zinc-400 dark:hover:bg-zinc-600 active:bg-zinc-500 dark:active:bg-zinc-500 transition-colors flex items-center justify-center group z-50",
				isDragging && "bg-zinc-500 dark:bg-zinc-500",
				className,
			)}
			onMouseDown={handleMouseDown}
			role="separator"
			aria-orientation="vertical"
		>
			<div className="h-8 w-1 bg-zinc-300 dark:bg-zinc-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
		</div>
	);
}
