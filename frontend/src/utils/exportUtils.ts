import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
 * Export JSON data to PDF (Academic Table format)
 * @param columns Array of column headers/keys e.g. [{ header: 'Name', dataKey: 'name' }]
 * @param data Array of objects
 * @param fileName Name of the file (without extension)
 * @param title Title of the PDF document
 */
export const exportToPDF = (columns: any[], data: any[], fileName: string, title: string) => {
    try {
        const doc = new jsPDF('landscape');

        // Add Academic Header
        doc.setFontSize(22);
        doc.setTextColor(33, 37, 41); // Dark Gray
        doc.text('Advanced Academic Evaluation System', 14, 22);

        doc.setFontSize(14);
        doc.setTextColor(79, 70, 229); // Indigo 600
        doc.text(`Official Report: ${title}`, 14, 32);

        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // Slate 500
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 40);

        doc.setLineWidth(0.5);
        doc.setDrawColor(226, 232, 240); // Slate 200
        doc.line(14, 45, 280, 45);

        // Generate Table
        autoTable(doc, {
            columns: columns,
            body: data,
            startY: 50,
            theme: 'grid',
            headStyles: {
                fillColor: [79, 70, 229], // Indigo 600
                textColor: 255,
                fontStyle: 'bold',
                halign: 'center'
            },
            bodyStyles: {
                textColor: 50,
                halign: 'center'
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252] // Slate 50
            },
            styles: {
                fontSize: 10,
                cellPadding: 4,
                lineColor: [226, 232, 240], // Slate 200
                lineWidth: 0.1
            },
            margin: { top: 50, left: 14, right: 14, bottom: 20 },
            didDrawPage: function (data) {
                // Footer
                doc.setFontSize(8);
                doc.setTextColor(148, 163, 184); // Slate 400
                doc.text(
                    `Page ${data.pageNumber} • Confidential Academic Record`,
                    data.settings.margin.left,
                    doc.internal.pageSize.height - 10
                );
            }
        });

        doc.save(`${fileName}_${new Date().getTime()}.pdf`);
    } catch (error) {
        console.error("PDF Generation failed:", error);
    }
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
