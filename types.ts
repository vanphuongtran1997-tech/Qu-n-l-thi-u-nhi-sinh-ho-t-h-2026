export interface Student {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  phone: string;
  grade: string;
  catechismClass: string;
  fatherName: string;
  motherName: string;
  parentPhone: string;
  avatarUrl: string;
  status: 'Active' | 'Inactive';
  evaluation?: string;
}

export type NewStudent = Omit<Student, 'id'>;

export interface Subject {
  id: string;
  name: string;
  description: string;
}

export type NewSubject = Omit<Subject, 'id'>;

export interface Enrollment {
  studentId: string;
  subjectId: string;
  score?: string; // Storing as string for flexibility in grading
}

export interface Attendance {
  studentId: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  present: boolean;
}

export interface Teacher {
  id: string;
  name: string;
  username: string;
  password?: string;
  phone?: string;
  assignedSubjectIds: string[]; // subjects they can teach
}

export type NewTeacher = Omit<Teacher, 'id'>;

