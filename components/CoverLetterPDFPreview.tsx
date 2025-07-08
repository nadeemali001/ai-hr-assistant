import React, { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface CoverLetterPDFPreviewProps {
  text: string;
}

const templates: Record<string, string> = {
  solid: '#dceeff',
  floral: 'url(/templates/floral.png)',
  pattern: 'url(/templates/pattern.png)',
};

const CoverLetterPDFPreview: React.FC<CoverLetterPDFPreviewProps> = ({ text }) => {
  const [template, setTemplate] = useState('solid');
  const previewRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    const element = previewRef.current;
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    pdf.addImage(imgData, 'PNG', 0, 0, 595, 842);
    pdf.save('cover_letter.pdf');
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-lg font-bold mb-4">PDF Template & Preview</h2>
      <div className="flex flex-col sm:flex-row gap-4 items-center mb-4">
        <label className="font-semibold text-slate-700">Template:</label>
        <select
          className="p-2 border rounded"
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
        >
          <option value="solid">Solid Color</option>
          <option value="floral">Floral Background</option>
          <option value="pattern">Pattern</option>
        </select>
        <button
          onClick={downloadPDF}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-indigo-700"
        >
          Generate PDF
        </button>
      </div>
      <div
        ref={previewRef}
        className="mx-auto border shadow-lg rounded overflow-hidden"
        style={{
          width: '595px',
          height: '842px',
          background: templates[template],
          backgroundSize: 'cover',
          padding: '60px 48px',
          color: '#222',
          fontFamily: 'Times New Roman, Times, serif',
          fontSize: '18px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ whiteSpace: 'pre-wrap', width: '100%' }}>{text}</div>
      </div>
    </div>
  );
};

export default CoverLetterPDFPreview; 