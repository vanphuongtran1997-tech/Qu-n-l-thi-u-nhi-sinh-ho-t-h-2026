import { Student, Subject, Enrollment, Attendance } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import html2pdf from 'html2pdf.js';
import { Download, Printer } from 'lucide-react';
import { ClassPrint } from './ClassPrint';

interface PrintClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'list' | 'grades' | 'grades-all' | 'attendance' | 'attendance-all';
  subject: Subject | null;
  students: Student[];
  enrollments: Enrollment[];
  attendances: Attendance[];
  attendanceDate: string;
}

export function PrintClassDialog({ 
  open, 
  onOpenChange, 
  type,
  subject,
  students,
  enrollments,
  attendances,
  attendanceDate
}: PrintClassDialogProps) {
  if (!open) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    const element = document.getElementById('pdf-class-content');
    if (!element) return;
    const opt = {
      margin: 10,
      filename: `Bao_Cao_${type}_${subject?.name || 'Class'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const getTitle = () => {
    if (type === 'list') return 'Danh sách Lớp Học / Năng Khiếu';
    if (type === 'grades' || type === 'grades-all') return 'Bảng Điểm Môn Học';
    if (type === 'attendance' || type === 'attendance-all') return 'Danh Sách Điểm Danh';
    return '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto print-hide-dialog bg-neutral-100">
        <DialogHeader className="print-hide bg-white p-4 rounded-xl shadow-sm mb-2">
          <DialogTitle>Xem trước bố cục in ({getTitle()})</DialogTitle>
          <p className="text-sm text-neutral-500 font-normal">Nhấn Bắt đầu in để in thành file PDF hoặc in ra giấy.</p>
        </DialogHeader>
        
        <div className="print-hide overflow-x-auto pb-4">
          <div className="bg-white min-w-[210mm] min-h-[297mm] shadow-lg border border-neutral-200 mx-auto origin-top" style={{ transform: 'scale(0.85)', transformOrigin: 'top center', marginBottom: '-15%' }}>
            <div id="pdf-class-content">
              <ClassPrint 
                type={type}
                subject={subject}
                students={students}
                enrollments={enrollments}
                attendances={attendances}
                attendanceDate={attendanceDate}
              />
            </div>
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

      <div className="hidden print:block print-document bg-white">
        <ClassPrint 
          type={type}
          subject={subject}
          students={students}
          enrollments={enrollments}
          attendances={attendances}
          attendanceDate={attendanceDate}
        />
      </div>
    </Dialog>
  );
}
