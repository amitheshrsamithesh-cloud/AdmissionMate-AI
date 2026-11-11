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

export interface Document {
  id: string;
  name: string;
  category: string;
  uploadDate: string;
  verificationStatus: 'Verified' | 'Pending' | 'Missing' | 'Expired';
  expiryDate: string;
  fileSize: string;
  fileType: string;
  sha256Hash?: string;
  extractedData?: OcrData;
}

export interface College {
  id: string;
  name: string;
  eligibility: string;
  requiredDocs: string[];
  fees: string;
  applicationFee: number; // In USD, e.g. 90
  deadlines: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  admissionProcess: string;
  applicationStatus: 'Not Applied' | 'In Progress' | 'Submitted' | 'Accepted' | 'Rejected';
  feePaid?: boolean;
  paymentOrderId?: string;
}

export interface TimelineStage {
  id: number;
  name: string;
  description: string;
  status: 'Completed' | 'In Progress' | 'Pending';
  updatedAt?: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'info' | 'success' | 'danger';
  time: string;
  read: boolean;
}

export interface StudentProfile {
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
  captureId?: string;
  collegeId: string;
  collegeName: string;
  amount: number;
  currency: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'VOIDED';
  payerEmail: string;
  payerName: string;
  createdAt: string;
  receiptNumber: string;
  paymentMethod: string;
  sandboxMode: boolean;
}

export interface ReadinessBreakdown {
  overallScore: number;
  documentsScore: number;
  eligibilityScore: number;
  applicationScore: number;
  feeScore: number;
  missingDocs: string[];
  expiredDocs: string[];
  pendingDocs: string[];
  recommendedSteps: string[];
}
