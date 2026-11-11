import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface OcrData {
  studentName: string;
  registrationNumber: string;
  rollNumber: string;
  date: string;
  institutionName: string;
  marks: string;
  documentType: string;
  confidenceScore: number;
  validationNotes: string;
}

export interface DocumentRecord {
  id: string;
  name: string;
  category: string;
  uploadDate: string;
  verificationStatus: "Verified" | "Pending" | "Missing" | "Expired";
  expiryDate: string;
  fileSize: string;
  fileType: string;
  sha256Hash?: string;
  extractedData?: OcrData;
}

export interface CollegeRecord {
  id: string;
  name: string;
  eligibility: string;
  requiredDocs: string[];
  fees: string;
  applicationFee: number;
  deadlines: string;
  difficulty: "Easy" | "Medium" | "Hard";
  admissionProcess: string;
  applicationStatus: "Not Applied" | "In Progress" | "Submitted" | "Accepted" | "Rejected";
  feePaid?: boolean;
  paymentOrderId?: string;
}

export interface TimelineRecord {
  id: number;
  name: string;
  description: string;
  status: "Completed" | "In Progress" | "Pending";
  updatedAt?: string;
}

export interface NotificationRecord {
  id: string;
  title: string;
  description: string;
  type: "warning" | "info" | "success" | "danger";
  time: string;
  read: boolean;
}

export interface StudentProfileRecord {
  name: string;
  course: string;
  university: string;
  email: string;
  phone: string;
  gpa: string;
  satScore: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  captureId: string; // Real PayPal capture ID from PayPal API
  collegeId: string;
  collegeName: string;
  amount: number;
  currency: string;
  status: "COMPLETED" | "PENDING" | "FAILED" | "VOIDED";
  payerEmail: string;
  payerName: string;
  createdAt: string;
  receiptNumber: string;
  paymentMethod: string;
  sandboxMode: boolean;
}

