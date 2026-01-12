import { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const DATA_DIR = path.resolve(process.cwd(), "data");
const CERTIFICATES_FILE = path.join(DATA_DIR, "certificates.json");
const ACTIVITIES_FILE = path.join(DATA_DIR, "activities.json");

interface Certificate {
  id: string;
  studentId: string;
  activityId: string;
  title: string;
  description: string;
  issuedBy: string;
  issuedDate: string;
  status: 'pending' | 'issued' | 'rejected';
  filePath: string | null;
  skills: string[];
  category: string;
  grade: string | null;
  validUntil: string | null;
  createdAt: number;
}

interface Activity {
  id: string;
  title: string;
  instructor: string;
  skills: string[];
  category: string;
}

interface CertificatesDb {
  certificates: Certificate[];
}

interface ActivitiesDb {
  activities: Activity[];
}

function readCertificates(): CertificatesDb {
  if (!fs.existsSync(CERTIFICATES_FILE)) {
    return { certificates: [] };
  }
  const raw = fs.readFileSync(CERTIFICATES_FILE, "utf8");
  return JSON.parse(raw) as CertificatesDb;
}

function writeCertificates(db: CertificatesDb) {
  fs.writeFileSync(CERTIFICATES_FILE, JSON.stringify(db, null, 2));
}

function readActivities(): ActivitiesDb {
  if (!fs.existsSync(ACTIVITIES_FILE)) {
    return { activities: [] };
  }
  const raw = fs.readFileSync(ACTIVITIES_FILE, "utf8");
  return JSON.parse(raw) as ActivitiesDb;
}

export const getCertificatesByStudent: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const { status } = req.query;
    
    const certificatesDb = readCertificates();
    const activitiesDb = readActivities();
    
    let certificates = certificatesDb.certificates.filter(cert => cert.studentId === studentId);
    
    if (status) {
      certificates = certificates.filter(cert => cert.status === status);
    }
    
    // Add activity details
    const certificatesWithDetails = certificates.map(cert => {
      const activity = activitiesDb.activities.find(a => a.id === cert.activityId);
      return {
        ...cert,
        activity: activity || null
      };
    });
    
    res.json({ certificates: certificatesWithDetails });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
};

export const getAllCertificates: RequestHandler = (req, res) => {
  try {
    const { status, category } = req.query;
    
    const certificatesDb = readCertificates();
    const activitiesDb = readActivities();
    
    let certificates = certificatesDb.certificates;
    
    if (status) {
      certificates = certificates.filter(cert => cert.status === status);
    }
    
    if (category) {
      certificates = certificates.filter(cert => cert.category === category);
    }
    
    // Add activity details
    const certificatesWithDetails = certificates.map(cert => {
      const activity = activitiesDb.activities.find(a => a.id === cert.activityId);
      return {
        ...cert,
        activity: activity || null
      };
    });
    
    res.json({ certificates: certificatesWithDetails });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
};

export const issueCertificate: RequestHandler = (req, res) => {
  try {
    const { studentId, activityId, grade, notes } = req.body;
    
    const certificatesDb = readCertificates();
    const activitiesDb = readActivities();
    
    const activity = activitiesDb.activities.find(a => a.id === activityId);
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    // Check if certificate already exists
    const existingCert = certificatesDb.certificates.find(
      cert => cert.studentId === studentId && cert.activityId === activityId
    );
    
    if (existingCert) {
      return res.status(409).json({ error: 'Certificate already exists for this activity' });
    }
    
    const newCertificate: Certificate = {
      id: randomUUID(),
      studentId,
      activityId,
      title: activity.title,
      description: `Successfully completed ${activity.title}`,
      issuedBy: req.body.issuedBy || 'System',
      issuedDate: new Date().toISOString().split('T')[0],
      status: 'issued',
      filePath: `/certificates/${activity.title.toLowerCase().replace(/\s+/g, '_')}_${studentId}.pdf`,
      skills: activity.skills,
      category: activity.category,
      grade: grade || null,
      validUntil: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 years from now
      createdAt: Date.now()
    };
    
    certificatesDb.certificates.push(newCertificate);
    writeCertificates(certificatesDb);
    
    res.status(201).json({ certificate: newCertificate });
  } catch (error) {
    console.error('Error issuing certificate:', error);
    res.status(500).json({ error: 'Failed to issue certificate' });
  }
};

export const updateCertificateStatus: RequestHandler = (req, res) => {
  try {
    const { certificateId } = req.params;
    const { status, grade, notes } = req.body;
    
    const certificatesDb = readCertificates();
    const certificate = certificatesDb.certificates.find(cert => cert.id === certificateId);
    
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    
    certificate.status = status;
    if (grade) certificate.grade = grade;
    
    writeCertificates(certificatesDb);
    
    res.json({ certificate });
  } catch (error) {
    console.error('Error updating certificate status:', error);
    res.status(500).json({ error: 'Failed to update certificate status' });
  }
};

export const getCertificateStats: RequestHandler = (req, res) => {
  try {
    const certificatesDb = readCertificates();
    
    const totalCertificates = certificatesDb.certificates.length;
    const issuedCertificates = certificatesDb.certificates.filter(cert => cert.status === 'issued').length;
    const pendingCertificates = certificatesDb.certificates.filter(cert => cert.status === 'pending').length;
    const rejectedCertificates = certificatesDb.certificates.filter(cert => cert.status === 'rejected').length;
    
    // Group by category
    const categoryStats = certificatesDb.certificates.reduce((acc, cert) => {
      acc[cert.category] = (acc[cert.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Group by month for trends
    const monthlyStats = certificatesDb.certificates
      .filter(cert => cert.status === 'issued')
      .reduce((acc, cert) => {
        const month = new Date(cert.issuedDate).toISOString().substring(0, 7); // YYYY-MM
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    res.json({
      total: totalCertificates,
      issued: issuedCertificates,
      pending: pendingCertificates,
      rejected: rejectedCertificates,
      categoryStats,
      monthlyStats
    });
  } catch (error) {
    console.error('Error fetching certificate stats:', error);
    res.status(500).json({ error: 'Failed to fetch certificate statistics' });
  }
};
