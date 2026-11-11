import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import DashboardView from './components/DashboardView';
import DocumentVaultView from './components/DocumentVaultView';
import OcrVerificationView from './components/OcrVerificationView';
import CollegeRequirementsView from './components/CollegeRequirementsView';
import CollegeComparisonView from './components/CollegeComparisonView';
import AdmissionTimelineView from './components/AdmissionTimelineView';
import AiAssistantView from './components/AiAssistantView';
import ReportsAnalyticsView from './components/ReportsAnalyticsView';
import NotificationsView from './components/NotificationsView';
import SettingsView from './components/SettingsView';
import PaymentsView from './components/PaymentsView';

import { 
  INITIAL_PROFILE, 
  INITIAL_DOCUMENTS, 
  COLLEGES, 
  INITIAL_TIMELINE, 
  INITIAL_NOTIFICATIONS,
  INITIAL_PAYMENTS
} from './data';
import { 
  Document, 
  College, 
  TimelineStage, 
  Notification, 
  StudentProfile, 
  Message, 
  OcrData,
  PaymentRecord
} from './types';

export default function App() {
  
  // Navigation & Drawer States
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Main Data States
  const [student, setStudent] = useState<StudentProfile>(INITIAL_PROFILE);
  const [documents, setDocuments] = useState<Document[]>(INITIAL_DOCUMENTS);
  const [colleges, setColleges] = useState<College[]>(COLLEGES);
  const [timeline, setTimeline] = useState<TimelineStage[]>(INITIAL_TIMELINE);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);

  // Sync with persistent backend database on mount
  useEffect(() => {
    async function loadBackendData() {
      try {
        const res = await fetch('/api/data');
        if (res.ok) {
          const data = await res.json();
          if (data.student) setStudent(data.student);
          if (data.documents && data.documents.length > 0) setDocuments(data.documents);
          if (data.colleges && data.colleges.length > 0) setColleges(data.colleges);
          if (data.timeline && data.timeline.length > 0) setTimeline(data.timeline);
          if (data.notifications && data.notifications.length > 0) setNotifications(data.notifications);
          if (data.payments && data.payments.length > 0) setPayments(data.payments);
        }
      } catch (err) {
        console.warn('Backend sync note: running with initial seed dataset', err);
      }
    }
    loadBackendData();
  }, []);

  // Chatbot State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init-1',
      sender: 'assistant',
      text: `Hello Rahul Kumar! I am AdmissionMate AI, your dedicated admissions assistant.
      
I've parsed your Academic Student Profile. Your GPA (3.92) and SAT score (1540) look exceptional! I've also matched your CBSE Board Marksheets.

How can I help you organize your application process today? Ask me about target colleges, eligibility, missing transcripts, or PayPal application fee payments.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isSending, setIsSending] = useState(false);

  // Unread notifications counter
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // ==================== STATE ACTIONS ====================

  // Smart Vault Actions
  const handleAddDocument = (newDoc: Document) => {
    setDocuments(prev => [newDoc, ...prev]);
    
    // Auto-create notification
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title: 'New Document Uploaded',
      description: `Your "${newDoc.name}" has been uploaded with verified SHA-256 hash.`,
      type: 'info',
      time: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleDeleteDocument = async (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    try {
      await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Backend delete error:', e);
    }
  };

  // Trigger OCR analysis from Vault row
  const handleTriggerOcr = (doc: Document) => {
    setSelectedDocumentId(doc.id);
    setActiveSection('ocr');
  };

  // OCR Completion Action
  const handleOcrComplete = (docId: string, extractedData: OcrData) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        return {
          ...doc,
          verificationStatus: 'Verified',
          extractedData: extractedData
        };
      }
      return doc;
    }));

    // Post notification about OCR verification success
    const updatedDoc = documents.find(d => d.id === docId);
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title: `${updatedDoc?.name || 'Document'} OCR Validated`,
      description: `OCR verification achieved ${extractedData.confidenceScore}% confidence. Credentials validated.`,
      type: 'success',
      time: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // College Requirements Status Update
  const handleUpdateCollegeStatus = async (id: string, status: College['applicationStatus']) => {
    setColleges(prev => prev.map(col => {
      if (col.id === id) {
        return { ...col, applicationStatus: status };
      }
      return col;
    }));

    try {
      await fetch(`/api/colleges/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (err) {
      console.warn('Update college status error:', err);
    }
  };

  // PayPal Payment Capture Success Handler
  const handlePaymentSuccess = (payment: PaymentRecord, collegeId: string) => {
    // 1. Add to payment history (avoiding duplicate by orderId)
    setPayments(prev => {
      if (prev.some(p => p.orderId === payment.orderId)) return prev;
      return [payment, ...prev];
    });

    // 2. Mark college fee paid and status submitted
    setColleges(prev => prev.map(col => {
      if (col.id === collegeId || col.name.toLowerCase() === payment.collegeName.toLowerCase()) {
        return {
          ...col,
          feePaid: true,
          paymentOrderId: payment.orderId,
          applicationStatus: 'Submitted'
        };
      }
      return col;
    }));

    // 3. Update timeline stage 5 (Submit Applications)
    setTimeline(prev => prev.map(stage => {
      if (stage.id === 5) {
        return {
          ...stage,
          status: 'In Progress',
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return stage;
    }));

    // 4. Add notification
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title: `Fee Paid: ${payment.collegeName}`,
      description: `Payment of $${payment.amount} USD captured via PayPal Sandbox. Order ID: ${payment.orderId}.`,
      type: 'success',
      time: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Timeline Progress toggle
  const handleToggleStage = async (id: number) => {
    const nextStatusMap: Record<TimelineStage['status'], TimelineStage['status']> = {
      'Completed': 'In Progress',
      'In Progress': 'Pending',
      'Pending': 'Completed'
    };

    let nextStatus: TimelineStage['status'] = 'Completed';
    setTimeline(prev => prev.map(stage => {
      if (stage.id === id) {
        nextStatus = nextStatusMap[stage.status];
        return {
          ...stage,
          status: nextStatus,
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return stage;
    }));

    try {
      await fetch(`/api/timeline/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
    } catch (e) {
      console.warn('Timeline update error:', e);
    }
  };

  // Chat send trigger
  const handleSendMessage = async (text: string) => {
    const userMsg: Message = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsSending(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages })
      });

      const data = await response.json();
      
      const assistantMsg: Message = {
        id: `msg-ast-${Date.now()}`,
        sender: 'assistant',
        text: data.text || "I apologize, I encountered a temporary connection issue. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      const assistantMsg: Message = {
        id: `msg-ast-${Date.now()}`,
        sender: 'assistant',
        text: "I am having trouble reaching the server, but looking at your GPA (3.92) and SAT score (1540), your academic profile remains exceptionally strong for Stanford CS. Please let me know what documents you want to verify next!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsSending(false);
    }
  };

  // Notification Toggles
  const handleMarkRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await fetch('/api/notifications/read', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
    } catch (e) {
      console.warn(e);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await fetch('/api/notifications/read', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
    } catch (e) {
      console.warn(e);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn(e);
    }
  };

  // Profile Updates from Settings
  const handleUpdateProfile = async (updatedProfile: StudentProfile) => {
    setStudent(updatedProfile);
    try {
      await fetch('/api/student', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile)
      });
    } catch (e) {
      console.warn(e);
    }
  };

  // ==================== SECTION ROUTER ====================
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <DashboardView 
            documents={documents}
            colleges={colleges}
            timeline={timeline}
            student={student}
            payments={payments}
            setActiveSection={setActiveSection}
          />
        );
      case 'vault':
        return (
          <DocumentVaultView 
            documents={documents}
            onAddDocument={handleAddDocument}
            onDeleteDocument={handleDeleteDocument}
            onTriggerOcr={handleTriggerOcr}
            setActiveSection={setActiveSection}
          />
        );
      case 'ocr':
        return (
          <OcrVerificationView 
            documents={documents}
            selectedDocumentId={selectedDocumentId}
            onOcrComplete={handleOcrComplete}
          />
        );
      case 'requirements':
        return (
          <CollegeRequirementsView 
            colleges={colleges}
            documents={documents}
            onUpdateStatus={handleUpdateCollegeStatus}
            setActiveSection={setActiveSection}
          />
        );
      case 'payments':
        return (
          <PaymentsView 
            colleges={colleges}
            student={student}
            payments={payments}
            onPaymentSuccess={handlePaymentSuccess}
            setActiveSection={setActiveSection}
          />
        );
      case 'comparison':
        return (
          <CollegeComparisonView 
            colleges={colleges}
          />
        );
      case 'timeline':
        return (
          <AdmissionTimelineView 
            timeline={timeline}
            onToggleStage={handleToggleStage}
          />
        );
      case 'assistant':
        return (
          <AiAssistantView 
            messages={messages}
            onSendMessage={handleSendMessage}
            isSending={isSending}
          />
        );
      case 'analytics':
        return (
          <ReportsAnalyticsView 
            documents={documents}
            colleges={colleges}
            timeline={timeline}
          />
        );
      case 'notifications':
        return (
          <NotificationsView 
            notifications={notifications}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
            onDeleteNotification={handleDeleteNotification}
          />
        );
      case 'settings':
        return (
          <SettingsView 
            student={student}
            onUpdateProfile={handleUpdateProfile}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        );
      default:
        return <div className="text-center py-10 font-bold">404 - Section Not Found</div>;
    }
  };

  const getSectionName = () => {
    switch (activeSection) {
      case 'dashboard': return 'Command Dashboard';
      case 'vault': return 'Smart Document Vault';
      case 'ocr': return 'OCR Verification Center';
      case 'requirements': return 'College Requirements Registry';
      case 'payments': return 'Application Fees (PayPal Sandbox)';
      case 'comparison': return 'College Specifications Comparison';
      case 'timeline': return 'Milestone Roadmap';
      case 'assistant': return 'Admissions AI Counselor';
      case 'analytics': return 'Reports & Analytics Desk';
      case 'notifications': return 'Alerts & Messages';
      case 'settings': return 'System Settings';
      default: return 'AdmissionMate AI';
    }
  };

  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-slate-950 text-slate-100 dark' : 'bg-[#F8FAFC] text-slate-800'}`}>
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        unreadCount={unreadNotificationsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        
        {/* Top Control Bar */}
        <TopBar 
          onMenuClick={() => setSidebarOpen(true)}
          activeSectionName={getSectionName()}
          student={student}
          unreadCount={unreadNotificationsCount}
          setActiveSection={setActiveSection}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        {/* Dynamic Panel Content */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          {renderActiveSection()}
        </main>
        
        {/* Humble Platform Footer */}
        <footer className="py-4 border-t border-slate-200 dark:border-slate-800 text-center text-[10px] text-slate-400 dark:text-slate-500 font-mono font-medium tracking-wide bg-white dark:bg-slate-900">
          ADMISSIONMATE AI PLATFORM • PAYPAL SANDBOX INTEGRATION ACTIVE • SECURELY VERIFIED
        </footer>

      </div>

    </div>
  );
}
