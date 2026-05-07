import { useState, useMemo } from 'react';
import { Teacher, Subject } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Search, Plus, Pencil, Trash, User } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface TeachersTabProps {
  teachers: Teacher[];
  subjects: Subject[];
  onSaveTeacher: (teacher: any) => void;
  onDeleteTeacher: (id: string) => void;
}

export function TeachersTab({ teachers, subjects, onSaveTeacher, onDeleteTeacher }: TeachersTabProps) {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacherId, setDeletingTeacherId] = useState<string | null>(null);

  const [formData, setFormData] = useState<any>({
    name: '',
    username: '',
    password: '',
    phone: '',
    assignedSubjectIds: [] as string[]
  });

  const filteredTeachers = useMemo(() => {
    if (!search.trim()) return teachers;
    return teachers.filter(t => 
      t.name.toLowerCase().includes(search.toLowerCase()) || 
      t.username.toLowerCase().includes(search.toLowerCase())
    );
  }, [teachers, search]);

  const openAddDialog = () => {
    setEditingTeacher(null);
    setFormData({
      name: '',
      username: '',
      password: '',
      phone: '',
      assignedSubjectIds: []
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      username: teacher.username,
      password: teacher.password || '',
      phone: teacher.phone || '',
      assignedSubjectIds: [...teacher.assignedSubjectIds]
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.username.trim()) return;
    
    if (editingTeacher) {
      onSaveTeacher({ ...editingTeacher, ...formData });
    } else {
      onSaveTeacher(formData);
    }
    setIsDialogOpen(false);
  };

  const toggleSubject = (subjectId: string) => {
    setFormData((prev: any) => {
      const ids = prev.assignedSubjectIds;
      if (ids.includes(subjectId)) {
        return { ...prev, assignedSubjectIds: ids.filter((id: string) => id !== subjectId) };
      } else {
        return { ...prev, assignedSubjectIds: [...ids, subjectId] };
      }
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print-hide">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Tìm kiếm giáo viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Thêm giáo viên
        </Button>
      </div>

      <div className="overflow-x-auto print-hide">
        <Table>
          <TableHeader className="bg-neutral-50/50">
            <TableRow>
              <TableHead>Họ và Tên</TableHead>
              <TableHead>Tên đăng nhập</TableHead>
              <TableHead>SĐT</TableHead>
              <TableHead>Bộ môn được phân công</TableHead>
              <TableHead className="w-[100px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeachers.length > 0 ? (
              filteredTeachers.map(teacher => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                       <User className="h-4 w-4 text-neutral-500" />
                       {teacher.name}
                    </div>
                  </TableCell>
                  <TableCell>{teacher.username}</TableCell>
                  <TableCell>{teacher.phone}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {teacher.assignedSubjectIds.map(subjectId => {
                        const subject = subjects.find(s => s.id === subjectId);
                        return subject ? (
                          <span key={subjectId} className="px-2 py-1 bg-neutral-100 rounded-md text-xs text-neutral-700 truncate max-w-[150px]" title={subject.name}>
                            {subject.name}
                          </span>
                        ) : null;
                      })}
                      {teacher.assignedSubjectIds.length === 0 && (
                        <span className="text-neutral-400 text-xs italic">Chưa phân công</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                     <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(teacher)}>
                          <Pencil className="h-4 w-4 text-neutral-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setDeletingTeacherId(teacher.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                     </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-neutral-500">
                  {search ? 'Không tìm thấy giáo viên nào.' : 'Chưa có giáo viên nào được tạo.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingTeacher ? 'Sửa thông tin giáo viên' : 'Thêm giáo viên mới'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Họ và tên *</Label>
              <Input
                className="col-span-3"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Tên đăng nhập *</Label>
              <Input
                className="col-span-3"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Mật khẩu</Label>
              <Input
                className="col-span-3"
                type="password"
                placeholder={editingTeacher ? "(Bỏ trống nếu không đổi)" : ""}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Điện thoại</Label>
              <Input
                className="col-span-3"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="grid gap-2 mt-2">
               <Label className="font-semibold border-b pb-2">Phân công Bộ môn / Năng khiếu</Label>
               <div className="max-h-48 overflow-y-auto space-y-2 p-2 border rounded-md">
                 {subjects.length > 0 ? subjects.map(subject => (
                   <label key={subject.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-neutral-50 rounded">
                     <input
                       type="checkbox"
                       className="rounded border-neutral-300"
                       checked={formData.assignedSubjectIds.includes(subject.id)}
                       onChange={() => toggleSubject(subject.id)}
                     />
                     <span className="text-sm">{subject.name}</span>
                   </label>
                 )) : (
                   <div className="text-sm text-neutral-500 italic p-2">Chưa có môn học/năng khiếu nào.</div>
                 )}
               </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} disabled={!formData.name.trim() || !formData.username.trim()}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={!!deletingTeacherId}
        title="Xóa Giáo Viên"
        description="Bạn có chắc chắn muốn xóa giáo viên này không? Thao tác này không thể hoàn tác."
        onConfirm={() => {
          if (deletingTeacherId) onDeleteTeacher(deletingTeacherId);
        }}
        onCancel={() => setDeletingTeacherId(null)}
      />
    </div>
  );
}
