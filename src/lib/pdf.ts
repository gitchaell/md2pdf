import html2pdf from "html2pdf.js";

export const generatePDF = (element: HTMLElement, filename: string) => {
	const opt = {
		margin: [10, 10, 10, 10], // top, left, bottom, right in mm
		filename: filename,
		image: { type: "jpeg", quality: 0.98 },
		html2canvas: {
			scale: 2,
			useCORS: true,
			letterRendering: true,
			scrollY: 0,
		},
		jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
	};

	html2pdf().set(opt).from(element).save();
};
