import React, { useState } from 'react';
import { Plus, Search, MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { Subject, NewSubject } from '@/types';
import { Button, buttonVariants } from '@/components/ui/button';
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
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface SubjectsTabProps {
  subjects: Subject[];
  role: 'Admin' | 'Teacher';
  onSaveSubject: (subject: any) => void;
  onDeleteSubject: (id: string) => void;
}

export function SubjectsTab({ subjects, role, onSaveSubject, onDeleteSubject }: SubjectsTabProps) {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null);

  const [formData, setFormData] = useState<NewSubject>({
    name: '',
    description: '',
  });

  const openAddDialog = () => {
    setEditingSubject(null);
    setFormData({ name: '', description: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({ name: subject.name, description: subject.description });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubject) {
      onSaveSubject({ ...formData, id: editingSubject.id });
    } else {
      onSaveSubject(formData);
    }
    setIsDialogOpen(false);
  };

  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Tìm kiếm môn học..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {role === 'Admin' && (
          <Button onClick={openAddDialog} className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Thêm môn học/năng khiếu
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-neutral-50/50">
            <TableRow>
              <TableHead>Tên Môn Học</TableHead>
              <TableHead>Mô tả/Ghi chú</TableHead>
              {role === 'Admin' && <TableHead className="w-[70px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubjects.length > 0 ? (
              filteredSubjects.map((subject) => (
                <TableRow key={subject.id} className="hover:bg-neutral-50/50">
                  <TableCell>
                    <div className="font-medium text-neutral-900">{subject.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-neutral-600">{subject.description}</div>
                  </TableCell>
                  {role === 'Admin' && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", className: "h-8 w-8 p-0" })}>
                          <span className="sr-only">Mở menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openEditDialog(subject)}>
                              <Pencil className="mr-2 h-4 w-4" /> Sửa thông tin
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuGroup>
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              onClick={() => setDeletingSubjectId(subject.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" /> Xóa môn học
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={role === 'Admin' ? 3 : 2} className="h-32 text-center text-neutral-500">
                  Chưa có môn học/năng khiếu nào được tạo.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingSubject ? 'Sửa thông tin môn học' : 'Thêm môn học mới'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Tên Môn
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Mô tả
                </Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">Lưu lại</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={!!deletingSubjectId}
        title="Xóa môn học"
        description="Bạn có chắc chắn muốn xóa môn học này không? Các điểm số và điểm danh của môn này cũng sẽ bị xóa. Thao tác này không thể hoàn tác."
        onConfirm={() => {
          if (deletingSubjectId) onDeleteSubject(deletingSubjectId);
        }}
        onCancel={() => setDeletingSubjectId(null)}
      />
    </div>
  );
}
