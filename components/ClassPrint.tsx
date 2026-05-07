import { forwardRef } from 'react';
import { Student, Subject, Enrollment, Attendance } from '@/types';

interface ClassPrintProps {
  type: 'list' | 'grades' | 'grades-all' | 'attendance' | 'attendance-all';
  subject: Subject | null;
  students: Student[];
  enrollments: Enrollment[];
  attendances: Attendance[];
  attendanceDate: string;
}

export const ClassPrint = forwardRef<HTMLDivElement, ClassPrintProps>(({ type, subject, students, enrollments, attendances, attendanceDate }, ref) => {
  if (!subject) return null;

  const getStudentScore = (studentId: string) => {
    const enr = enrollments.find(e => e.studentId === studentId && e.subjectId === subject.id);
    return enr?.score || '';
  };

  const isPresent = (studentId: string, date: string) => {
    const att = attendances.find(a => a.studentId === studentId && a.subjectId === subject.id && a.date === date);
    return att?.present ? 'X' : '';
  };

  const allDates = Array.from(new Set(attendances.filter(a => a.subjectId === subject.id).map(a => a.date))).sort();

  return (
    <div ref={ref} className="bg-white text-black p-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold uppercase">
          {type === 'list' && 'Danh Sách Lớp Học / Năng Khiếu'}
          {(type === 'grades' || type === 'grades-all') && 'Bảng Điểm Môn Học'}
          {(type === 'attendance' || type === 'attendance-all') && 'Danh Sách Điểm Danh'}
        </h1>
        <h2 className="text-lg font-semibold mt-2">Môn: {subject.name}</h2>
        <p className="text-neutral-600 mt-1">Tổng số: {students.length} thiếu nhi</p>
        
        {type === 'attendance' && (
          <p className="text-neutral-600 font-medium mt-1">Ngày điểm danh: {new Date(attendanceDate).toLocaleDateString('vi-VN')}</p>
        )}
        {(type === 'attendance-all' || type === 'grades-all') && allDates.length > 0 && (
          <p className="text-neutral-600 font-medium mt-1">Điểm danh từ {new Date(allDates[0]).toLocaleDateString('vi-VN')} đến {new Date(allDates[allDates.length - 1]).toLocaleDateString('vi-VN')}</p>
        )}
      </div>

      <table className="w-full text-sm border-collapse border border-neutral-800 mt-4">
        <thead>
          <tr className="bg-neutral-100">
            <th className="border border-neutral-800 px-2 py-2 w-10 text-center">STT</th>
            <th className="border border-neutral-800 px-2 py-2 text-left">Họ và tên</th>
            <th className="border border-neutral-800 px-2 py-2 text-center w-24">Ngày sinh</th>
            <th className="border border-neutral-800 px-2 py-2 text-center w-24">Trường/Lớp</th>
            
            {type === 'list' && (
              <>
                <th className="border border-neutral-800 px-2 py-2 text-left w-24">Lớp GL</th>
                <th className="border border-neutral-800 px-2 py-2 text-left w-32">SĐT Liên hệ</th>
                <th className="border border-neutral-800 px-2 py-2 text-left">Ghi chú</th>
              </>
            )}

            {(type === 'attendance-all' || type === 'grades-all') && allDates.map(date => (
              <th key={date} className="border border-neutral-800 px-1 py-2 text-center text-xs w-16 whitespace-nowrap">
                {new Date(date).getDate()}/{new Date(date).getMonth() + 1}
              </th>
            ))}

            {(type === 'grades' || type === 'grades-all') && (
              <>
                <th className="border border-neutral-800 px-2 py-2 text-center w-24">Điểm số</th>
                <th className="border border-neutral-800 px-2 py-2 text-left">Nhận xét</th>
              </>
            )}

            {type === 'attendance' && (
              <>
                <th className="border border-neutral-800 px-2 py-2 text-center w-24">Có mặt</th>
                <th className="border border-neutral-800 px-2 py-2 text-center w-24">Phép</th>
                <th className="border border-neutral-800 px-2 py-2 text-center w-24">Không phép</th>
                <th className="border border-neutral-800 px-2 py-2 text-left">Ghi chú</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={student.id}>
              <td className="border border-neutral-800 px-2 py-1 text-center">{index + 1}</td>
              <td className="border border-neutral-800 px-2 py-1 font-medium">{student.name}</td>
              <td className="border border-neutral-800 px-2 py-1 text-center text-xs">{new Date(student.dateOfBirth).toLocaleDateString('vi-VN')}</td>
              <td className="border border-neutral-800 px-2 py-1 text-center text-xs">{student.grade}</td>
              
              {type === 'list' && (
                <>
                  <td className="border border-neutral-800 px-2 py-1 text-xs">{student.catechismClass}</td>
                  <td className="border border-neutral-800 px-2 py-1 text-xs">{student.parentPhone || student.phone || ''}</td>
                  <td className="border border-neutral-800 px-2 py-1"></td>
                </>
              )}

              {(type === 'attendance-all' || type === 'grades-all') && allDates.map(date => (
                <td key={date} className="border border-neutral-800 px-1 py-1 text-center font-bold text-blue-700">
                  {isPresent(student.id, date)}
                </td>
              ))}

              {(type === 'grades' || type === 'grades-all') && (
                <>
                  <td className="border border-neutral-800 px-2 py-1 text-center font-bold">{getStudentScore(student.id)}</td>
                  <td className="border border-neutral-800 px-2 py-1 text-xs"></td>
                </>
              )}

              {type === 'attendance' && (
                <>
                  <td className="border border-neutral-800 px-2 py-1 text-center font-bold text-lg">{isPresent(student.id, attendanceDate)}</td>
                  <td className="border border-neutral-800 px-2 py-1"></td>
                  <td className="border border-neutral-800 px-2 py-1"></td>
                  <td className="border border-neutral-800 px-2 py-1"></td>
                </>
              )}
            </tr>
          ))}
          {students.length === 0 && (
            <tr>
              <td colSpan={10} className="border border-neutral-800 px-2 py-4 text-center italic text-neutral-500">
                Chưa có học viên nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex justify-between mt-12 px-8">
        <div className="text-center w-40">
        </div>
        <div className="text-center">
          <p className="font-semibold text-sm mb-16">Giáo viên phụ trách</p>
          <p className="text-xs pt-1 text-neutral-500 w-40 mx-auto">(Ký, ghi rõ họ tên)</p>
        </div>
      </div>
    </div>
  );
});

ClassPrint.displayName = 'ClassPrint';