export interface AppDatabase {
  student: StudentProfileRecord;
  documents: DocumentRecord[];
  colleges: CollegeRecord[];
  timeline: TimelineRecord[];
  notifications: NotificationRecord[];
  payments: PaymentRecord[];
  capturedOrderIds: string[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "store.json");

// Clean Initial Seed Data: No fake payments, no pre-populated captures
const SEED_DATA: AppDatabase = {
  student: {
    name: "Rahul Kumar",
    course: "Computer Science",
    university: "Stanford University",
    email: "rahul.kumar@gmail.com",
    phone: "+91 98765 43210",
    gpa: "3.92 / 4.0 (95%)",
    satScore: "1540 / 1600",
  },
  documents: [
    {
      id: "doc-1",
      name: "CBSE 10th Marksheet",
      category: "10th Marksheet",
      uploadDate: "2026-06-15",
      verificationStatus: "Verified",
      expiryDate: "Lifetime",
      fileSize: "1.2 MB",
      fileType: "PDF",
      sha256Hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      extractedData: {
        studentName: "Rahul Kumar",
        registrationNumber: "CBSE-10-2024-8902",
        rollNumber: "10982734",
        date: "2024-05-20",
        institutionName: "Central Board of Secondary Education, Delhi",
        marks: "English: 95, Mathematics: 98, Science: 97, Social Science: 94, Hindi: 91. Total: 95.0%",
        documentType: "10th Marksheet",
        confidenceScore: 98.7,
        validationNotes: "Matches student profile perfectly. Verification matches Board registration ledger.",
      },
    },
    {
      id: "doc-2",
      name: "CBSE 12th Marksheet",
      category: "12th Marksheet",
      uploadDate: "2026-06-18",
      verificationStatus: "Verified",
      expiryDate: "Lifetime",
      fileSize: "1.4 MB",
      fileType: "PDF",
      sha256Hash: "a1b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef",
      extractedData: {
        studentName: "Rahul Kumar",
        registrationNumber: "CBSE-12-2026-1123",
        rollNumber: "12984567",
        date: "2026-05-15",
        institutionName: "Central Board of Secondary Education, Delhi",
        marks: "Physics: 96, Chemistry: 95, Mathematics: 99, English: 93, Computer Science: 100. Total: 96.6%",
        documentType: "12th Marksheet",
        confidenceScore: 99.1,
        validationNotes: "Marks meet the high-achievement criteria. Roll number verified against board records.",
      },
    },
    {
      id: "doc-3",
      name: "Aadhaar Card",
      category: "Aadhaar",
      uploadDate: "2026-06-20",
      verificationStatus: "Verified",
      expiryDate: "Lifetime",
      fileSize: "450 KB",
      fileType: "PNG",
      sha256Hash: "f4e3d2c1b0a987654321fedcba0987654321fedcba0987654321fedcba098765",
      extractedData: {
        studentName: "Rahul Kumar",
        registrationNumber: "UIDAI-AADHAAR-8901",
        rollNumber: "8901-2345-6789",
        date: "2018-11-12",
        institutionName: "Unique Identification Authority of India",
        marks: "N/A (Identification Document)",
        documentType: "Aadhaar",
        confidenceScore: 95.5,
        validationNotes: "Name and DOB match student record.",
      },
    },
    {
      id: "doc-4",
      name: "Income Certificate",
      category: "Income Certificate",
      uploadDate: "2026-06-25",
      verificationStatus: "Pending",
      expiryDate: "2027-03-31",
      fileSize: "850 KB",
      fileType: "JPG",
      sha256Hash: "c7b9a11223344556677889900aabbccddeeff0011223344556677889900aabbc",
      extractedData: {
        studentName: "Rahul Kumar",
        registrationNumber: "INC-REV-2026-778",
        rollNumber: "REV-88910",
        date: "2026-04-02",
        institutionName: "Department of Revenue, Govt. of Haryana",
        marks: "Annual Family Income: INR 4,50,000",
        documentType: "Income Certificate",
        confidenceScore: 92.4,
        validationNotes: "Income level falls below threshold for merit-cum-means scholarship eligibility.",
      },
    },
    {
      id: "doc-5",
      name: "Community Certificate",
      category: "Community Certificate",
      uploadDate: "2026-06-28",
      verificationStatus: "Pending",
      expiryDate: "Lifetime",
      fileSize: "720 KB",
      fileType: "PDF",
      sha256Hash: "d8e7f60123456789abcdef0123456789abcdef0123456789abcdef0123456789",
      extractedData: {
        studentName: "Rahul Kumar",
        registrationNumber: "COMM-OBC-2025-551",
        rollNumber: "OBC-55231",
        date: "2025-08-10",
        institutionName: "Tehsildar Office, Faridabad",
        marks: "OBC (Other Backward Classes - Non-Creamy Layer)",
        documentType: "Community Certificate",
        confidenceScore: 96.0,
        validationNotes: "Matches reservation category requirements.",
      },
    },
  ],
  colleges: [
    {
      id: "col-1",
      name: "Stanford University",
      eligibility: "GPA >= 3.8, SAT >= 1500, IELTS >= 7.5 or TOEFL >= 100",
      requiredDocs: ["10th Marksheet", "12th Marksheet", "Aadhaar", "Income Certificate", "Recommendation Letter"],
      fees: "$58,000 / year",
      applicationFee: 90,
      deadlines: "Nov 1 (Early), Jan 5 (Regular)",
      difficulty: "Hard",
      admissionProcess: "Holistic Review, Essay Submission, Extracurricular Evaluation, Letters of Recommendation",
      applicationStatus: "In Progress",
      feePaid: false,
    },
    {
      id: "col-2",
      name: "MIT (Massachusetts Institute of Technology)",
      eligibility: "GPA >= 3.9, SAT >= 1530, Strong STEM Portfolio",
      requiredDocs: ["10th Marksheet", "12th Marksheet", "Passport", "Recommendation Letter"],
      fees: "$60,150 / year",
      applicationFee: 75,
      deadlines: "Nov 1 (Early Action), Jan 1 (Regular)",
      difficulty: "Hard",
      admissionProcess: "STEM Portfolio Review, Multiple Essays, Math/Science Recommendations",
      applicationStatus: "Not Applied",
      feePaid: false,
    },
    {
      id: "col-3",
      name: "Harvard University",
      eligibility: "GPA >= 3.9, SAT >= 1510, Leadership Resume",
      requiredDocs: ["10th Marksheet", "12th Marksheet", "Aadhaar", "Recommendation Letter"],
      fees: "$59,400 / year",
      applicationFee: 85,
      deadlines: "Nov 1 (Early), Jan 1 (Regular)",
      difficulty: "Hard",
      admissionProcess: "Interviews, Core GPA Checks, High School Ranking, Personal Statements",
      applicationStatus: "Not Applied",
      feePaid: false,
    },
    {
      id: "col-4",
      name: "UC Berkeley",
      eligibility: "GPA >= 3.7, SAT (Optional), Out-of-State GPA requirements",
      requiredDocs: ["10th Marksheet", "12th Marksheet", "Residence Certificate"],
      fees: "$44,000 / year (Out of State)",
      applicationFee: 80,
      deadlines: "Nov 30 (Regular)",
      difficulty: "Medium",
      admissionProcess: "UC Personal Insight Questions, High School Course Rigor check",
      applicationStatus: "Not Applied",
      feePaid: false,
    },
    {
      id: "col-5",
      name: "Carnegie Mellon University",
      eligibility: "GPA >= 3.8, Strong coding background for CS",
      requiredDocs: ["10th Marksheet", "12th Marksheet", "Recommendation Letter"],
      fees: "$57,500 / year",
      applicationFee: 85,
      deadlines: "Nov 1 (Early), Jan 3 (Regular)",
      difficulty: "Hard",
      admissionProcess: "Portfolio Review, Creative/Code Samples, Analytical Tests",
      applicationStatus: "Not Applied",
      feePaid: false,
    },
  ],
  timeline: [
    {
      id: 1,
      name: "Create Profile",
      description: "Complete basic details, course interest, and academic profile setups.",
      status: "Completed",
      updatedAt: "2026-06-10",
    },
    {
      id: 2,
      name: "Upload Documents",
      description: "Upload required documents in the Smart Document Vault.",
      status: "Completed",
      updatedAt: "2026-06-28",
    },
    {
      id: 3,
      name: "Verify Documents",
      description: "Submit documents to OCR verification and review confidence check reports.",
      status: "In Progress",
      updatedAt: "2026-06-29",
    },
    {
      id: 4,
      name: "Check Eligibility",
      description: "Compare profile GPA and SAT scores with college criteria.",
      status: "In Progress",
      updatedAt: "2026-07-01",
    },
    {
      id: 5,
      name: "Submit Applications & Pay Fees",
      description: "Complete college application form packets and process application fee via PayPal Sandbox.",
      status: "Pending",
    },
    {
      id: 6,
      name: "Track Applications",
      description: "Track progress milestones, interviews, and supplementary requests.",
      status: "Pending",
    },
    {
      id: 7,
      name: "Admission Decision",
      description: "Receive firm college decisions, financial aid details, and offer letters.",
      status: "Pending",
    },
  ],
  notifications: [
    {
      id: "notif-1",
      title: "Missing Document Warning",
      description: "Your chosen college 'Stanford University' requires a 'Recommendation Letter' which is currently missing.",
      type: "warning",
      time: "2 hours ago",
      read: false,
    },
    {
      id: "notif-2",
      title: "Income Certificate Pending",
      description: "OCR analysis has completed with 92% confidence. Awaiting final system confirmation.",
      type: "info",
      time: "1 day ago",
      read: false,
    },
    {
      id: "notif-3",
      title: "12th Marksheet Verified",
      description: "Your CBSE 12th Marksheet has been successfully verified. 99% extraction confidence score achieved.",
      type: "success",
      time: "2 days ago",
      read: true,
    },
    {
      id: "notif-4",
      title: "Upcoming Application Deadline",
      description: "Stanford Early Decision submission is due in 4 months (Nov 1). Prepare essays early!",
      type: "warning",
      time: "3 days ago",
      read: true,
    },
  ],
  payments: [], // Empty: No fake payments. Only actual PayPal Sandbox captured payments are recorded.
  capturedOrderIds: [],
};

class DatabaseStore {
  private data: AppDatabase;

