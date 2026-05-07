import React, { useState, useEffect } from 'react';
import { Student, NewStudent, Subject, Enrollment } from '@/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: Student | null;
  subjects: Subject[];
  enrollments: Enrollment[];
  onSave: (student: NewStudent | Student, selectedSubjectIds: string[]) => void;
}

export function StudentDialog({ open, onOpenChange, student, subjects, enrollments, onSave }: StudentDialogProps) {
  const [formData, setFormData] = useState<NewStudent>({
    name: '',
    dateOfBirth: '',
    gender: 'Male',
    email: '',
    phone: '',
    grade: '',
    catechismClass: '',
    fatherName: '',
    motherName: '',
    parentPhone: '',
    avatarUrl: '',
    status: 'Active',
    evaluation: '',
  });

  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);

  useEffect(() => {
    if (student) {
      setFormData({
        ...student,
        evaluation: student.evaluation || '',
      });
      const studentEnrollments = enrollments.filter(e => e.studentId === student.id).map(e => e.subjectId);
      setSelectedSubjectIds(studentEnrollments);
    } else {
      setFormData({
        name: '',
        dateOfBirth: '',
        gender: 'Male',
        email: '',
        phone: '',
        grade: '',
        catechismClass: '',
        fatherName: '',
        motherName: '',
        parentPhone: '',
        avatarUrl: '',
        status: 'Active',
        evaluation: '',
      });
      setSelectedSubjectIds([]);
    }
  }, [student, open, enrollments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(student ? { ...formData, id: student.id } : formData, selectedSubjectIds);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{student ? 'Sửa thông tin học sinh' : 'Thêm học sinh mới'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-4 -mx-4">
            <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">Thông tin chứng từ</h3>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right mt-2">Ảnh đại diện</Label>
              <div className="col-span-3 space-y-3">
                <div className="flex gap-4 items-center">
                  {formData.avatarUrl ? (
                    <div className="relative">
                      <img src={formData.avatarUrl} alt="Preview" className="w-20 h-20 rounded-full object-cover border border-neutral-200" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, avatarUrl: '' })}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-neutral-100 border border-neutral-200 border-dashed flex items-center justify-center text-neutral-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="image-upload" className="cursor-pointer bg-neutral-100 hover:bg-neutral-200 px-3 py-2 rounded-md text-sm text-center border border-neutral-300 font-medium">
                      Tải ảnh lên / Chụp ảnh
                    </Label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const img = new Image();
                          img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const MAX_WIDTH = 300;
                            const MAX_HEIGHT = 300;
                            let width = img.width;
                            let height = img.height;
                            
                            if (width > height) {
                              if (width > MAX_WIDTH) {
                                height *= MAX_WIDTH / width;
                                width = MAX_WIDTH;
                              }
                            } else {
                              if (height > MAX_HEIGHT) {
                                width *= MAX_HEIGHT / height;
                                height = MAX_HEIGHT;
                              }
                            }
                            
                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx?.drawImage(img, 0, 0, width, height);
                            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                            setFormData({ ...formData, avatarUrl: dataUrl });
                          };
                          img.src = event.target?.result as string;
                        };
                        reader.readAsDataURL(file);
                        e.target.value = '';
                      }}
                    />
                  </div>
                </div>
                <Input
                  id="avatarUrl"
                  placeholder="Hoặc dán URL ảnh trực tiếp..."
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  className="w-full text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Họ và tên
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
              <Label htmlFor="dateOfBirth" className="text-right">
                Ngày sinh
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Giới tính</Label>
              <div className="col-span-3">
                <Select
                  value={formData.gender}
                  onValueChange={(value: 'Male' | 'Female' | 'Other') =>
                    setFormData({ ...formData, gender: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Nam</SelectItem>
                    <SelectItem value="Female">Nữ</SelectItem>
                    <SelectItem value="Other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mt-4 mb-2">Trường & Giáo Lý</h3>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="grade" className="text-right">
                Khối/Lớp
              </Label>
              <Input
                id="grade"
                placeholder="VD: 10A1"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="catechismClass" className="text-right">
                Lớp giáo lý
              </Label>
              <Input
                id="catechismClass"
                placeholder="VD: Rước Lễ 1"
                value={formData.catechismClass}
                onChange={(e) => setFormData({ ...formData, catechismClass: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            
            <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mt-4 mb-2">Liên Hệ & Phụ Huynh</h3>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fatherName" className="text-right">
                Tên Thánh & Tên Ba
              </Label>
              <Input
                id="fatherName"
                placeholder="Giuse Nguyễn Văn A"
                value={formData.fatherName}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="motherName" className="text-right">
                Tên Thánh & Tên Mẹ
              </Label>
              <Input
                id="motherName"
                placeholder="Maria Trần Thị B"
                value={formData.motherName}
                onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="parentPhone" className="text-right">
                SĐT Phụ huynh
              </Label>
              <Input
                id="parentPhone"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                SĐT Học sinh
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            
            <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mt-4 mb-2">Đánh Giá & Môn Học</h3>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="evaluation" className="text-right mt-2">
                Đánh giá chung
              </Label>
              <textarea
                id="evaluation"
                value={formData.evaluation || ''}
                onChange={(e) => setFormData({ ...formData, evaluation: e.target.value })}
                className="col-span-3 flex min-h-[80px] w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
                placeholder="Nhận xét về quá trình sinh hoạt..."
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right mt-2">Đăng ký môn</Label>
              <div className="col-span-3 space-y-3 mt-2">
                {subjects.length > 0 ? (
                  subjects.map(subject => (
                    <div key={subject.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`subject-${subject.id}`} 
                        checked={selectedSubjectIds.includes(subject.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSubjectIds([...selectedSubjectIds, subject.id]);
                          } else {
                            setSelectedSubjectIds(selectedSubjectIds.filter(id => id !== subject.id));
                          }
                        }}
                      />
                      <label 
                        htmlFor={`subject-${subject.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {subject.name}
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-neutral-500">Chưa có môn học nào.</div>
                )}
              </div>
            </div>

            <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mt-4 mb-2">Hệ Thống</h3>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Trạng thái</Label>
              <div className="col-span-3">
                <Select
                  value={formData.status}
                  onValueChange={(value: 'Active' | 'Inactive') =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Đang học</SelectItem>
                    <SelectItem value="Inactive">Đã nghỉ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit">Lưu lại</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
