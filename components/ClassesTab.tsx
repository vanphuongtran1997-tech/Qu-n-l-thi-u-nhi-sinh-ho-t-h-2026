import { useState, useMemo } from 'react';
import { Subject, Student, Enrollment, Attendance } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Printer, List, FileSpreadsheet, CheckSquare } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PrintClassDialog } from '@/components/PrintClassDialog';

import { ConfirmDialog } from '@/components/ConfirmDialog';

interface ClassesTabProps {
  subjects: Subject[];
  students: Student[];
  enrollments: Enrollment[];
  attendances: Attendance[];
  role: 'Admin' | 'Teacher';
  onUpdateEnrollment: (enrollments: Enrollment[]) => void;
  onUpdateAttendance: (attendance: Attendance) => void;
}

export function ClassesTab({ 
  subjects, 
  students, 
  enrollments, 
  attendances, 
  role,
  onUpdateEnrollment,
  onUpdateAttendance,
}: ClassesTabProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [printType, setPrintType] = useState<'list' | 'grades' | 'grades-all' | 'attendance' | 'attendance-all'>('list');
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [unenrollStudentId, setUnenrollStudentId] = useState<string | null>(null);

  const enrolledStudentIds = useMemo(() => {
    return enrollments
      .filter((e) => e.subjectId === selectedSubjectId)
      .map((e) => e.studentId);
  }, [enrollments, selectedSubjectId]);

  const unenrolledStudents = useMemo(() => {
    return students.filter((s) => !enrolledStudentIds.includes(s.id));
  }, [students, enrolledStudentIds]);

  const enrolledStudents = useMemo(() => {
    return students.filter((s) => enrolledStudentIds.includes(s.id));
  }, [students, enrolledStudentIds]);

  const currentSubject = subjects.find(s => s.id === selectedSubjectId) || null;

  const getStudentScore = (studentId: string) => {
    const enrollment = enrollments.find(e => e.studentId === studentId && e.subjectId === selectedSubjectId);
    return enrollment?.score || '';
  };

  const handleScoreChange = (studentId: string, score: string) => {
    const existing = enrollments.find(e => e.studentId === studentId && e.subjectId === selectedSubjectId);
    let newEnrollments;
    if (existing) {
      newEnrollments = enrollments.map(e => 
        (e.studentId === studentId && e.subjectId === selectedSubjectId) ? { ...e, score } : e
      );
    } else {
      newEnrollments = [...enrollments, { subjectId: selectedSubjectId, studentId, score }];
    }
    onUpdateEnrollment(newEnrollments);
  };

  const isStudentPresent = (studentId: string) => {
    const attr = attendances.find(a => a.studentId === studentId && a.subjectId === selectedSubjectId && a.date === attendanceDate);
    return attr ? attr.present : false;
  };

  const handleAttendanceChange = (studentId: string, present: boolean) => {
    onUpdateAttendance({
      studentId,
      subjectId: selectedSubjectId,
      date: attendanceDate,
      present
    });
  };

  const handleEnroll = (studentId: string) => {
    const newEnrollments = [...enrollments, { studentId, subjectId: selectedSubjectId }];
    onUpdateEnrollment(newEnrollments);
  };

  const handleUnenroll = (studentId: string) => {
    setUnenrollStudentId(studentId);
  };

  const confirmUnenroll = () => {
    if (unenrollStudentId) {
      const newEnrollments = enrollments.filter(e => !(e.studentId === unenrollStudentId && e.subjectId === selectedSubjectId));
      onUpdateEnrollment(newEnrollments);
      setUnenrollStudentId(null);
    }
  };

  const handlePrint = (type: 'list' | 'grades' | 'grades-all' | 'attendance' | 'attendance-all') => {
    setPrintType(type);
    setIsPrintDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 print-hide">
        <h2 className="text-lg font-semibold mb-4">Lựa chọn Lớp Học / Năng Khiếu</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-1 block">Chọn Môn học</label>
            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="-- Chọn môn học --" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(sub => (
                  <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-1 block">Ngày điểm danh</label>
            <Input 
              type="date" 
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {selectedSubjectId ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print-hide">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-neutral-200 bg-neutral-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="font-semibold text-neutral-900">Danh sách học viên ({enrolledStudents.length})</h3>
              
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => handlePrint('list')}>
                  <List className="mr-2 h-4 w-4" /> Danh sách
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      <CheckSquare className="mr-2 h-4 w-4" /> Điểm danh
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handlePrint('attendance')}>Trong ngày ({new Date(attendanceDate).toLocaleDateString('vi-VN')})</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePrint('attendance-all')}>Tất cả các ngày</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      <FileSpreadsheet className="mr-2 h-4 w-4" /> Bảng điểm
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handlePrint('grades')}>Chỉ in bảng điểm</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePrint('grades-all')}>Có kèm điểm danh (Tất cả)</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="overflow-x-auto flex-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Họ và Tên</TableHead>
                    <TableHead className="text-center w-[120px]">Điểm danh</TableHead>
                    <TableHead className="w-[120px]">Điểm số</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrolledStudents.length > 0 ? (
                    enrolledStudents.map(student => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium text-neutral-900">{student.name}</TableCell>
                        <TableCell className="text-center">
                          <Checkbox 
                            checked={isStudentPresent(student.id)}
                            onCheckedChange={(checked) => handleAttendanceChange(student.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            className="h-8 w-20 text-center"
                            placeholder="Điểm"
                            value={getStudentScore(student.id)}
                            onChange={(e) => handleScoreChange(student.id, e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          {(role === 'Admin') && (
                            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleUnenroll(student.id)}>
                              Xóa
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-neutral-500">
                        Chưa có học viên nào đăng ký môn này.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden flex flex-col max-h-[600px]">
            <div className="p-4 border-b border-neutral-200 bg-neutral-50/50">
              <h3 className="font-semibold text-neutral-900">Thêm học viên ({unenrolledStudents.length} chưa đăng ký)</h3>
            </div>
            <div className="overflow-y-auto flex-1 p-2">
              {unenrolledStudents.length > 0 ? (
                unenrolledStudents.map(student => (
                  <div key={student.id} className="flex items-center justify-between p-2 hover:bg-neutral-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium">{student.name}</div>
                      <div className="text-xs text-neutral-500">{student.grade} - {student.catechismClass}</div>
                    </div>
                    {role === 'Admin' ? (
                      <Button size="sm" variant="outline" onClick={() => handleEnroll(student.id)}>
                        Thêm
                      </Button>
                    ) : (
                      <span className="text-xs text-neutral-400">---</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-neutral-500">
                  Tất cả thiếu nhi đã được đăng ký vào môn này.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center text-neutral-500 print-hide">
          Vui lòng chọn môn học/năng khiếu để quản lý lớp học.
        </div>
      )}

      {currentSubject && (
        <PrintClassDialog
          open={isPrintDialogOpen}
          onOpenChange={setIsPrintDialogOpen}
          type={printType}
          subject={currentSubject}
          students={enrolledStudents}
          enrollments={enrollments}
          attendances={attendances}
          attendanceDate={attendanceDate}
        />
      )}

      <ConfirmDialog
        isOpen={!!unenrollStudentId}
        title="Hủy đăng ký môn học"
        description="Bạn có chắc chắn muốn hủy đăng ký môn học này cho thiếu nhi?"
        onConfirm={confirmUnenroll}
        onCancel={() => setUnenrollStudentId(null)}
      />
    </div>
  );
}
