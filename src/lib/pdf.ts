import html2pdf from "html2pdf.js";

export const generatePDF = (
	element: HTMLElement,
	filename: string,
): Promise<void> => {
	const isMobile = window.innerWidth < 768;
	const opt = {
		margin: [10, 10, 10, 10], // top, left, bottom, right in mm
		filename: filename,
		image: { type: "jpeg", quality: 0.98 },
		html2canvas: {
			scale: isMobile ? 1.5 : 2, // Reduce scale on mobile to save memory
			useCORS: true,
			letterRendering: true,
			scrollY: 0,
		},
		jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
	};

	return html2pdf().set(opt).from(element).save();
};
