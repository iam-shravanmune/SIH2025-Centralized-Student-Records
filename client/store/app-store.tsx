import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ActivityType = "academic" | "non-academic";
export type ActivityStatus = "pending" | "approved" | "rejected";

export interface ActivityItem {
  id: string;
  studentId: string;
  title: string;
  type: ActivityType;
  status: ActivityStatus;
  createdAt: number;
  certificateId?: string;
}

export interface CertificateItem {
  id: string;
  studentId: string;
  activityId: string;
  title: string;
  fileName: string;
  fileUrl: string; // object URL or remote URL
  issuedAt: number;
}

export type AttendanceStatus = "present" | "absent" | "late";
export interface AttendanceRecord {
  id: string;
  studentId: string;
  courseId: string;
  dateISO: string; // YYYY-MM-DD
  status: AttendanceStatus;
}

export interface TeacherProfile { id: string; name: string; email: string; avatar?: string }
export interface ClassItem { id: string; name: string; subject: string; section: string; department?: string }
export interface ScheduleEvent { id: string; title: string; classId: string; day: string; start: string; end: string }
export type UserRole = "student" | "teacher" | "admin";
export interface UserItem { id: string; name: string; role: UserRole; department?: string }

interface AppState {
  currentTeacher: TeacherProfile;
  classes: ClassItem[];
  studentsByClass: Record<string, string[]>;
  schedule: ScheduleEvent[];
  activities: ActivityItem[];
  certificates: CertificateItem[];
  attendance: AttendanceRecord[];
  users: UserItem[];
  departments: string[];
  addUser(u: Omit<UserItem, "id">): string;
  removeUser(id: string): void;
  updateUserRole(id: string, role: UserRole): void;
  addPendingActivity(input: Omit<ActivityItem, "id" | "status" | "createdAt"> & { status?: ActivityStatus }): string;
  setActivityStatus(activityId: string, status: ActivityStatus): void;
  addCertificate(input: Omit<CertificateItem, "id" | "issuedAt">): string;
  addAttendanceBatch(input: { courseId: string; dateISO: string; defaultStatus: AttendanceStatus; studentIds: string[] }): { created: number };
}

const Ctx = createContext<AppState | null>(null);
const STORAGE_KEY = "gradfolia_store_v1";

function usePersistedState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState] as const;
}

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [currentTeacher] = usePersistedState<TeacherProfile>(`${STORAGE_KEY}:teacher`, { id: "t-001", name: "Anita Kumar", email: "anita.kumar@example.edu" });
  const [classes] = usePersistedState<ClassItem[]>(`${STORAGE_KEY}:classes`, [
    { id: "CSE101", name: "Data Structures", subject: "DSA", section: "A", department: "CSE" },
    { id: "CSE201", name: "Algorithms", subject: "ALG", section: "B", department: "CSE" },
  ]);
  const [studentsByClass] = usePersistedState<Record<string, string[]>>(`${STORAGE_KEY}:studentsByClass`, {
    CSE101: ["S-001", "S-002", "S-003", "S-004"],
    CSE201: ["S-101", "S-102", "S-103"],
  });
  const [schedule] = usePersistedState<ScheduleEvent[]>(`${STORAGE_KEY}:schedule`, [
    { id: "sch1", title: "CSE101 Lecture", classId: "CSE101", day: "Mon", start: "09:00", end: "10:00" },
    { id: "sch2", title: "CSE201 Lab", classId: "CSE201", day: "Wed", start: "11:00", end: "12:30" },
  ]);
  const [activities, setActivities] = usePersistedState<ActivityItem[]>(`${STORAGE_KEY}:activities`, []);
  const [certificates, setCertificates] = usePersistedState<CertificateItem[]>(`${STORAGE_KEY}:certificates`, []);
  const [attendance, setAttendance] = usePersistedState<AttendanceRecord[]>(`${STORAGE_KEY}:attendance`, []);
  const [users, setUsers] = usePersistedState<UserItem[]>(`${STORAGE_KEY}:users`, [
    { id: "S-001", name: "John Smith", role: "student", department: "CSE" },
    { id: "S-002", name: "Aisha Khan", role: "student", department: "ECE" },
    { id: "T-001", name: "Anita Kumar", role: "teacher", department: "CSE" },
    { id: "A-001", name: "Admin User", role: "admin" },
  ]);
  const [departments] = usePersistedState<string[]>(`${STORAGE_KEY}:departments`, ["CSE", "ECE", "ME", "CE"]);

  const addPendingActivity: AppState["addPendingActivity"] = useCallback((input) => {
    const id = `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const item: ActivityItem = {
      id,
      studentId: input.studentId,
      title: input.title,
      type: input.type,
      status: input.status ?? "pending",
      createdAt: Date.now(),
    };
    setActivities((prev) => [item, ...prev]);
    return id;
  }, [setActivities]);

  const setActivityStatus: AppState["setActivityStatus"] = useCallback((activityId, status) => {
    setActivities((prev) => prev.map((a) => (a.id === activityId ? { ...a, status } : a)));
  }, [setActivities]);

  const addCertificate: AppState["addCertificate"] = useCallback((input) => {
    const id = `cer_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const cer: CertificateItem = {
      id,
      studentId: input.studentId,
      activityId: input.activityId,
      title: input.title,
      fileName: input.fileName,
      fileUrl: input.fileUrl,
      issuedAt: Date.now(),
    };
    setCertificates((prev) => [cer, ...prev]);
    setActivities((prev) => prev.map((a) => (a.id === input.activityId ? { ...a, certificateId: id } : a)));
    return id;
  }, [setActivities, setCertificates]);

  const addUser: AppState["addUser"] = useCallback((u) => {
    const id = `${u.role === "student" ? "S" : u.role === "teacher" ? "T" : "U"}-${Math.random().toString(36).slice(2,6)}`;
    setUsers((prev) => [{ id, ...u }, ...prev]);
    return id;
  }, [setUsers]);

  const removeUser: AppState["removeUser"] = useCallback((id) => {
    setUsers((prev) => prev.filter((x) => x.id !== id));
  }, [setUsers]);

  const updateUserRole: AppState["updateUserRole"] = useCallback((id, role) => {
    setUsers((prev) => prev.map((x) => (x.id === id ? { ...x, role } : x)));
  }, [setUsers]);

  const addAttendanceBatch: AppState["addAttendanceBatch"] = useCallback((input) => {
    const created: AttendanceRecord[] = input.studentIds.filter(Boolean).map((sid) => ({
      id: `att_${Date.now()}_${sid}_${Math.random().toString(36).slice(2, 5)}`,
      studentId: sid.trim(),
      courseId: input.courseId,
      dateISO: input.dateISO,
      status: input.defaultStatus,
    }));
    if (created.length) setAttendance((prev) => [...created, ...prev]);
    return { created: created.length };
  }, [setAttendance]);

  const value = useMemo<AppState>(() => ({
    currentTeacher,
    classes,
    studentsByClass,
    schedule,
    activities,
    certificates,
    attendance,
    users,
    departments,
    addUser,
    removeUser,
    updateUserRole,
    addPendingActivity,
    setActivityStatus,
    addCertificate,
    addAttendanceBatch,
  }), [currentTeacher, classes, studentsByClass, schedule, activities, certificates, attendance, users, departments, addUser, removeUser, updateUserRole, addPendingActivity, setActivityStatus, addCertificate, addAttendanceBatch]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}
