// Suspect Database Types

export interface CriminalRecord {
  crime: string;
  year: number;
  outcome: string;
  details?: string;
}

export interface Evidence {
  id: string;
  type: "physical" | "digital" | "testimony" | "document";
  description: string;
  strength: "strong" | "moderate" | "weak";
  details: string; // Full details revealed when tool is called
}

export interface Associate {
  name: string;
  relationship: string;
  criminalRecord: boolean;
  notes: string;
}

export interface CurrentCase {
  crime: string;
  description: string;
  amount?: string;
  victim?: string;
  date: string;
  location: string;
  evidenceSummary: string[]; // What detective sees initially
  evidence: Evidence[]; // Full evidence (accessed via tool)
  maxSentence: string;
  minSentence: string;
}

export interface Suspect {
  id: string;
  
  // Personal Details
  name: string;
  age: number;
  gender: "male" | "female";
  city: string;
  address: string;
  phone: string;
  occupation: string;
  employer?: string;
  income: string;
  
  // Family
  maritalStatus: string;
  dependents?: string;
  
  // Criminal History
  priors: CriminalRecord[];
  
  // Associates
  associates: Associate[];
  
  // Current Case
  currentCase: CurrentCase;
  
  // Personality (for detective)
  personality: string;
  weakness: string;
  interrogationNotes: string;
}

// Tool Response Types
export interface EvidenceCheckResult {
  found: boolean;
  evidence: Evidence | null;
  message: string;
}

export interface AlibiCheckResult {
  verified: boolean;
  conflicts: string[];
  message: string;
}

export interface AssociateCheckResult {
  associates: Associate[];
  message: string;
}

