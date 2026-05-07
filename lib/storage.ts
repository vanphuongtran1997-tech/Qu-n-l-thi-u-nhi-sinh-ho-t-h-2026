import { Student, Subject, Enrollment, Attendance } from '../types';

const STORAGE_KEY = 'student_management_data';
const SUBJECTS_KEY = 'student_subjects_data';
const ENROLLMENTS_KEY = 'student_enrollments_data';
const ATTENDANCE_KEY = 'student_attendance_data';
const TEACHERS_KEY = 'student_teachers_data';

export const getTeachers = (): import('../types').Teacher[] => {
  const data = localStorage.getItem(TEACHERS_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

export const saveTeachers = (teachers: import('../types').Teacher[]) => {
  localStorage.setItem(TEACHERS_KEY, JSON.stringify(teachers));
};

export const getStudents = (): Student[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

export const saveStudents = (students: Student[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
};

export const getSubjects = (): Subject[] => {
  const data = localStorage.getItem(SUBJECTS_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

export const saveSubjects = (subjects: Subject[]) => {
  localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
};

export const getEnrollments = (): Enrollment[] => {
  const data = localStorage.getItem(ENROLLMENTS_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

export const saveEnrollments = (enrollments: Enrollment[]) => {
  localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(enrollments));
};

export const getAttendance = (): Attendance[] => {
  const data = localStorage.getItem(ATTENDANCE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

export const saveAttendance = (attendance: Attendance[]) => {
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendance));
};

export const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};
