export interface User {
  id: string;
  email: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  skills: string[];
  jobType: string;
  workMode: string;
  postedDate: string;
  applyUrl: string;
  matchScore: number | null;
  matchExplanation: string | null;
  matchingSkills: string[];
  keywordOverlap: string[];
}

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  status: 'Applied' | 'Interview' | 'Offer' | 'Rejected';
  notes: string;
  appliedAt: string;
  updatedAt: string;
  timeline: { status: string; timestamp: string }[];
  job?: Job;
}

export interface Filters {
  searchTitle: string;
  skills: string[];
  datePosted: 'any' | '24h' | 'week' | 'month';
  jobType: string[];
  workMode: string[];
  location: string;
  matchScore: 'all' | 'high' | 'medium';
}

export interface Resume {
  uploadedAt: string;
  fileName: string;
  textLength: number;
}

export interface AIResponse {
  intent: 'filter_update' | 'job_search' | 'help' | 'general';
  message: string;
  filters?: Partial<Filters>;
  searchCriteria?: Record<string, unknown>;
}
