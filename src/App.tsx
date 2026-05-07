import { useState, useEffect } from 'react';
import { GraduationCap, LogOut } from 'lucide-react';
import { Student, Subject, Enrollment, Attendance, Teacher } from '@/types';
import { 
  getStudents, saveStudents, generateId,
  getSubjects, saveSubjects,
  getEnrollments, saveEnrollments,
  getAttendance, saveAttendance,
  getTeachers, saveTeachers
} from '@/lib/storage';
import { StudentsTab } from '@/components/StudentsTab';
import { SubjectsTab } from '@/components/SubjectsTab';
import { ClassesTab } from '@/components/ClassesTab';
import { TeachersTab } from '@/components/TeachersTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function App() {
  const [user, setUser] = useState<{ username: string; loginName: string; role: 'Admin' | 'Teacher' } | null>(null);
  const [username, setUsername] = useState('Admin');
  const [password, setPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');

  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    // Initial data load
    const loadedStudents = getStudents();
    const loadedSubjects = getSubjects();
    const loadedEnrollments = getEnrollments();
    const loadedAttendances = getAttendance();
    const loadedTeachers = getTeachers();
    
    if (loadedStudents.length === 0) {
      // Mock data if empty
      const mockStudents: Student[] = [
        {
          id: generateId(),
          name: 'Phêrô Nguyễn Văn A',
          dateOfBirth: '2015-01-15',
          gender: 'Male',
          email: 'nguyenvana@example.com',
          phone: '',
          grade: '5A1',
          catechismClass: 'Rước Lễ 1',
          fatherName: 'Giuse Nguyễn Văn Ba',
          motherName: 'Maria Trần Thị Bốn',
          parentPhone: '0987654321',
          avatarUrl: '',
          status: 'Active',
        },
        {
          id: generateId(),
          name: 'Maria Trần Thị B',
          dateOfBirth: '2015-06-20',
          gender: 'Female',
          email: '',
          phone: '',
          grade: '5A2',
          catechismClass: 'Rước Lễ 1',
          fatherName: 'Phaolô Trần Văn Năm',
          motherName: 'Anna Lê Thị Sáu',
          parentPhone: '0123456789',
          avatarUrl: '',
          status: 'Active',
        },
      ];
      setStudents(mockStudents);
      saveStudents(mockStudents);
    } else {
      setStudents(loadedStudents);
    }

    if (loadedSubjects.length === 0) {
      const mockSubjects: Subject[] = [
        { id: generateId(), name: 'Đàn Nhạc', description: 'Học đàn Organ cơ bản' },
        { id: generateId(), name: 'Cắm Hoa', description: 'Cắm hoa nghệ thuật' }
      ];
      setSubjects(mockSubjects);
      saveSubjects(mockSubjects);
    } else {
      setSubjects(loadedSubjects);
    }

    if (loadedTeachers.length === 0) {
      const mockTeachers: Teacher[] = [
        { id: generateId(), name: 'Nguyễn Văn G', username: 'Gv001', password: 'gv001', phone: '0912345678', assignedSubjectIds: [] }
      ];
      setTeachers(mockTeachers);
      saveTeachers(mockTeachers);
    } else {
      setTeachers(loadedTeachers);
    }

    setEnrollments(loadedEnrollments);
    setAttendances(loadedAttendances);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'Admin' && password === 'admin123') {
      setUser({ username: 'Admin', loginName: 'Admin', role: 'Admin' });
      setLoginError('');
      return;
    }
    
    // Check against teachers
    const teacher = teachers.find(t => t.username === username);
    if (teacher && teacher.password === password) {
      setUser({ username: teacher.name || teacher.username, loginName: teacher.username, role: 'Teacher' });
      setLoginError('');
      return;
    }

    // Fallback for hardcoded mock teacher if not in DB yet
    if (username === 'Gv001' && password === 'gv001') {
      setUser({ username: 'Giáo viên 001', loginName: 'Gv001', role: 'Teacher' });
      setLoginError('');
      return;
    }

    setLoginError('Sai tài khoản hoặc mật khẩu');
  };

  const handleLogout = () => {
    setUser(null);
    setUsername('');
    setPassword('');
  };

  const handleSaveTeacher = (teacherData: any) => {
    let updated;
    if ('id' in teacherData && teacherData.id) {
      // keep existing password if not updated
      const existing = teachers.find(t => t.id === teacherData.id);
      if (existing && !teacherData.password) {
        teacherData.password = existing.password;
      }
      updated = teachers.map((t) => (t.id === teacherData.id ? teacherData : t));
    } else {
      updated = [...teachers, { ...teacherData, id: generateId() }];
    }
    setTeachers(updated);
    saveTeachers(updated);
  };

  const handleDeleteTeacher = (id: string) => {
    const updated = teachers.filter(t => t.id !== id);
    setTeachers(updated);
    saveTeachers(updated);
  };

  const handleSaveStudent = (studentData: any, selectedSubjectIds?: string[]) => {
    let updated;
    const isNew = !('id' in studentData) || !studentData.id;
    const studentId = isNew ? generateId() : studentData.id;

    const studentToSave = { ...studentData, id: studentId };

    if (isNew) {
      updated = [...students, studentToSave];
    } else {
      updated = students.map((s) => (s.id === studentId ? studentToSave : s));
    }
    setStudents(updated);
    saveStudents(updated);

    if (selectedSubjectIds !== undefined) {
      const otherEnrollments = enrollments.filter(e => e.studentId !== studentId);
      const newStudentEnrollments = selectedSubjectIds.map(subId => {
        // preserve existing score if possible
        const existing = enrollments.find(e => e.studentId === studentId && e.subjectId === subId);
        return { 
          studentId, 
          subjectId: subId, 
          score: existing?.score 
        };
      });
      const updatedEnrollments = [...otherEnrollments, ...newStudentEnrollments];
      setEnrollments(updatedEnrollments);
      saveEnrollments(updatedEnrollments);
    }
  };

  const handleDeleteStudent = (id: string) => {
    const updated = students.filter((s) => s.id !== id);
    setStudents(updated);
    saveStudents(updated);
  };

  const handleSaveSubject = (subjectData: any) => {
    let updated;
    if ('id' in subjectData && subjectData.id) {
      updated = subjects.map((s) => (s.id === subjectData.id ? subjectData : s));
    } else {
      updated = [...subjects, { ...subjectData, id: generateId() }];
    }
    setSubjects(updated);
    saveSubjects(updated);
  };

  const handleDeleteSubject = (id: string) => {
    const updated = subjects.filter((s) => s.id !== id);
    setSubjects(updated);
    saveSubjects(updated);
  };

  const handleUpdateEnrollments = (updatedEnrollments: Enrollment[]) => {
    setEnrollments(updatedEnrollments);
    saveEnrollments(updatedEnrollments);
  };

  const handleUpdateAttendance = (att: Attendance) => {
    const existingIndex = attendances.findIndex(a => 
      a.studentId === att.studentId && a.subjectId === att.subjectId && a.date === att.date
    );
    let updated;
    if (existingIndex >= 0) {
      updated = [...attendances];
      updated[existingIndex] = att;
    } else {
      updated = [...attendances, att];
    }
    setAttendances(updated);
    saveAttendance(updated);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200 w-full max-w-sm">
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="bg-blue-600 p-3 rounded-lg mb-4">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Đăng Nhập</h1>
            <p className="text-sm text-neutral-500 mt-1">Hệ thống quản lý Sinh Hoạt Hè</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {loginError && (
              <p className="text-red-500 text-sm py-1">{loginError}</p>
            )}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Đăng nhập
            </Button>
          </form>
        </div>
      </div>
    );
  }

  const roleLabel = user.role === 'Admin' ? 'Quản trị viên' : 'Giáo viên';

  const authorizedSubjects = user.role === 'Admin' 
    ? subjects 
    : subjects.filter(sub => {
        const teacher = teachers.find(t => t.username === user.loginName);
        return teacher?.assignedSubjectIds.includes(sub.id);
      });

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans pb-10">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10 print-hide">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="font-semibold text-xl tracking-tight hidden sm:block">Sinh Hoạt Hè 2026</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold">{user.username}</span>
                <span className="text-xs text-neutral-500">{roleLabel}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Đăng xuất">
                <LogOut className="h-5 w-5 text-neutral-600" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="students" className="w-full">
          <TabsList className={`grid w-full mb-8 print-hide ${user.role === 'Admin' ? 'grid-cols-4 max-w-2xl' : 'grid-cols-3 max-w-md'}`}>
            <TabsTrigger value="students">Thiếu Nhi</TabsTrigger>
            <TabsTrigger value="subjects">Năng Khiếu</TabsTrigger>
            <TabsTrigger value="classes">Lớp Học</TabsTrigger>
            {user.role === 'Admin' && <TabsTrigger value="teachers">Giáo Viên</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="students">
            <div className="mb-4 print-hide">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Danh sách thiếu nhi</h1>
              <p className="text-neutral-500 mt-1">Quản lý và cập nhật thông tin thiếu nhi tham gia sinh hoạt hè.</p>
            </div>
            <StudentsTab 
              students={students} 
              subjects={subjects}
              enrollments={enrollments}
              attendances={attendances}
              role={user.role}
              onSaveStudent={handleSaveStudent} 
              onDeleteStudent={handleDeleteStudent} 
            />
          </TabsContent>

          <TabsContent value="subjects">
            <div className="mb-4 print-hide">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Môn học & Năng khiếu</h1>
              <p className="text-neutral-500 mt-1">Danh sách các môn học / năng khiếu được tổ chức trong hè.</p>
            </div>
            <SubjectsTab 
              subjects={authorizedSubjects} 
              role={user.role}
              onSaveSubject={handleSaveSubject} 
              onDeleteSubject={handleDeleteSubject} 
            />
          </TabsContent>

          <TabsContent value="classes">
            <div className="mb-4 print-hide">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Quản lý Lớp & Điểm danh</h1>
              <p className="text-neutral-500 mt-1">Sắp xếp học viên vào lớp, điểm danh và ghi điểm số.</p>
            </div>
            <ClassesTab 
              subjects={authorizedSubjects}
              students={students}
              enrollments={enrollments}
              attendances={attendances}
              role={user.role}
              onUpdateEnrollment={handleUpdateEnrollments}
              onUpdateAttendance={handleUpdateAttendance}
            />
          </TabsContent>

          {user.role === 'Admin' && (
            <TabsContent value="teachers">
              <div className="mb-4 print-hide">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Quản lý Giáo Viên</h1>
                <p className="text-neutral-500 mt-1">Thêm, sửa, xóa và phân công môn học cho giáo viên.</p>
              </div>
              <TeachersTab 
                teachers={teachers}
                subjects={subjects}
                onSaveTeacher={handleSaveTeacher}
                onDeleteTeacher={handleDeleteTeacher}
              />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
