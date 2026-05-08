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
import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface PrintCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
}

export function PrintCardDialog({ open, onOpenChange, student }: PrintCardDialogProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!student) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('print-card-content');
    if (!element) return;
    
    // Create canvas
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      letterRendering: true,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF({
      unit: 'mm',
      format: [86, 54],
      orientation: 'landscape'
    });
    
    pdf.addImage(imgData, 'JPEG', 0, 0, 86, 54);
    pdf.save(`The_Thieu_Nhi_${student.name}.pdf`);
  };

  // Generate a JSON string containing the essential info for scanning/attendance
  const qrData = JSON.stringify({
    id: student.id,
    name: student.name,
    class: student.catechismClass
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden">
        <DialogHeader className="print-hide">
          <DialogTitle>In Thẻ Học Sinh</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-6 bg-neutral-100 rounded-lg print-hide">
          <p className="text-sm text-neutral-500 mb-4">Xem trước thẻ (Kích thước thực: ~86mm x 54mm)</p>
          
          {/* Card Preview in Dialog */}
          <StudentCardPreview student={student} qrData={qrData} />
        </div>
        
        <DialogFooter className="print-hide">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button onClick={handleExportPDF} className="bg-green-600 hover:bg-green-700">
            <Download className="mr-2 h-4 w-4" /> Xuất PDF
          </Button>
          <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
            <Printer className="mr-2 h-4 w-4" /> In Thẻ Ngay
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Hidden print document for both window.print and html2pdf */}
      <div className="absolute top-[-9999px] left-[-9999px]">
        <div id="print-card-content" className="print-document">
          <StudentCardPreview student={student} qrData={qrData} printMode />
        </div>
      </div>
    </Dialog>
  );
}

function StudentCardPreview({ student, qrData, printMode = false }: { student: Student; qrData: string; printMode?: boolean }) {
  return (
    <div 
      className={`w-[340px] h-[215px] bg-white rounded-xl overflow-hidden relative ${printMode ? 'border-0' : 'shadow-lg border border-neutral-200'}`}
      style={{ 
        backgroundImage: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
        width: printMode ? '86mm' : '340px',
        height: printMode ? '54mm' : '215px',
      }}
    >
      {/* Header branding */}
      <div className="bg-blue-600 h-12 w-full flex items-center justify-center -webkit-print-color-adjust-exact print-color-adjust-exact" style={{ height: printMode ? '12mm' : '48px' }}>
        <h2 className="text-white font-bold text-sm tracking-widest uppercase" style={{ fontSize: printMode ? '3.5mm' : '14px' }}>Thẻ Thiếu Nhi Sinh Hoạt Hè</h2>
      </div>
      
      <div className="p-4 flex gap-4 h-[calc(100%-48px)]" style={{ padding: printMode ? '3mm' : '16px', gap: printMode ? '3mm' : '16px' }}>
        {/* Left Column: Photo */}
        <div className="flex flex-col items-center justify-start h-full" style={{ width: printMode ? '22mm' : '96px' }}>
          {student.avatarUrl ? (
            <img 
              src={student.avatarUrl} 
              alt={student.name} 
              className="object-cover border-2 border-white shadow-sm"
              style={{ width: printMode ? '20mm' : '80px', height: printMode ? '24mm' : '96px' }}
            />
          ) : (
            <div className="bg-neutral-200 border-2 border-white shadow-sm flex items-center justify-center text-neutral-400" style={{ width: printMode ? '20mm' : '80px', height: printMode ? '24mm' : '96px' }}>
              Ảnh
            </div>
          )}
          <div className="text-neutral-500 mt-2 text-center uppercase leading-tight font-semibold" style={{ fontSize: printMode ? '2mm' : '10px' }}>
            Mã: {student.id.toUpperCase()}
          </div>
        </div>
        
        {/* Right Column: Information */}
        <div className="flex-1 flex flex-col justify-start pt-1 space-y-1.5 h-full relative">
          <div className="mb-2 pr-12">
            <div className="text-blue-600 font-bold uppercase" style={{ fontSize: printMode ? '2mm' : '10px' }}>Họ và tên</div>
            <div className="font-bold leading-tight text-neutral-900" style={{ fontSize: printMode ? '4mm' : '15px' }}>{student.name}</div>
          </div>
          
          {/* QR Code in top right of details */}
          <div className="absolute top-1 right-0 border border-neutral-200 p-1 bg-white rounded">
            <QRCodeSVG value={qrData} size={printMode ? 44 : 48} level="M" />
          </div>
          
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mt-2">
            <div>
              <div className="text-neutral-500 uppercase" style={{ fontSize: printMode ? '1.8mm' : '9px' }}>Ngày sinh</div>
              <div className="font-semibold" style={{ fontSize: printMode ? '2.5mm' : '12px' }}>{new Date(student.dateOfBirth).toLocaleDateString('vi-VN')}</div>
            </div>
            <div>
              <div className="text-neutral-500 uppercase" style={{ fontSize: printMode ? '1.8mm' : '9px' }}>Giới tính</div>
              <div className="font-semibold" style={{ fontSize: printMode ? '2.5mm' : '12px' }}>{student.gender === 'Male' ? 'Nam' : student.gender === 'Female' ? 'Nữ' : 'Khác'}</div>
            </div>
            <div>
              <div className="text-neutral-500 uppercase" style={{ fontSize: printMode ? '1.8mm' : '9px' }}>Trường/Lớp</div>
              <div className="font-semibold" style={{ fontSize: printMode ? '2.5mm' : '12px' }}>{student.grade}</div>
            </div>
            <div>
              <div className="text-neutral-500 uppercase" style={{ fontSize: printMode ? '1.8mm' : '9px' }}>Giáo lý</div>
              <div className="font-semibold text-blue-700" style={{ fontSize: printMode ? '2.5mm' : '12px' }}>{student.catechismClass}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
