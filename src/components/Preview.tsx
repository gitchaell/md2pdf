import { Check, ChevronDown, Copy, Printer, Type } from "lucide-react";
import mermaid from "mermaid";
import { type MutableRefObject, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useReactToPrint } from "react-to-print";
import remarkGfm from "remark-gfm";
import { cn } from "../lib/utils";
import { useStore } from "../store/useStore";
import { Button } from "./ui/Button";
import { db } from "../lib/db";

const Mermaid = ({ chart }: { chart: string }) => {
	const [svg, setSvg] = useState("");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		const renderChart = async () => {
			try {
				mermaid.initialize({
					startOnLoad: false,
					theme: "default",
					securityLevel: "loose",
				});
				const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
				const { svg } = await mermaid.render(id, chart);
				if (isMounted) {
					setSvg(svg);
					setError(null);
				}
			} catch (err) {
				console.error("Mermaid render error:", err);
				if (isMounted) setError("Invalid Mermaid Syntax");
			}
		};

		renderChart();

		return () => {
			isMounted = false;
		};
	}, [chart]);

	if (error)
		return (
			<div className="text-red-500 text-sm p-2 border border-red-200 rounded bg-red-50 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
				{error}
			</div>
		);

	// biome-ignore lint/security/noDangerouslySetInnerHtml: Needed for Mermaid SVG
	return (
		<div
			className="mermaid flex justify-center my-4"
			dangerouslySetInnerHTML={{ __html: svg }}
		/>
	);
};

// biome-ignore lint/suspicious/noExplicitAny: Complex type for CodeBlock
const CodeBlock = ({ inline, className, children, ...props }: any) => {
	const match = /language-(\w+)/.exec(className || "");
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(String(children));
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	if (!inline && match && match[1] === "mermaid") {
		return <Mermaid chart={String(children).replace(/\n$/, "")} />;
	}

	if (!inline && match) {
		return (
			<div className="relative group rounded-md my-4 not-prose">
				<div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
					<button
						type="button"
						onClick={handleCopy}
						className="p-1.5 bg-zinc-700/80 text-white rounded hover:bg-zinc-600 backdrop-blur-sm transition-colors cursor-pointer"
					>
						{copied ? <Check size={14} /> : <Copy size={14} />}
					</button>
				</div>
				<div className="rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
					<div className="flex items-center justify-between px-4 py-2 bg-zinc-200/50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
						<span className="text-xs text-muted-foreground font-mono">
							{match[1]}
						</span>
					</div>
					<pre className={cn(className, "p-4 overflow-x-auto m-0")} {...props}>
						<code className={cn(className, "font-mono text-sm")} {...props}>
							{children}
						</code>
					</pre>
				</div>
			</div>
		);
	}

	return (
		<code
			className={cn(
				className,
				"bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono",
			)}
			{...props}
		>
			{children}
		</code>
	);
};

