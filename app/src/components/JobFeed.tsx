import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, Briefcase, LayoutDashboard, FileText, LogOut, Sparkles } from 'lucide-react';
import { useJobs } from '@/contexts/JobContext';
import { useAuth } from '@/contexts/AuthContext';
import { JobCard } from './JobCard';
import { Filters } from './Filters';
import { AIAssistant } from './AIAssistant';
import { ApplyConfirmationPopup } from './ApplyConfirmationPopup';
import { ApplicationDashboard } from './ApplicationDashboard';
import { ResumeUpload } from './ResumeUpload';
import { apiService } from '@/services/api';
import type { Job } from '@/types';

export function JobFeed() {
  const {
    jobs,
    filteredJobs,
    bestMatches,
    filters,
    setFilters,
    resetFilters,
    isLoadingJobs,
    hasResume,
    fetchJobs,
    fetchApplications,
    applyToJob,
  } = useJobs();

  const { logout } = useAuth();
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const [pendingJob, setPendingJob] = useState<Job | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentView, setCurrentView] = useState<'jobs' | 'applications'>('jobs');
  const [aiFilterUpdate, setAiFilterUpdate] = useState(false);

  // Extract all unique skills from jobs
  const allSkills = Array.from(
    new Set(jobs.flatMap((job) => job.skills))
  ).slice(0, 20);

  // Initial load - fetch jobs and applications once
  useEffect(() => {
    fetchJobs();
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check for pending application on window focus
  useEffect(() => {
    const handleFocus = () => {
      const pending = sessionStorage.getItem('pendingApplication');
      if (pending) {
        const { jobId } = JSON.parse(pending);
        const job = jobs.find((j) => j.id === jobId);
        if (job) {
          setPendingJob(job);
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [jobs]);

  // Check if resume is needed
  useEffect(() => {
    if (!hasResume && !isLoadingJobs) {
      setShowResumeUpload(true);
    }
  }, [hasResume, isLoadingJobs]);

  const handleApply = (job: Job) => {
    applyToJob(job);
    // Show confirmation after a delay (simulating user returning)
    setTimeout(() => {
      setPendingJob(job);
    }, 3000);
  };

  const handleConfirmApplication = async (status: 'applied' | 'browsing' | 'earlier') => {
    if (!pendingJob) return;

    if (status === 'applied' || status === 'earlier') {
      try {
        await apiService.createApplication(pendingJob.id, status === 'earlier' ? 'Applied' : 'Applied');
        await fetchApplications();
      } catch (error) {
        console.error('Failed to create application:', error);
      }
    }

    setPendingJob(null);
    sessionStorage.removeItem('pendingApplication');
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(newFilters);
    // Show AI filter update indicator
    setAiFilterUpdate(true);
    setTimeout(() => setAiFilterUpdate(false), 3000);
  };

  if (currentView === 'applications') {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
                <span className="text-xl font-bold">JobApex</span>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentView('jobs')}
                >
                  <Briefcase className="w-5 h-5 mr-2" />
                  Jobs
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowResumeUpload(true)}
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Resume
                </Button>
                <Button variant="ghost" onClick={logout}>
                  <LogOut className="w-5 h-5 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ApplicationDashboard onBack={() => setCurrentView('jobs')} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <span className="text-xl font-bold">JobApex</span>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setCurrentView('applications')}
              >
                <LayoutDashboard className="w-5 h-5 mr-2" />
                Applications
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowResumeUpload(true)}
              >
                <FileText className="w-5 h-5 mr-2" />
                Resume
              </Button>
              <Button variant="ghost" onClick={logout}>
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <Filters
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={resetFilters}
                availableSkills={allSkills}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>

            {/* AI Filter Update Indicator */}
            {aiFilterUpdate && (
              <div className="mb-4 flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                <Sparkles className="w-5 h-5" />
                <span>Filters updated by AI</span>
              </div>
            )}

            {/* Loading State */}
            {isLoadingJobs && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
                <p className="text-gray-600">AI is analyzing jobs against your profile...</p>
              </div>
            )}

            {/* Resume Missing State */}
            {!isLoadingJobs && !hasResume && (
              <Card className="mb-8">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Resume not uploaded
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Please upload your resume to see job matches.
                  </p>
                  <Button onClick={() => setShowResumeUpload(true)}>
                    Upload Resume
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Best Matches Section */}
            {!isLoadingJobs && hasResume && bestMatches.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Best Matches</h2>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {bestMatches.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onApply={handleApply}
                      isBestMatch
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Jobs Section */}
            {!isLoadingJobs && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">
                    {filters.searchTitle || filters.skills.length > 0
                      ? 'Search Results'
                      : 'All Jobs'}
                  </h2>
                  <span className="text-gray-500">
                    {filteredJobs.length} jobs found
                  </span>
                </div>

                {filteredJobs.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        No jobs found
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Try adjusting your filters or asking the AI for help.
                      </p>
                      <Button onClick={resetFilters}>Clear Filters</Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredJobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onApply={handleApply}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Resume Upload Modal */}
      {showResumeUpload && (
        <ResumeUpload
          onUploadComplete={() => {
            setShowResumeUpload(false);
            fetchJobs();
          }}
          onSkip={() => setShowResumeUpload(false)}
        />
      )}

      {/* Apply Confirmation Popup */}
      {pendingJob && (
        <ApplyConfirmationPopup
          job={pendingJob}
          onConfirm={handleConfirmApplication}
        />
      )}

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
}
