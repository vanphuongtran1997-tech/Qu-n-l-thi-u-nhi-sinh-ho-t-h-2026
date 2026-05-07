import { Student } from '@/types';
import { forwardRef } from 'react';

interface PrintListProps {
  students: Student[];
}

export const StudentListPrint = forwardRef<HTMLDivElement, PrintListProps>(({ students }, ref) => {
  return (
    <div ref={ref} className="bg-white text-black p-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold uppercase">Danh Sách Thiếu Nhi Sinh Hoạt Hè 2026</h1>
        <p className="text-neutral-600 mt-1">Tổng số: {students.length} thiếu nhi</p>
      </div>

      <table className="w-full text-sm border-collapse border border-neutral-800">
        <thead>
          <tr className="bg-neutral-100">
            <th className="border border-neutral-800 px-2 py-2 w-10 text-center">STT</th>
            <th className="border border-neutral-800 px-2 py-2 text-left">Họ và tên</th>
            <th className="border border-neutral-800 px-2 py-2 text-center w-24">Ngày sinh</th>
            <th className="border border-neutral-800 px-2 py-2 text-center w-16">Giới tính</th>
            <th className="border border-neutral-800 px-2 py-2 text-left w-24">Lớp GL</th>
            <th className="border border-neutral-800 px-2 py-2 text-left">Trường/Lớp</th>
            <th className="border border-neutral-800 px-2 py-2 text-left">Phụ huynh</th>
            <th className="border border-neutral-800 px-2 py-2 text-left w-24">SĐT</th>
            <th className="border border-neutral-800 px-2 py-2 text-center w-24">Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={student.id}>
              <td className="border border-neutral-800 px-2 py-1 text-center">{index + 1}</td>
              <td className="border border-neutral-800 px-2 py-1 font-medium">{student.name}</td>
              <td className="border border-neutral-800 px-2 py-1 text-center text-xs">{new Date(student.dateOfBirth).toLocaleDateString('vi-VN')}</td>
              <td className="border border-neutral-800 px-2 py-1 text-center text-xs">{student.gender === 'Male' ? 'Nam' : student.gender === 'Female' ? 'Nữ' : 'Khác'}</td>
              <td className="border border-neutral-800 px-2 py-1 text-xs">{student.catechismClass}</td>
              <td className="border border-neutral-800 px-2 py-1 text-xs">{student.grade}</td>
              <td className="border border-neutral-800 px-2 py-1 text-xs">{student.fatherName || student.motherName || ''}</td>
              <td className="border border-neutral-800 px-2 py-1 text-xs">{student.parentPhone || student.phone || ''}</td>
              <td className="border border-neutral-800 px-2 py-1"></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

StudentListPrint.displayName = 'StudentListPrint';
