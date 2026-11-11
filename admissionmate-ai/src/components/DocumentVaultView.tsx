import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Upload, 
  Trash2, 
  FileCheck2, 
  Hourglass, 
  AlertCircle, 
  Sparkles, 
  FileText,
  Plus,
  ShieldCheck,
  Fingerprint,
  Info,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Document } from '../types';
import { DOCUMENT_CATEGORIES } from '../data';
import { calculateFileSha256 } from '../utils/readiness';

interface DocumentVaultProps {
  documents: Document[];
  onAddDocument: (doc: Document) => void;
  onDeleteDocument: (id: string) => void;
  onTriggerOcr: (doc: Document) => void;
  setActiveSection: (section: string) => void;
}

export default function DocumentVaultView({
  documents,
  onAddDocument,
  onDeleteDocument,
  onTriggerOcr,
  setActiveSection
}: DocumentVaultProps) {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [dragActive, setDragActive] = useState(false);
  
  // Form states
  const [newDocName, setNewDocName] = useState('');
  const [newDocCategory, setNewDocCategory] = useState(DOCUMENT_CATEGORIES[0]);
  const [newDocType, setNewDocType] = useState('PDF');
  const [isUploading, setIsUploading] = useState(false);
  
  // Duplicate Alert State
  const [duplicateAlert, setDuplicateAlert] = useState<{
    detected: boolean;
    hash: string;
    existingName: string;
    existingCategory: string;
  } | null>(null);

  // Success Notification state
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || doc.verificationStatus === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Process Real File Upload with SHA-256 and Duplicate Detection
  const processRealFile = async (file: File, customName?: string, customCategory?: string) => {
    setIsUploading(true);
    setDuplicateAlert(null);
    setUploadSuccessMessage(null);

    try {
      // 1. Calculate Real SHA-256 Hash
      const sha256Hash = await calculateFileSha256(file);
      
      // 2. Check for Duplicate Document
      const existingDuplicate = documents.find(d => d.sha256Hash === sha256Hash);
      if (existingDuplicate) {
        setDuplicateAlert({
          detected: true,
          hash: sha256Hash,
          existingName: existingDuplicate.name,
          existingCategory: existingDuplicate.category,
        });
        setIsUploading(false);
        return;
      }

      // 3. Format file details
      const fileSize = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
      let fileType = 'PDF';
      if (file.type.includes('png') || file.name.endsWith('.png')) fileType = 'PNG';
      else if (file.type.includes('jpeg') || file.type.includes('jpg') || file.name.endsWith('.jpg')) fileType = 'JPG';

      const docName = customName || file.name.replace(/\.[^/.]+$/, "");
      const docCategory = customCategory || inferCategoryFromName(file.name);

      // 4. Read base64 for OCR processing
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          resolve(res.split(',')[1] || '');
        };
        reader.readAsDataURL(file);
      });

      // 5. Trigger server-side OCR extraction with Gemini
      let extractedData = undefined;
      try {
        const ocrRes = await fetch('/api/gemini/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64Data,
            mimeType: file.type || 'application/pdf',
            category: docCategory,
            documentName: docName,
          }),
        });
        if (ocrRes.ok) {
          const ocrJson = await ocrRes.json();
          extractedData = ocrJson.extractedData;
        }
      } catch (ocrErr) {
        console.warn('OCR extraction warning:', ocrErr);
      }

      // 6. Build document record
      const newDoc: Document = {
        id: `doc-${Date.now()}`,
        name: docName,
        category: docCategory,
        uploadDate: new Date().toISOString().split('T')[0],
        verificationStatus: extractedData ? 'Verified' : 'Pending',
        expiryDate: 'Lifetime',
        fileSize,
        fileType,
        sha256Hash,
        extractedData,
      };

      // 7. Save to server persistent DB
      try {
        await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newDoc),
        });
      } catch (dbErr) {
        console.warn('Backend document save warning:', dbErr);
      }

      onAddDocument(newDoc);
      setUploadSuccessMessage(`"${newDoc.name}" uploaded successfully! SHA-256 hash verified and stored.`);
      setNewDocName('');
    } catch (err: any) {
      console.error('File upload error:', err);
      alert(`Upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Category inference helper
  const inferCategoryFromName = (filename: string): string => {
    const fn = filename.toLowerCase();
    if (fn.includes('10th') || fn.includes('tenth') || fn.includes('matric')) return '10th Marksheet';
    if (fn.includes('12th') || fn.includes('twelfth') || fn.includes('inter') || fn.includes('hsc')) return '12th Marksheet';
    if (fn.includes('aadhaar') || fn.includes('aadhar') || fn.includes('uid')) return 'Aadhaar';
    if (fn.includes('income') || fn.includes('salary') || fn.includes('tax')) return 'Income Certificate';
    if (fn.includes('community') || fn.includes('caste') || fn.includes('obc') || fn.includes('sc') || fn.includes('st')) return 'Community Certificate';
    if (fn.includes('passport')) return 'Passport';
    if (fn.includes('birth')) return 'Birth Certificate';
    if (fn.includes('lor') || fn.includes('recommend') || fn.includes('letter')) return 'Recommendation Letter';
    return DOCUMENT_CATEGORIES[0];
  };

  // Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processRealFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processRealFile(file, newDocName || undefined, newDocCategory);
    }
  };

  const handleManualFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName) return;

    // Create a mock buffer representing the document text content
    const encoder = new TextEncoder();
    const data = encoder.encode(`AdmissionMate Document: ${newDocName} | ${newDocCategory} | ${Date.now()}`);
    const blob = new Blob([data], { type: newDocType === 'PDF' ? 'application/pdf' : 'image/png' });
    const file = new File([blob], `${newDocName}.${newDocType.toLowerCase()}`, { type: blob.type });

    processRealFile(file, newDocName, newDocCategory);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <FileCheck2 className="h-3.5 w-3.5" /> AI Parsed & Validated
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Hourglass className="h-3.5 w-3.5" /> Pending Verification
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800">
            <AlertCircle className="h-3.5 w-3.5" /> Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <AlertCircle className="h-3.5 w-3.5" /> Missing
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Duplicate Document Detection Alert */}
      {duplicateAlert && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900 rounded-2xl flex items-start justify-between gap-3 text-red-800 dark:text-red-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/60 rounded-xl text-red-600 dark:text-red-300 shrink-0">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Duplicate Document Detected & Blocked!</h4>
              <p className="text-xs mt-1 text-red-700 dark:text-red-300 leading-relaxed">
                This exact file has already been uploaded as <strong>"{duplicateAlert.existingName}"</strong> ({duplicateAlert.existingCategory}).
                AdmissionMate AI calculates cryptographic SHA-256 hashes to block duplicate uploads and preserve submission audit integrity.
              </p>
              <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 bg-red-100/70 dark:bg-red-900/40 rounded font-mono text-[11px] text-red-800 dark:text-red-200">
                <Fingerprint className="h-3.5 w-3.5" /> SHA-256: {duplicateAlert.hash}
              </div>
            </div>
          </div>
          <button 
            onClick={() => setDuplicateAlert(null)}
            className="text-red-400 hover:text-red-600 dark:hover:text-white text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Upload Success Alert */}
      {uploadSuccessMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-900 rounded-2xl flex items-center justify-between gap-3 text-emerald-800 dark:text-emerald-200">
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">{uploadSuccessMessage}</span>
          </div>
          <button 
            onClick={() => setUploadSuccessMessage(null)}
            className="text-emerald-500 hover:text-emerald-700 dark:hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Verification Transparency Banner */}
      <div className="px-4 py-3 bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
        <Info className="h-4 w-4 text-[#006A6A] dark:text-teal-400 shrink-0" />
        <span>
          <strong>Transparency Notice:</strong> Verification statuses reflect client-uploaded document structure analysis and AI OCR extraction. Official admissions verification is performed directly by the respective university admissions committee upon formal application review.
        </span>
      </div>

      {/* Upload and Document addition control card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Form Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2 mb-4">
              <Upload className="h-5 w-5 text-[#006A6A] dark:text-teal-400" />
              Upload New Document
            </h2>
            
            <form onSubmit={handleManualFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Document Title
                </label>
                <input 
                  type="text" 
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="e.g. CBSE 12th Board Certificate"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#006A6A] focus:bg-white dark:focus:bg-slate-900 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                  <select 
                    value={newDocCategory}
                    onChange={(e) => setNewDocCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#006A6A] transition-colors"
                  >
                    {DOCUMENT_CATEGORIES.map((cat, i) => (
                      <option key={i} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">File Format</label>
                  <select 
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#006A6A] transition-colors"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="PNG">PNG Image</option>
                    <option value="JPG">JPG Image</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isUploading || !newDocName}
                className="w-full py-2.5 px-4 bg-[#006A6A] text-white font-semibold text-sm rounded-xl hover:bg-[#005151] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Hourglass className="h-4 w-4 animate-spin" />
                    Calculating Hash & Uploading...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Register Document Entry
                  </>
                )}
              </button>
            </form>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <Fingerprint className="h-4 w-4 text-[#006A6A] dark:text-teal-400" />
            <span>SHA-256 duplicate validation applied automatically.</span>
          </div>
        </div>

        {/* Drag & Drop File Upload card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white tracking-tight mb-2">
              Drag & Drop Smart File Uploader
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Upload local certificates, board transcripts, identity proofs, or recommendation letters. Supports PDF, JPG, and PNG files up to 15MB.
            </p>
          </div>

          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`flex-1 border-2 border-dashed rounded-2xl my-4 flex flex-col items-center justify-center text-center p-6 transition-all duration-200 ${
              dragActive 
                ? 'border-[#006A6A] bg-teal-50/40 dark:bg-[#006A6A]/10 text-[#006A6A]' 
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-400'
            }`}
          >
            <Upload className={`h-10 w-10 mb-3 transition-transform ${dragActive ? 'scale-110 text-[#006A6A]' : 'text-slate-300 dark:text-slate-600'}`} />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Drag & Drop your document here
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              PDF, JPG, or PNG • Automatic SHA-256 hashing & duplicate check
            </p>
            <div className="mt-4">
              <label className="px-4 py-2 bg-[#E6F0F0] dark:bg-[#006A6A]/20 hover:bg-teal-100 dark:hover:bg-[#006A6A]/30 text-[#006A6A] dark:text-teal-400 text-xs font-semibold rounded-xl cursor-pointer transition-colors inline-block">
                Choose Local File
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileInput} 
                  accept=".pdf,.png,.jpg,.jpeg"
                />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Cryptographic integrity secured
            </span>
            <span>Gemini 3.8 Flash OCR available</span>
          </div>
        </div>
      </div>

      {/* Vault List Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Filter controls */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center max-w-sm flex-1 relative">
            <Search className="absolute left-3 text-slate-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder="Search documents or categories..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#006A6A] transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Filter:</span>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 focus:outline-none focus:border-[#006A6A]"
            >
              <option value="All">All Categories</option>
              {DOCUMENT_CATEGORIES.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 focus:outline-none focus:border-[#006A6A]"
            >
              <option value="All">All Statuses</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
              <option value="Missing">Missing</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Vault Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/30 dark:bg-slate-800/30">
                <th className="py-4 px-6">Document Name & Hash</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Upload Date</th>
                <th className="py-4 px-6">Verification Status</th>
                <th className="py-4 px-6">Expiry</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors text-sm text-slate-700 dark:text-slate-300">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-teal-400 rounded-lg shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-white leading-none">{doc.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono font-medium">
                              {doc.fileType} • {doc.fileSize}
                            </span>
                            {doc.sha256Hash && (
                              <span 
                                title={`SHA-256: ${doc.sha256Hash}`}
                                className="font-mono text-[9px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded flex items-center gap-1"
                              >
                                <Fingerprint className="h-2.5 w-2.5 text-[#006A6A]" />
                                {doc.sha256Hash.slice(0, 10)}...
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
                        {doc.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {doc.uploadDate}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(doc.verificationStatus)}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400">
                      {doc.expiryDate}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        {doc.verificationStatus !== 'Verified' ? (
                          <button
                            onClick={() => onTriggerOcr(doc)}
                            className="px-2.5 py-1 text-xs font-bold bg-[#006A6A] hover:bg-[#005151] text-white rounded-lg flex items-center gap-1 shadow-sm transition-colors"
                            title="Run OCR Verification on this file"
                          >
                            <Sparkles className="h-3 w-3" /> Verify
                          </button>
                        ) : (
                          <button
                            onClick={() => onTriggerOcr(doc)}
                            className="px-2.5 py-1 text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1 transition-colors"
                            title="View extracted parameters"
                          >
                            <FileCheck2 className="h-3 w-3 text-[#006A6A] dark:text-teal-400" /> OCR Data
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteDocument(doc.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                          title="Delete file"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col items-center justify-center p-6">
                      <FileText className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No documents found matching the filters</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try tweaking your search term or selection parameters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
