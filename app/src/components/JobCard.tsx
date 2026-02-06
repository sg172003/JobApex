import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Calendar, Building2 } from 'lucide-react';
import type { Job } from '@/types';

interface JobCardProps {
  job: Job;
  onApply: (job: Job) => void;
  isBestMatch?: boolean;
}

export function JobCard({ job, onApply, isBestMatch = false }: JobCardProps) {
  const getMatchScoreColor = (score: number | null) => {
    if (score === null) return 'bg-gray-100 text-gray-600';
    if (score > 70) return 'bg-green-100 text-green-700';
    if (score >= 40) return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-600';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${isBestMatch ? 'border-blue-200' : ''}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            {job.matchScore !== null && (
              <Badge className={`mb-2 ${getMatchScoreColor(job.matchScore)}`}>
                {job.matchScore}% Match
              </Badge>
            )}
            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
            <div className="flex items-center gap-1 text-gray-600 mt-1">
              <Building2 className="w-4 h-4" />
              <span>{job.company}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(job.postedDate)}</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {job.description}
        </p>

        {job.matchExplanation && (
          <p className="text-sm text-gray-500 mb-3 italic">
            {job.matchExplanation}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {job.skills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {job.skills.length > 4 && (
            <Badge variant="secondary" className="text-xs">
              +{job.skills.length - 4}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              {job.jobType}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {job.workMode}
            </Badge>
          </div>
          <Button onClick={() => onApply(job)} size="sm">
            Apply
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