  constructor() {
    this.data = this.load();
  }

  private load(): AppDatabase {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(fileContent);
        // Clean out any previously injected fake payments or fake order IDs
        parsed.payments = (parsed.payments || []).filter(
          (p: PaymentRecord) => !p.orderId?.startsWith("SANDBOX-ORD-") && !p.orderId?.startsWith("SANDBOX-PAYPAL-")
        );
        parsed.capturedOrderIds = (parsed.capturedOrderIds || []).filter(
          (id: string) => !id.startsWith("SANDBOX-ORD-") && !id.startsWith("SANDBOX-PAYPAL-")
        );
        return parsed;
      }
    } catch (err) {
      console.warn("Could not read DB file, using clean seed data:", err);
    }
    this.save(SEED_DATA);
    return SEED_DATA;
  }

  public save(dataToSave?: AppDatabase): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const data = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to save database store:", err);
    }
  }

  public getSnapshot(): AppDatabase {
    return { ...this.data };
  }

  public updateStudent(student: StudentProfileRecord): StudentProfileRecord {
    this.data.student = { ...this.data.student, ...student };
    this.save();
    return this.data.student;
  }

  // Trusted College Lookup
  public getCollegeById(id: string): CollegeRecord | undefined {
    return this.data.colleges.find((c) => c.id === id);
  }

  // Document Management with Duplicate Detection
  public addDocument(doc: OcrData & { name: string; category: string; fileSize: string; fileType: string; base64Data?: string; sha256Hash?: string }): { success: boolean; document?: DocumentRecord; duplicate?: boolean; existingDoc?: DocumentRecord } {
    let hash = doc.sha256Hash;
    if (!hash && doc.base64Data) {
      hash = crypto.createHash("sha256").update(Buffer.from(doc.base64Data, "base64")).digest("hex");
    }

    if (hash) {
      const existing = this.data.documents.find((d) => d.sha256Hash === hash);
      if (existing) {
        return { success: false, duplicate: true, existingDoc: existing };
      }
    }

    const newDoc: DocumentRecord = {
      id: `doc-${Date.now()}`,
      name: doc.name,
      category: doc.category,
      uploadDate: new Date().toISOString().split("T")[0],
      verificationStatus: "Verified",
      expiryDate: "Lifetime",
      fileSize: doc.fileSize || "1.2 MB",
      fileType: doc.fileType || "PDF",
      sha256Hash: hash,
      extractedData: {
        studentName: doc.studentName,
        registrationNumber: doc.registrationNumber,
        rollNumber: doc.rollNumber,
        date: doc.date,
        institutionName: doc.institutionName,
        marks: doc.marks,
        documentType: doc.documentType || doc.category,
        confidenceScore: doc.confidenceScore || 95,
        validationNotes: doc.validationNotes || "Uploaded and processed successfully.",
      },
    };

    this.data.documents.unshift(newDoc);
    this.save();
    return { success: true, document: newDoc };
  }

  public addRawDocument(doc: DocumentRecord): { success: boolean; document?: DocumentRecord; duplicate?: boolean; existingDoc?: DocumentRecord } {
    if (doc.sha256Hash) {
      const existing = this.data.documents.find((d) => d.sha256Hash === doc.sha256Hash);
      if (existing) {
        return { success: false, duplicate: true, existingDoc: existing };
      }
    }
    this.data.documents.unshift(doc);
    this.save();
    return { success: true, document: doc };
  }

  public deleteDocument(id: string): boolean {
    const initialLen = this.data.documents.length;
    this.data.documents = this.data.documents.filter((d) => d.id !== id);
    if (this.data.documents.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public updateDocument(id: string, updates: Partial<DocumentRecord>): DocumentRecord | null {
    const doc = this.data.documents.find((d) => d.id === id);
    if (!doc) return null;
    Object.assign(doc, updates);
    this.save();
    return doc;
  }

  // College & Fee Status
  public updateCollege(id: string, updates: Partial<CollegeRecord>): CollegeRecord | null {
    const col = this.data.colleges.find((c) => c.id === id);
    if (!col) return null;
    Object.assign(col, updates);
    this.save();
    return col;
  }

  // Timeline
  public updateTimelineStage(id: number, status: TimelineRecord["status"]): TimelineRecord | null {
    const stage = this.data.timeline.find((t) => t.id === id);
    if (!stage) return null;
    stage.status = status;
    stage.updatedAt = new Date().toISOString().split("T")[0];
    this.save();
    return stage;
  }

  // Notifications
  public addNotification(notif: Omit<NotificationRecord, "id">): NotificationRecord {
    const newNotif: NotificationRecord = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...notif,
    };
    this.data.notifications.unshift(newNotif);
    this.save();
    return newNotif;
  }

  public markNotificationRead(id?: string): void {
    if (id) {
      const n = this.data.notifications.find((notif) => notif.id === id);
      if (n) n.read = true;
    } else {
      this.data.notifications.forEach((n) => (n.read = true));
    }
    this.save();
  }

  public deleteNotification(id: string): void {
    this.data.notifications = this.data.notifications.filter((n) => n.id !== id);
    this.save();
  }

  // Payments & Idempotency / Duplicate Capture Prevention
  public isOrderCaptured(orderId: string): boolean {
    return this.data.capturedOrderIds.includes(orderId);
  }

  public recordPayment(payment: PaymentRecord): { success: boolean; payment: PaymentRecord; alreadyCaptured?: boolean } {
    if (this.isOrderCaptured(payment.orderId)) {
      const existing = this.data.payments.find((p) => p.orderId === payment.orderId);
      return { success: false, payment: existing || payment, alreadyCaptured: true };
    }

    this.data.capturedOrderIds.push(payment.orderId);
    this.data.payments.unshift(payment);

    // Automatically update college fee status
    const col = this.data.colleges.find((c) => c.id === payment.collegeId);
    if (col) {
      col.feePaid = true;
      col.paymentOrderId = payment.orderId;
      col.applicationStatus = "Submitted";
    }

    // Auto update timeline stage 5 (Submit Applications & Pay Fees)
    const stage5 = this.data.timeline.find((t) => t.id === 5);
    if (stage5 && stage5.status !== "Completed") {
      stage5.status = "In Progress";
      stage5.updatedAt = new Date().toISOString().split("T")[0];
    }

    // Add persistent verified notification
    this.addNotification({
      title: `Application Fee Captured: ${payment.collegeName}`,
      description: `Official PayPal Sandbox payment of $${payment.amount.toFixed(2)} ${payment.currency} verified. Capture ID: ${payment.captureId}. Order ID: ${payment.orderId}.`,
      type: "success",
      time: "Just now",
      read: false,
    });

    this.save();
    return { success: true, payment };
  }

  public getPayments(): PaymentRecord[] {
    return [...this.data.payments];
  }
}

export const db = new DatabaseStore();