// Custom Image Component to handle local images
// biome-ignore lint/suspicious/noExplicitAny: Complex type
const MarkdownImage = ({ node, ...props }: any) => {
    const [src, setSrc] = useState(props.src);

    useEffect(() => {
        let objectUrl: string | null = null;

        const loadLocalImage = async () => {
             if (props.src && props.src.startsWith('local-image://')) {
                 try {
                     const id = parseInt(props.src.replace('local-image://', ''), 10);
                     if (!isNaN(id)) {
                         const image = await db.images.get(id);
                         if (image) {
                             objectUrl = URL.createObjectURL(image.blob);
                             setSrc(objectUrl);
                         }
                     }
                 } catch (err) {
                     console.error("Failed to load local image", err);
                 }
             } else {
                 setSrc(props.src);
             }
        };

        loadLocalImage();

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [props.src]);

    return (
        <img
            className="max-w-full h-auto rounded-md shadow-sm my-4 mx-auto"
            alt={props.alt || "Markdown Image"}
            {...props}
            src={src}
        />
    );
};

interface PreviewProps {
    scrollRef?: MutableRefObject<HTMLDivElement | null>;
}

export function Preview({ scrollRef }: PreviewProps) {
	const currentDoc = useStore((state) => state.currentDoc);
    const previewFont = useStore((state) => state.previewFont);
    const setPreviewFont = useStore((state) => state.setPreviewFont);
	const contentRef = useRef<HTMLDivElement>(null);

	const handlePrint = useReactToPrint({
		contentRef: contentRef,
		documentTitle: currentDoc?.title || "document",
		onAfterPrint: () => console.log("Printed successfully"),
	});

    const getFontFamily = () => {
        switch (previewFont) {
            case "serif":
                return '"Merriweather", "Georgia", serif';
            case "mono":
                return '"Geist Mono", monospace';
            case "inter":
                return 'Inter, system-ui, sans-serif';
            case "arial":
                return 'Arial, Helvetica, sans-serif';
            case "times":
                return '"Times New Roman", Times, serif';
            case "georgia":
                return 'Georgia, serif';
            case "courier":
                return '"Courier New", Courier, monospace';
            case "sans":
            default:
                return '"Geist Sans", sans-serif';
        }
    };

	if (!currentDoc) {
		return (
			<div className="h-full flex items-center justify-center text-muted-foreground bg-gray-100 dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800">
				<p>Select a document to preview.</p>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col bg-gray-100 dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 relative">
			<div className="h-14 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 bg-white dark:bg-zinc-950 shrink-0">
				<h2 className="font-medium text-sm text-muted-foreground truncate max-w-[200px]">
					Preview
				</h2>
				<div className="flex items-center gap-2">
                    <div className="relative">
                        <Type className="absolute left-2 top-2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <select
                            value={previewFont}
                            onChange={(e) => setPreviewFont(e.target.value)}
                            className="h-8 w-40 appearance-none rounded-md border border-input bg-background pl-8 pr-8 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="sans">Geist Sans</option>
                            <option value="serif">Merriweather</option>
                            <option value="mono">Geist Mono</option>
                            <option value="inter">Inter</option>
                            <option value="arial">Arial</option>
                            <option value="times">Times New Roman</option>
                            <option value="georgia">Georgia</option>
                            <option value="courier">Courier New</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-2 h-4 w-4 text-muted-foreground opacity-50" />
                    </div>
					<Button
						onClick={() => handlePrint()}
						size="sm"
						variant="outline"
						className="h-8"
					>
						<Printer className="w-4 h-4 mr-2" />
						Print / PDF
					</Button>
				</div>
			</div>

			<div
                ref={scrollRef}
                className="flex-1 overflow-auto flex justify-center items-start scroll-smooth"
            >
				<div
					ref={contentRef}
					className={cn(
						"bg-white dark:bg-zinc-950 shadow-lg p-[10mm] min-h-[297mm] w-[210mm]",
						"mx-auto transition-colors duration-200",
						"prose prose-zinc max-w-none dark:prose-invert",
						"print:shadow-none print:m-0 print:w-full print:h-auto print:overflow-visible print:p-0",
					)}
					style={{
						fontFamily: getFontFamily(),
					}}
				>
					<style type="text/css" media="print">
						{`
                    @page { size: auto; margin: 20mm; }
                    body { -webkit-print-color-adjust: exact; }
                `}
					</style>
					<ReactMarkdown
						remarkPlugins={[remarkGfm]}
						components={{
							// biome-ignore lint/suspicious/noExplicitAny: Complex type
							code: CodeBlock as any,
							// biome-ignore lint/suspicious/noExplicitAny: Complex type
							img: MarkdownImage,
							table: ({ node, ...props }) => (
								<div className="overflow-x-auto my-4">
									<table
										className="w-full text-sm border-collapse"
										{...props}
									/>
								</div>
							),
							th: ({ node, ...props }) => (
								<th
									className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 font-semibold"
									{...props}
								/>
							),
							td: ({ node, ...props }) => (
								<td
									className="border border-zinc-300 dark:border-zinc-700 px-4 py-2"
									{...props}
								/>
							),
						}}
					>
						{currentDoc.content}
					</ReactMarkdown>
				</div>
			</div>
		</div>
	);
}
