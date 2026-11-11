import { Document, College, StudentProfile, TimelineStage, ReadinessBreakdown } from '../types';

/**
 * Calculates a transparent, multi-factor Admission Readiness Score (0 - 100)
 * based on verified documents, academic criteria, timeline completion, and fee payment.
 */
export function calculateReadinessScore(
  student: StudentProfile,
  targetCollege: College | undefined,
  documents: Document[],
  timeline: TimelineStage[]
): ReadinessBreakdown {
  if (!targetCollege) {
    return {
      overallScore: 70,
      documentsScore: 25,
      eligibilityScore: 25,
      applicationScore: 10,
      feeScore: 10,
      missingDocs: [],
      expiredDocs: [],
      pendingDocs: [],
      recommendedSteps: ['Select a primary target college to calculate specific admission readiness.'],
    };
  }

  // 1. Documents Analysis (40 points max)
  const requiredCategories = targetCollege.requiredDocs;
  let docPoints = 0;
  const pointsPerDoc = requiredCategories.length > 0 ? 40 / requiredCategories.length : 40;

  const missingDocs: string[] = [];
  const pendingDocs: string[] = [];
  const expiredDocs: string[] = [];

  requiredCategories.forEach((reqCat) => {
    // Check if there is an uploaded document that matches category or name
    const found = documents.find(
      (d) => d.category.toLowerCase().includes(reqCat.toLowerCase()) || 
             d.name.toLowerCase().includes(reqCat.toLowerCase()) ||
             reqCat.toLowerCase().includes(d.category.toLowerCase())
    );

    if (!found) {
      missingDocs.push(reqCat);
    } else if (found.verificationStatus === 'Expired') {
      expiredDocs.push(found.name);
    } else if (found.verificationStatus === 'Pending') {
      pendingDocs.push(found.name);
      docPoints += pointsPerDoc * 0.5; // partial credit for uploaded but pending
    } else if (found.verificationStatus === 'Verified') {
      docPoints += pointsPerDoc;
    } else {
      missingDocs.push(reqCat);
    }
  });

  const documentsScore = Math.min(40, Math.round(docPoints));

  // 2. Academic / Eligibility (30 points max)
  let eligibilityScore = 0;
  const gpaMatch = student.gpa.match(/([0-9.]+)/);
  const parsedGpa = gpaMatch ? parseFloat(gpaMatch[1]) : 3.8;
  if (parsedGpa >= 3.8) {
    eligibilityScore += 15;
  } else if (parsedGpa >= 3.5) {
    eligibilityScore += 12;
  } else if (parsedGpa >= 3.0) {
    eligibilityScore += 8;
  } else {
    eligibilityScore += 5;
  }

  const satMatch = student.satScore.match(/([0-9]+)/);
  const parsedSat = satMatch ? parseInt(satMatch[1], 10) : 1500;
  if (parsedSat >= 1500) {
    eligibilityScore += 15;
  } else if (parsedSat >= 1400) {
    eligibilityScore += 12;
  } else if (parsedSat >= 1200) {
    eligibilityScore += 8;
  } else {
    eligibilityScore += 5;
  }

  // 3. Application Roadmap Progress (15 points max)
  const completedStages = timeline.filter((t) => t.status === 'Completed').length;
  const applicationScore = Math.round((completedStages / Math.max(1, timeline.length)) * 15);

  // 4. Application Fee Payment (15 points max)
  const feeScore = targetCollege.feePaid ? 15 : 0;

  const overallScore = Math.min(100, Math.max(0, documentsScore + eligibilityScore + applicationScore + feeScore));

  // Recommendations generator
  const recommendedSteps: string[] = [];

  if (missingDocs.length > 0) {
    recommendedSteps.push(`Upload missing documents: ${missingDocs.slice(0, 2).join(', ')}.`);
  }
  if (pendingDocs.length > 0) {
    recommendedSteps.push(`Run OCR verification on ${pendingDocs[0]} to confirm credential validity.`);
  }
  if (expiredDocs.length > 0) {
    recommendedSteps.push(`Renew expired document: ${expiredDocs[0]}.`);
  }
  if (!targetCollege.feePaid) {
    recommendedSteps.push(`Pay the $${targetCollege.applicationFee} application fee via PayPal Sandbox to complete submission.`);
  }
  if (recommendedSteps.length === 0) {
    recommendedSteps.push(`All requirements satisfied for ${targetCollege.name}! Monitor admissions timeline for decision announcements.`);
  }

  return {
    overallScore,
    documentsScore,
    eligibilityScore,
    applicationScore,
    feeScore,
    missingDocs,
    expiredDocs,
    pendingDocs,
    recommendedSteps,
  };
}

/**
 * Calculates SHA-256 hash from a File or ArrayBuffer in the browser.
 */
export async function calculateFileSha256(file: File | Blob): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
