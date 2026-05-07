import { useState, useMemo } from 'react';
import { Plus, Search, MoreHorizontal, Pencil, Trash, Printer, FileText, List, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Student, Subject, Enrollment, Attendance } from '@/types';
import { StudentDialog } from '@/components/StudentDialog';
import { PrintCardDialog } from '@/components/PrintCardDialog';
import { PrintMultipleCardsDialog } from '@/components/PrintMultipleCardsDialog';
import { ReportCardDialog } from '@/components/ReportCardDialog';
import { StudentListPrint } from '@/components/StudentListPrint';
import { PrintListDialog } from '@/components/PrintListDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';

interface StudentsTabProps {
  students: Student[];
  subjects: Subject[];
  enrollments: Enrollment[];
  attendances: Attendance[];
  role: 'Admin' | 'Teacher';
  onSaveStudent: (student: any, selectedSubjectIds?: string[]) => void;
  onDeleteStudent: (id: string) => void;
}

type SortConfig = {
  key: keyof Student | 'age' | '';
  direction: 'asc' | 'desc';
};

export function StudentsTab({ 
  students, 
  subjects,
  enrollments,
  attendances,
  role,
  onSaveStudent, 
  onDeleteStudent 
}: StudentsTabProps) {
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [isPrintMultipleOpen, setIsPrintMultipleOpen] = useState(false);
  const [isPrintListOpen, setIsPrintListOpen] = useState(false);
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);
  
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [printingStudent, setPrintingStudent] = useState<Student | null>(null);
  const [reportStudent, setReportStudent] = useState<Student | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const openAddDialog = () => {
    setEditingStudent(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (student: Student) => {
    setEditingStudent(student);
    setIsDialogOpen(true);
  };

  const openPrintDialog = (student: Student) => {
    setPrintingStudent(student);
    setIsPrintDialogOpen(true);
  };

  const openReportCard = (student: Student) => {
    setReportStudent(student);
    setIsReportCardOpen(true);
  };

  const handleSort = (key: SortConfig['key']) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }: { columnKey: SortConfig['key'] }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4 text-neutral-400" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="ml-2 h-4 w-4 text-neutral-900" /> : <ArrowDown className="ml-2 h-4 w-4 text-neutral-900" />;
  };

  const filteredStudents = useMemo(() => {
    let result = students.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.grade.toLowerCase().includes(search.toLowerCase()) || 
      s.catechismClass?.toLowerCase().includes(search.toLowerCase())
    );

    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof Student] || '';
        let bValue: any = b[sortConfig.key as keyof Student] || '';

        if (sortConfig.key === 'age') {
          aValue = new Date(a.dateOfBirth).getTime();
          bValue = new Date(b.dateOfBirth).getTime();
        }

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [students, search, sortConfig]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map(s => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handlePrintSelected = () => {
    if (selectedIds.length === 0) return;
    setIsPrintMultipleOpen(true);
  };

  const selectedStudentsForPrint = useMemo(() => {
    return students.filter(s => selectedIds.includes(s.id));
  }, [students, selectedIds]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print-hide">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Tìm kiếm thiếu nhi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {selectedIds.length > 0 && (
            <Button variant="outline" onClick={handlePrintSelected} className="flex-1 sm:flex-none whitespace-nowrap bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:text-indigo-800">
              <Printer className="mr-2 h-4 w-4" /> In {selectedIds.length} thẻ
            </Button>
          )}
          <Button variant="outline" onClick={() => setIsPrintListOpen(true)} className="flex-1 sm:flex-none whitespace-nowrap">
            <List className="mr-2 h-4 w-4" /> In danh sách
          </Button>
          <Button onClick={openAddDialog} className="flex-1 sm:flex-none whitespace-nowrap bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> Thêm
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto print-hide">
        <Table>
          <TableHeader className="bg-neutral-50/50">
            <TableRow>
              <TableHead className="w-[40px] pl-4">
                <Checkbox 
                  checked={selectedIds.length > 0 && selectedIds.length === filteredStudents.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-neutral-100/50 transition-colors" onClick={() => handleSort('name')}>
                <div className="flex items-center">
                  Thiếu nhi <SortIcon columnKey="name" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-neutral-100/50 transition-colors" onClick={() => handleSort('catechismClass')}>
                <div className="flex items-center">
                  Giáo Lý <SortIcon columnKey="catechismClass" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-neutral-100/50 transition-colors" onClick={() => handleSort('grade')}>
                <div className="flex items-center">
                  Trường/Lớp <SortIcon columnKey="grade" />
                </div>
              </TableHead>
              <TableHead>SĐT Liênhệ</TableHead>
              <TableHead className="hidden md:table-cell">Phụ Huynh</TableHead>
              <TableHead className="cursor-pointer hover:bg-neutral-100/50 transition-colors" onClick={() => handleSort('status')}>
                <div className="flex items-center">
                  Trạng thái <SortIcon columnKey="status" />
                </div>
              </TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <TableRow key={student.id} className={`hover:bg-neutral-50/50 ${selectedIds.includes(student.id) ? 'bg-indigo-50/30' : ''}`}>
                  <TableCell className="pl-4">
                    <Checkbox 
                      checked={selectedIds.includes(student.id)}
                      onCheckedChange={() => toggleSelect(student.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {student.avatarUrl ? (
                        <img src={student.avatarUrl} alt={student.name} className="h-10 w-10 rounded-full object-cover border border-neutral-200" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 font-medium">
                          {student.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-neutral-900">{student.name}</div>
                        <div className="text-xs text-neutral-500">
                          {new Date(student.dateOfBirth).toLocaleDateString('vi-VN')} • {student.gender === 'Male' ? 'Nam' : student.gender === 'Female' ? 'Nữ' : 'Khác'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{student.catechismClass}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-neutral-600">{student.grade}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {student.phone ? (
                        <div>HS: {student.phone}</div>
                      ) : null}
                      {student.parentPhone ? (
                        <div className="text-neutral-500">PH: {student.parentPhone}</div>
                      ) : !student.phone && !student.parentPhone ? (
                        <span className="text-neutral-400">---</span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="text-sm">
                      {student.fatherName && <div>Ông: {student.fatherName}</div>}
                      {student.motherName && <div>Bà: {student.motherName}</div>}
                      {!student.fatherName && !student.motherName && <span className="text-neutral-400">---</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        student.status === 'Active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {student.status === 'Active' ? 'Đang học' : 'Đã nghỉ'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", className: "h-8 w-8 p-0" })}>
                        <span className="sr-only">Mở menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEditDialog(student)}>
                            <Pencil className="mr-2 h-4 w-4" /> Sửa thông tin & Môn học
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openReportCard(student)}>
                            <FileText className="mr-2 h-4 w-4" /> Đánh giá & Liên lạc
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openPrintDialog(student)}>
                            <Printer className="mr-2 h-4 w-4" /> In thẻ học sinh
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        {role === 'Admin' && (
                          <DropdownMenuGroup>
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              onClick={() => setDeletingStudentId(student.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" /> Xóa thiếu nhi
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-neutral-500">
                  Không tìm thấy thiếu nhi nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-50/50 text-sm text-neutral-500 print-hide">
        Hiển thị {filteredStudents.length} / {students.length} thiếu nhi
      </div>

      <StudentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        student={editingStudent}
        subjects={subjects}
        enrollments={enrollments}
        onSave={(student, selectedSubjectIds) => {
          onSaveStudent(student, selectedSubjectIds);
          setIsDialogOpen(false);
        }}
      />

      <PrintCardDialog
        open={isPrintDialogOpen}
        onOpenChange={setIsPrintDialogOpen}
        student={printingStudent}
      />

      <PrintMultipleCardsDialog
        open={isPrintMultipleOpen}
        onOpenChange={setIsPrintMultipleOpen}
        students={selectedStudentsForPrint}
      />

      <ReportCardDialog 
        open={isReportCardOpen}
        onOpenChange={setIsReportCardOpen}
        student={reportStudent}
        subjects={subjects}
        enrollments={enrollments}
        attendances={attendances}
      />

      <PrintListDialog
        open={isPrintListOpen}
        onOpenChange={setIsPrintListOpen}
        students={filteredStudents}
      />

      <ConfirmDialog
        isOpen={!!deletingStudentId}
        title="Xóa Thiếu Nhi"
        description="Bạn có chắc chắn muốn xóa thiếu nhi này không? Thao tác này không thể hoàn tác."
        onConfirm={() => {
          if (deletingStudentId) onDeleteStudent(deletingStudentId);
        }}
        onCancel={() => setDeletingStudentId(null)}
      />
    </div>
  );
}
