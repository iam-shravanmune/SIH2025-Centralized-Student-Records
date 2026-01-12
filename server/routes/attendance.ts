import { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const DATA_DIR = path.resolve(process.cwd(), "data");
const ATTENDANCE_FILE = path.join(DATA_DIR, "attendance.json");
const ACTIVITIES_FILE = path.join(DATA_DIR, "activities.json");

interface AttendanceRecord {
  id: string;
  studentId: string;
  activityId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  markedBy: string;
  notes: string;
  createdAt: number;
}

interface Activity {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface AttendanceDb {
  attendance: AttendanceRecord[];
}

interface ActivitiesDb {
  activities: Activity[];
}

function readAttendance(): AttendanceDb {
  if (!fs.existsSync(ATTENDANCE_FILE)) {
    return { attendance: [] };
  }
  const raw = fs.readFileSync(ATTENDANCE_FILE, "utf8");
  return JSON.parse(raw) as AttendanceDb;
}

function writeAttendance(db: AttendanceDb) {
  fs.writeFileSync(ATTENDANCE_FILE, JSON.stringify(db, null, 2));
}

function readActivities(): ActivitiesDb {
  if (!fs.existsSync(ACTIVITIES_FILE)) {
    return { activities: [] };
  }
  const raw = fs.readFileSync(ACTIVITIES_FILE, "utf8");
  return JSON.parse(raw) as ActivitiesDb;
}

export const getAttendanceByStudent: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const { activityId, startDate, endDate } = req.query;
    
    const attendanceDb = readAttendance();
    const activitiesDb = readActivities();
    
    let attendance = attendanceDb.attendance.filter(record => record.studentId === studentId);
    
    if (activityId) {
      attendance = attendance.filter(record => record.activityId === activityId);
    }
    
    if (startDate && endDate) {
      attendance = attendance.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= new Date(startDate as string) && recordDate <= new Date(endDate as string);
      });
    }
    
    // Add activity details
    const attendanceWithDetails = attendance.map(record => {
      const activity = activitiesDb.activities.find(a => a.id === record.activityId);
      return {
        ...record,
        activity: activity || null
      };
    });
    
    res.json({ attendance: attendanceWithDetails });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};

export const getAttendanceByActivity: RequestHandler = (req, res) => {
  try {
    const { activityId } = req.params;
    const { date } = req.query;
    
    const attendanceDb = readAttendance();
    const activitiesDb = readActivities();
    
    let attendance = attendanceDb.attendance.filter(record => record.activityId === activityId);
    
    if (date) {
      attendance = attendance.filter(record => record.date === date);
    }
    
    // Add activity details
    const activity = activitiesDb.activities.find(a => a.id === activityId);
    
    res.json({ 
      attendance,
      activity: activity || null
    });
  } catch (error) {
    console.error('Error fetching attendance by activity:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};

export const markAttendance: RequestHandler = (req, res) => {
  try {
    const { activityId } = req.params;
    const { studentId, status, notes, markedBy } = req.body;
    const date = req.body.date || new Date().toISOString().split('T')[0];
    
    const attendanceDb = readAttendance();
    
    // Check if attendance already marked for this student on this date
    const existingRecord = attendanceDb.attendance.find(
      record => record.studentId === studentId && 
                record.activityId === activityId && 
                record.date === date
    );
    
    if (existingRecord) {
      // Update existing record
      existingRecord.status = status;
      existingRecord.notes = notes || existingRecord.notes;
      existingRecord.markedBy = markedBy;
    } else {
      // Create new record
      const newRecord: AttendanceRecord = {
        id: randomUUID(),
        studentId,
        activityId,
        date,
        status,
        markedBy,
        notes: notes || '',
        createdAt: Date.now()
      };
      attendanceDb.attendance.push(newRecord);
    }
    
    writeAttendance(attendanceDb);
    
    res.json({ 
      message: 'Attendance marked successfully',
      attendance: existingRecord || attendanceDb.attendance[attendanceDb.attendance.length - 1]
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
};

export const getAttendanceStats: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const { activityId } = req.query;
    
    const attendanceDb = readAttendance();
    
    let records = attendanceDb.attendance.filter(record => record.studentId === studentId);
    
    if (activityId) {
      records = records.filter(record => record.activityId === activityId);
    }
    
    const totalDays = records.length;
    const presentDays = records.filter(record => record.status === 'present').length;
    const absentDays = records.filter(record => record.status === 'absent').length;
    const lateDays = records.filter(record => record.status === 'late').length;
    const excusedDays = records.filter(record => record.status === 'excused').length;
    
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
    
    res.json({
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      excusedDays,
      attendancePercentage
    });
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    res.status(500).json({ error: 'Failed to fetch attendance statistics' });
  }
};
