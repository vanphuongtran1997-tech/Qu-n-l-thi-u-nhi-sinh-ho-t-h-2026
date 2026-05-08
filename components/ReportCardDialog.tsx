import { Student, Subject, Enrollment, Attendance } from '@/types';
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
import { useMemo } from 'react';

interface ReportCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  subjects: Subject[];
  enrollments: Enrollment[];
  attendances: Attendance[];
}

export function ReportCardDialog({
  open,
  onOpenChange,
  student,
  subjects,
  enrollments,
  attendances,
}: ReportCardDialogProps) {
  const studentEnrollments = useMemo(() => {
    if (!student) return [];
    return enrollments.filter(e => e.studentId === student.id);
  }, [student, enrollments]);

  if (!student) return null;

  const handleExportPDF = async () => {
    const element = document.getElementById(`report-card-export-${student.id}`);
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
    
    pdf.save(`Phieu_Lien_Lac_${student.name}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader className="print-hide">
          <DialogTitle>Phiếu Liên Lạc & Báo Cáo Kết Quả</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col py-4 max-h-[70vh] overflow-y-auto print-hide">
          <div className="bg-white p-8 max-w-3xl mx-auto border border-neutral-200">
            <ReportCardContent 
              student={student} 
              subjects={subjects} 
              studentEnrollments={studentEnrollments}
              attendances={attendances}
            />
          </div>
        </div>

        <DialogFooter className="print-hide">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button onClick={handleExportPDF} className="bg-green-600 hover:bg-green-700">
            <Download className="mr-2 h-4 w-4" /> Xuất PDF
          </Button>
          <Button onClick={() => window.print()} className="bg-slate-800 hover:bg-slate-900 text-white">
            <Printer className="mr-2 h-4 w-4" /> In Phiếu Liên Lạc
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Hidden print document */}
      <div className="absolute top-[-9999px] left-[-9999px]">
        <div id={`report-card-export-${student.id}`} className="print-document bg-white w-[210mm] min-h-[297mm] p-[10mm]">
          <ReportCardContent 
            student={student} 
            subjects={subjects} 
            studentEnrollments={studentEnrollments}
            attendances={attendances}
          />
        </div>
      </div>
    </Dialog>
  );
}

function ReportCardContent({ 
  student, 
  subjects, 
  studentEnrollments, 
  attendances 
}: { 
  student: Student; 
  subjects: Subject[]; 
  studentEnrollments: Enrollment[]; 
  attendances: Attendance[];
}) {
  return (
    <>
      <div className="text-center mb-8 border-b-2 border-neutral-800 pb-4">
        <h1 className="text-2xl font-bold uppercase tracking-wider mb-1">Phiếu Liên Lạc</h1>
        <h2 className="text-lg font-semibold text-neutral-600">Năm học Hè 2026</h2>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8 text-sm text-black">
        <div>
          <p className="mb-2"><span className="font-semibold w-24 inline-block">Họ và tên:</span> <span className="font-bold text-base">{student.name}</span></p>
          <p className="mb-2"><span className="font-semibold w-24 inline-block">Ngày sinh:</span> {new Date(student.dateOfBirth).toLocaleDateString('vi-VN')}</p>
          <p className="mb-2"><span className="font-semibold w-24 inline-block">Giới tính:</span> {student.gender === 'Male' ? 'Nam' : student.gender === 'Female' ? 'Nữ' : 'Khác'}</p>
        </div>
        <div>
          <p className="mb-2"><span className="font-semibold w-24 inline-block">Trường/Lớp:</span> {student.grade}</p>
          <p className="mb-2"><span className="font-semibold w-24 inline-block">Lớp Giáo Lý:</span> {student.catechismClass}</p>
          <p className="mb-2"><span className="font-semibold w-24 inline-block">Phụ huynh:</span> {student.fatherName || student.motherName || '---'}</p>
        </div>
      </div>

      <div className="mb-8 border border-neutral-300 rounded-md overflow-hidden bg-white text-black">
        <table className="w-full text-sm text-left">
          <thead className="bg-neutral-100 text-neutral-700 font-semibold border-b border-neutral-300">
            <tr>
              <th className="px-4 py-2 border-r border-neutral-300">Môn học / Năng khiếu</th>
              <th className="px-4 py-2 border-r border-neutral-300 text-center w-32">Số buổi đi học</th>
              <th className="px-4 py-2 text-center w-24">Kết quả/Điểm</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-300">
            {studentEnrollments.length > 0 ? (
              studentEnrollments.map((enr) => {
                const subject = subjects.find(s => s.id === enr.subjectId);
                const attendCount = attendances.filter(a => a.studentId === student.id && a.subjectId === enr.subjectId && a.present).length;
                return (
                  <tr key={enr.subjectId}>
                    <td className="px-4 py-2 border-r border-neutral-300 font-medium">{subject?.name || 'Môn học ẩn'}</td>
                    <td className="px-4 py-2 border-r border-neutral-300 text-center">{attendCount}</td>
                    <td className="px-4 py-2 text-center font-bold text-emerald-700">{enr.score || '---'}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-neutral-500 italic">Thiếu nhi chưa đăng ký môn học năng khiếu nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mb-8 text-black">
        <h3 className="font-semibold text-neutral-800 mb-2 uppercase text-sm border-b border-neutral-200 pb-1">Đánh giá quá trình tham gia sinh hoạt</h3>
        <div className="min-h-[100px] p-4 bg-neutral-50 rounded-md text-sm whitespace-pre-wrap border border-neutral-200">
          {student.evaluation || 'Chưa có đánh giá nào cho thiếu nhi này.'}
        </div>
      </div>

      <div className="flex justify-between mt-12 px-8 text-black">
        <div className="text-center">
          <p className="font-semibold text-sm mb-16">Ý kiến Phụ huynh</p>
          <p className="border-t border-neutral-300 text-xs pt-1 text-neutral-500 w-32 mx-auto">(Ký, ghi rõ họ tên)</p>
        </div>
        <div className="text-center">
          <p className="text-sm mb-1 italic text-neutral-500">Ngày ..... tháng ..... năm 2026</p>
          <p className="font-semibold text-sm mb-16">Người phụ trách / Giáo lý viên</p>
          <p className="border-t border-neutral-300 text-xs pt-1 text-neutral-500 w-40 mx-auto">(Ký, ghi rõ họ tên)</p>
        </div>
      </div>
    </>
  );
}
