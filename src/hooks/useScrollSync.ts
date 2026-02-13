import type { editor } from "monaco-editor";
import { type RefObject, useEffect, useRef } from "react";

// This implementation uses flags to prevent cyclic scrolling updates.
// We capture the "source" of the scroll (editor or preview) and ignore
// the scroll event on the other side if it was triggered by our sync.

export function useScrollSync(
	editorRef: RefObject<editor.IStandaloneCodeEditor | null>,
	previewRef: RefObject<HTMLElement | null>,
	enabled = true,
) {
	const isSyncingLeft = useRef(false);
	const isSyncingRight = useRef(false);

	useEffect(() => {
		const editor = editorRef.current;
		const preview = previewRef.current;

		if (!enabled || !editor || !preview) return;

		const handleEditorScroll = (e: editor.IScrollEvent) => {
			if (!e.scrollTopChanged) return;

			if (isSyncingLeft.current) {
				isSyncingLeft.current = false;
				return;
			}

			isSyncingRight.current = true;

			const scrollHeight = e.scrollHeight;
			const clientHeight = e.layoutInfo.height;
			const scrollTop = e.scrollTop;

			if (scrollHeight <= clientHeight) return;

			const percentage = scrollTop / (scrollHeight - clientHeight);

			const previewScrollHeight = preview.scrollHeight;
			const previewClientHeight = preview.clientHeight;

			preview.scrollTop =
				percentage * (previewScrollHeight - previewClientHeight);

			// Release lock after a short delay
			setTimeout(() => {
				isSyncingRight.current = false;
			}, 100);
		};

		const handlePreviewScroll = () => {
			if (isSyncingRight.current) {
				isSyncingRight.current = false;
				return;
			}

			isSyncingLeft.current = true;

			const scrollTop = preview.scrollTop;
			const scrollHeight = preview.scrollHeight;
			const clientHeight = preview.clientHeight;

			if (scrollHeight <= clientHeight) return;

			const percentage = scrollTop / (scrollHeight - clientHeight);

			const editorScrollHeight = editor.getScrollHeight();
			const editorClientHeight = editor.getLayoutInfo().height;

			editor.setScrollTop(
				percentage * (editorScrollHeight - editorClientHeight),
			);

			// Release lock after a short delay
			setTimeout(() => {
				isSyncingLeft.current = false;
			}, 100);
		};

		const disposable = editor.onDidScrollChange(handleEditorScroll);
		preview.addEventListener("scroll", handlePreviewScroll);

		return () => {
			disposable.dispose();
			preview.removeEventListener("scroll", handlePreviewScroll);
		};
	}, [editorRef.current, previewRef.current, enabled]);
}
