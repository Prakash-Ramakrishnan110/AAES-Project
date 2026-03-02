import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Re-declare jspdf with autotable plugin if needed by TS
declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
}

/**
 * Export JSON data to Excel
 * @param data Array of objects
 * @param fileName Name of the file (without extension)
 * @param sheetName Name of the sheet
 */
export const exportToExcel = (data: any[], fileName: string, sheetName: string = 'Sheet1') => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${fileName}_${new Date().getTime()}.xlsx`);
};

/**
 * Export JSON data to PDF (Table format)
 * @param columns Array of column headers/keys e.g. [{ header: 'Name', dataKey: 'name' }]
 * @param data Array of objects
 * @param fileName Name of the file (without extension)
 * @param title Title of the PDF document
 */
export const exportToPDF = (columns: any[], data: any[], fileName: string, title: string) => {
    const doc = new jsPDF();

    // Add Title
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    doc.autoTable({
        columns: columns,
        body: data,
        startY: 35,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
        styles: { fontSize: 9 }
    });

    doc.save(`${fileName}_${new Date().getTime()}.pdf`);
};

/**
 * Common export combinations
 */
export const academicExport = (data: any[], type: 'excel' | 'pdf', fileName: string, title: string) => {
    if (type === 'excel') {
        exportToExcel(data, fileName);
    } else {
        const columns = data.length > 0 ? Object.keys(data[0]).map(key => ({
            header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
            dataKey: key
        })) : [];
        exportToPDF(columns, data, fileName, title);
    }
};
