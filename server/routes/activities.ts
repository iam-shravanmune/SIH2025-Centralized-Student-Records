import { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const DATA_DIR = path.resolve(process.cwd(), "data");
const ACTIVITIES_FILE = path.join(DATA_DIR, "activities.json");
const APPLICATIONS_FILE = path.join(DATA_DIR, "student_applications.json");

interface Activity {
  id: string;
  title: string;
  description: string;
  type: 'workshop' | 'course' | 'seminar' | 'internship';
  category: 'academic' | 'professional' | 'technical' | 'leadership' | 'creative';
  instructor: string;
  startDate: string;
  endDate: string;
  duration: string;
  maxParticipants: number;
  currentParticipants: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  skills: string[];
  certificateTemplate: string;
  requirements: string[];
  location: string;
  createdAt: number;
}

interface Application {
  id: string;
  studentId: string;
  activityId: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  appliedDate: string;
  approvedDate: string | null;
  approvedBy: string | null;
  notes: string;
  createdAt: number;
}

interface ActivitiesDb {
  activities: Activity[];
}

interface ApplicationsDb {
  applications: Application[];
}

function readActivities(): ActivitiesDb {
  if (!fs.existsSync(ACTIVITIES_FILE)) {
    return { activities: [] };
  }
  const raw = fs.readFileSync(ACTIVITIES_FILE, "utf8");
  return JSON.parse(raw) as ActivitiesDb;
}

function writeActivities(db: ActivitiesDb) {
  fs.writeFileSync(ACTIVITIES_FILE, JSON.stringify(db, null, 2));
}

function readApplications(): ApplicationsDb {
  if (!fs.existsSync(APPLICATIONS_FILE)) {
    return { applications: [] };
  }
  const raw = fs.readFileSync(APPLICATIONS_FILE, "utf8");
  return JSON.parse(raw) as ApplicationsDb;
}

function writeApplications(db: ApplicationsDb) {
  fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(db, null, 2));
}

export const getActivities: RequestHandler = (req, res) => {
  try {
    const { type, category, status } = req.query;
    const db = readActivities();
    
    let activities = db.activities;
    
    if (type) {
      activities = activities.filter(activity => activity.type === type);
    }
    
    if (category) {
      activities = activities.filter(activity => activity.category === category);
    }
    
    if (status) {
      activities = activities.filter(activity => activity.status === status);
    }
    
    res.json({ activities });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
};

export const getActivityById: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const db = readActivities();
    const activity = db.activities.find(a => a.id === id);
    
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    res.json({ activity });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
};

export const createActivity: RequestHandler = (req, res) => {
  try {
    const activityData = req.body;
    const db = readActivities();
    
    const newActivity: Activity = {
      id: randomUUID(),
      ...activityData,
      currentParticipants: 0,
      createdAt: Date.now()
    };
    
    db.activities.push(newActivity);
    writeActivities(db);
    
    res.status(201).json({ activity: newActivity });
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
};

export const applyToActivity: RequestHandler = (req, res) => {
  try {
    const { studentId, activityId } = req.body;
    const activitiesDb = readActivities();
    const applicationsDb = readApplications();
    
    const activity = activitiesDb.activities.find(a => a.id === activityId);
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    // Check if already applied
    const existingApplication = applicationsDb.applications.find(
      app => app.studentId === studentId && app.activityId === activityId
    );
    
    if (existingApplication) {
      return res.status(409).json({ error: 'Already applied to this activity' });
    }
    
    // Check if activity is full
    if (activity.currentParticipants >= activity.maxParticipants) {
      return res.status(400).json({ error: 'Activity is full' });
    }
    
    const newApplication: Application = {
      id: randomUUID(),
      studentId,
      activityId,
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0],
      approvedDate: null,
      approvedBy: null,
      notes: '',
      createdAt: Date.now()
    };
    
    applicationsDb.applications.push(newApplication);
    writeApplications(applicationsDb);
    
    res.status(201).json({ application: newApplication });
  } catch (error) {
    console.error('Error applying to activity:', error);
    res.status(500).json({ error: 'Failed to apply to activity' });
  }
};

export const getStudentApplications: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const applicationsDb = readApplications();
    const activitiesDb = readActivities();
    
    const applications = applicationsDb.applications
      .filter(app => app.studentId === studentId)
      .map(app => {
        const activity = activitiesDb.activities.find(a => a.id === app.activityId);
        return {
          ...app,
          activity: activity || null
        };
      });
    
    res.json({ applications });
  } catch (error) {
    console.error('Error fetching student applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

export const updateApplicationStatus: RequestHandler = (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, notes, approvedBy } = req.body;
    
    const applicationsDb = readApplications();
    const application = applicationsDb.applications.find(app => app.id === applicationId);
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    application.status = status;
    application.notes = notes || application.notes;
    
    if (status === 'approved') {
      application.approvedDate = new Date().toISOString().split('T')[0];
      application.approvedBy = approvedBy;
      
      // Update activity participant count
      const activitiesDb = readActivities();
      const activity = activitiesDb.activities.find(a => a.id === application.activityId);
      if (activity) {
        activity.currentParticipants += 1;
        writeActivities(activitiesDb);
      }
    }
    
    writeApplications(applicationsDb);
    
    res.json({ application });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
};
