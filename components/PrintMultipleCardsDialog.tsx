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
import { QRCodeSVG } from 'qrcode.react';

interface PrintMultipleCardsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Student[];
}

export function PrintMultipleCardsDialog({ open, onOpenChange, students }: PrintMultipleCardsDialogProps) {
  if (!students || students.length === 0) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('pdf-multiple-cards-export');
    if (!element) return;
    
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
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save(`The_Thieu_Nhi_Hang_Loat.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="print-hide">
          <DialogTitle>In Hàng Loạt Thẻ Thiếu Nhi ({students.length} thẻ)</DialogTitle>
        </DialogHeader>
        
        <div className="py-6 bg-neutral-100 rounded-lg print-hide">
          <p className="text-sm text-neutral-500 mb-4 text-center">Xem trước thẻ (In trang A4 ngang hoặc dọc)</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 place-items-center p-4">
            {students.slice(0, 4).map(student => (
              <StudentCardPreview key={student.id} student={student} />
            ))}
            {students.length > 4 && (
              <div className="col-span-full py-4 text-neutral-500 font-medium">
                ... Và {students.length - 4} thẻ khác
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="print-hide">
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

      <div className="absolute top-[-9999px] left-[-9999px]">
        <div id="pdf-multiple-cards-export" className="print-document bg-white w-[210mm] p-[10mm]">
          <div className="grid grid-cols-2 gap-[10mm]">
            {students.map(student => (
              <StudentCardPreview key={student.id} student={student} printMode />
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
}

function StudentCardPreview({ student, printMode = false }: { student: Student; printMode?: boolean }) {
  const qrData = JSON.stringify({
    id: student.id,
    name: student.name,
    class: student.catechismClass
  });

  return (
    <div 
      className={`w-[340px] h-[215px] bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden relative ${printMode ? 'shadow-none !border-black' : ''}`}
      style={{ 
        backgroundImage: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
        pageBreakInside: 'avoid',
      }}
    >
      <div className="bg-blue-600 h-12 w-full flex items-center justify-center -webkit-print-color-adjust-exact print-color-adjust-exact">
        <h2 className="text-white font-bold text-sm tracking-widest uppercase">Thẻ Thiếu Nhi Sinh Hoạt Hè</h2>
      </div>
      
      <div className="p-4 flex gap-4 h-[calc(100%-48px)]">
        <div className="flex flex-col items-center justify-start h-full w-24">
          {student.avatarUrl ? (
            <img 
              src={student.avatarUrl} 
              alt={student.name} 
              className="w-20 h-24 object-cover border-2 border-white shadow-sm"
            />
          ) : (
            <div className="w-20 h-24 bg-neutral-200 border-2 border-white shadow-sm flex items-center justify-center text-neutral-400">
              Ảnh
            </div>
          )}
          <div className="text-[10px] text-neutral-500 mt-2 text-center uppercase leading-tight font-semibold">
            Mã: {student.id.toUpperCase()}
          </div>
        </div>
        
        <div className="flex-1 flex flex-col justify-start pt-1 space-y-1.5 h-full relative">
          <div className="mb-2 pr-12">
            <div className="text-[10px] text-blue-600 font-bold uppercase">Họ và tên</div>
            <div className="font-bold text-[15px] leading-tight text-neutral-900">{student.name}</div>
          </div>
          
          <div className="absolute top-1 right-0 border border-neutral-200 p-1 bg-white rounded">
            <QRCodeSVG value={qrData} size={48} level="M" />
          </div>
          
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mt-2">
            <div>
              <div className="text-[9px] text-neutral-500 uppercase">Ngày sinh</div>
              <div className="font-semibold text-xs">{new Date(student.dateOfBirth).toLocaleDateString('vi-VN')}</div>
            </div>
            <div>
              <div className="text-[9px] text-neutral-500 uppercase">Giới tính</div>
              <div className="font-semibold text-xs">{student.gender === 'Male' ? 'Nam' : student.gender === 'Female' ? 'Nữ' : 'Khác'}</div>
            </div>
            <div>
              <div className="text-[9px] text-neutral-500 uppercase">Trường/Lớp</div>
              <div className="font-semibold text-xs">{student.grade}</div>
            </div>
            <div>
              <div className="text-[9px] text-neutral-500 uppercase">Giáo lý</div>
              <div className="font-semibold text-xs text-blue-700">{student.catechismClass}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
