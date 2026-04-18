import * as pdfjsLib from 'pdfjs-dist';

// Use a stable CDN for the worker to avoid Vite build configuration complexities
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function extractTextFromPDF(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async function (event) {
      try {
        const typedarray = new Uint8Array(event.target?.result as ArrayBuffer);
        
        // Load the PDF document
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        let fullText = '';

        // Iterate through all pages
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          // @ts-expect-error - The types for TextItem in this version are slightly imperfect, but we know str exists on text items here
          const pageText = textContent.items.map((item: unknown) => (item as { str?: string }).str || "").join(' ');
          fullText += pageText + '\n\n';
        }

        resolve(fullText.trim());
      } catch (error: unknown) {
        console.error('Error parsing PDF:', error);
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
}
