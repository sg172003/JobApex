import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Job, Application, Filters } from '@/types';
import { apiService } from '@/services/api';

interface JobContextType {
  jobs: Job[];
  applications: Application[];
  filters: Filters;
  isLoadingJobs: boolean;
  isLoadingApplications: boolean;
  hasResume: boolean;
  fetchJobs: () => Promise<void>;
  fetchApplications: () => Promise<void>;
  applyToJob: (job: Job) => Promise<void>;
  updateApplicationStatus: (id: string, status: string) => Promise<void>;
  setFilters: (filters: Partial<Filters>) => void;
  resetFilters: () => void;
  filteredJobs: Job[];
  bestMatches: Job[];
}

const defaultFilters: Filters = {
  searchTitle: '',
  skills: [],
  datePosted: 'any',
  jobType: [],
  workMode: [],
  location: '',
  matchScore: 'all',
};

const JobContext = createContext<JobContextType | undefined>(undefined);

export function JobProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filters, setFiltersState] = useState<Filters>(defaultFilters);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const [hasResume, setHasResume] = useState(false);

  const fetchJobs = useCallback(async () => {
    setIsLoadingJobs(true);
    try {
      const response = await apiService.getJobs();
      setJobs(response.jobs);
      setHasResume(response.hasResume);
    } finally {
      setIsLoadingJobs(false);
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    setIsLoadingApplications(true);
    try {
      const response = await apiService.getApplications();
      setApplications(response.applications);
    } finally {
      setIsLoadingApplications(false);
    }
  }, []);

  const applyToJob = useCallback(async (job: Job) => {
    // Open external link
    window.open(job.applyUrl, '_blank');

    // Store pending application in session storage
    sessionStorage.setItem('pendingApplication', JSON.stringify({
      jobId: job.id,
      timestamp: Date.now(),
    }));
  }, []);

  const updateApplicationStatus = useCallback(async (id: string, status: string) => {
    const response = await apiService.updateApplication(id, { status });
    setApplications(prev =>
      prev.map(app => (app.id === id ? response.application : app))
    );
  }, []);

  const setFilters = useCallback((newFilters: Partial<Filters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters);
  }, []);

  // Apply filters to jobs
  const filteredJobs = jobs.filter(job => {
    // Title search
    if (filters.searchTitle) {
      const searchLower = filters.searchTitle.toLowerCase();
      const matchesTitle = job.title.toLowerCase().includes(searchLower);
      const matchesCompany = job.company.toLowerCase().includes(searchLower);
      if (!matchesTitle && !matchesCompany) return false;
    }

    // Skills filter
    if (filters.skills.length > 0) {
      const hasMatchingSkill = filters.skills.some(skill =>
        job.skills.some(jobSkill =>
          jobSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      if (!hasMatchingSkill) return false;
    }

    // Date posted filter
    if (filters.datePosted !== 'any') {
      const postedDate = new Date(job.postedDate);
      const now = new Date();
      const diffDays = (now.getTime() - postedDate.getTime()) / (1000 * 60 * 60 * 24);

      if (filters.datePosted === '24h' && diffDays > 1) return false;
      if (filters.datePosted === 'week' && diffDays > 7) return false;
      if (filters.datePosted === 'month' && diffDays > 30) return false;
    }

    // Job type filter
    if (filters.jobType.length > 0) {
      if (!filters.jobType.includes(job.jobType)) return false;
    }

    // Work mode filter
    if (filters.workMode.length > 0) {
      if (!filters.workMode.includes(job.workMode)) return false;
    }

    // Location filter
    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      if (!job.location.toLowerCase().includes(locationLower)) return false;
    }

    // Match score filter
    if (filters.matchScore !== 'all' && job.matchScore !== null) {
      if (filters.matchScore === 'high' && job.matchScore <= 70) return false;
      if (filters.matchScore === 'medium' && (job.matchScore < 40 || job.matchScore > 70)) return false;
    }

    return true;
  });

  // Get best matches (top 6-8 jobs by match score)
  const bestMatches = [...jobs]
    .filter(job => job.matchScore !== null)
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
    .slice(0, 8);

  return (
    <JobContext.Provider
      value={{
        jobs,
        applications,
        filters,
        isLoadingJobs,
        isLoadingApplications,
        hasResume,
        fetchJobs,
        fetchApplications,
        applyToJob,
        updateApplicationStatus,
        setFilters,
        resetFilters,
        filteredJobs,
        bestMatches,
      }}
    >
      {children}
    </JobContext.Provider>
  );
}

export function useJobs() {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
}
