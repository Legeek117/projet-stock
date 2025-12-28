import { Download } from 'lucide-react';
import { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function ExportButton({ data, type = 'sales', period = 'month' }) {
    const [loading, setLoading] = useState(false);

    const exportToPDF = () => {
        setLoading(true);
        try {
            const doc = new jsPDF();

            // En-tête
            doc.setFontSize(20);
            doc.text('OptiStock - Rapport de Ventes', 14, 20);

            doc.setFontSize(10);
            doc.text(`Période: ${period}`, 14, 30);
            doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 14, 35);

            // Tableau des données
            if (data && data.length > 0) {
                const tableData = data.map(item => [
                    item.date || item.name || item.category,
                    item.count || item.total_sold || item.items_sold || '-',
                    `${parseFloat(item.total || item.revenue || 0).toFixed(0)} FCFA`
                ]);

                doc.autoTable({
                    startY: 45,
                    head: [['Date/Produit', 'Quantité', 'Montant']],
                    body: tableData,
                    theme: 'grid',
                    headStyles: { fillColor: [10, 132, 255] },
                    styles: { fontSize: 9 }
                });
            }

            // Pied de page
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.text(
                    `Page ${i} sur ${pageCount}`,
                    doc.internal.pageSize.width / 2,
                    doc.internal.pageSize.height - 10,
                    { align: 'center' }
                );
            }

            doc.save(`rapport-ventes-${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Erreur export PDF:', error);
            alert('Erreur lors de l\'export PDF');
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
        setLoading(true);
        try {
            const worksheetData = data.map(item => ({
                'Date/Produit': item.date || item.name || item.category,
                'Quantité': item.count || item.total_sold || item.items_sold || 0,
                'Montant (FCFA)': parseFloat(item.total || item.revenue || 0).toFixed(0)
            }));

            const worksheet = XLSX.utils.json_to_sheet(worksheetData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventes');

            XLSX.writeFile(workbook, `rapport-ventes-${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (error) {
            console.error('Erreur export Excel:', error);
            alert('Erreur lors de l\'export Excel');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={exportToPDF}
                disabled={loading || !data || data.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
                <Download size={16} />
                PDF
            </button>
            <button
                onClick={exportToExcel}
                disabled={loading || !data || data.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
                <Download size={16} />
                Excel
            </button>
        </div>
    );
}
