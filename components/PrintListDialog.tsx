import { Student } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, Printer } from 'lucide-react';
import { StudentListPrint } from './StudentListPrint';

interface PrintListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Student[];
}

export function PrintListDialog({ open, onOpenChange, students }: PrintListDialogProps) {
  if (!open) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('pdf-list-export');
    if (!element) return;
    
    const container = document.getElementById('pdf-list-container');
    if (container) container.classList.remove('hidden');

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        backgroundColor: '#ffffff'
      });
      
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      });
      
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`Danh_Sach_Thieu_Nhi.pdf`);
    } finally {
      if (container) container.classList.add('hidden');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto print-hide-dialog bg-neutral-100">
        <DialogHeader className="print-hide bg-white p-4 rounded-xl shadow-sm mb-2">
          <DialogTitle>Xem trước bố cục in (Danh sách Thiếu Nhi)</DialogTitle>
          <p className="text-sm text-neutral-500 font-normal">Nhấn Bắt đầu in để in thành file PDF hoặc in ra giấy.</p>
        </DialogHeader>
        
        <div className="print-hide overflow-x-auto pb-4">
          <div className="bg-white min-w-[210mm] min-h-[297mm] shadow-lg border border-neutral-200 mx-auto origin-top" style={{ transform: 'scale(0.85)', transformOrigin: 'top center', marginBottom: '-15%' }}>
            <StudentListPrint students={students} />
          </div>
        </div>
        
        <DialogFooter className="print-hide bg-white p-4 mt-2 rounded-xl sticky bottom-0 border border-neutral-200 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button onClick={handleExportPDF} className="bg-green-600 hover:bg-green-700">
            <Download className="mr-2 h-4 w-4" /> Xuất PDF
          </Button>
          <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
            <Printer className="mr-2 h-4 w-4" /> Bắt đầu in
          </Button>
        </DialogFooter>
      </DialogContent>

      <div id="pdf-list-container" className="hidden">
        <div id="pdf-list-export" className="print-document bg-white w-[210mm] min-h-[297mm] p-[10mm]">
          <StudentListPrint students={students} />
        </div>
      </div>
    </Dialog>
  );
}
