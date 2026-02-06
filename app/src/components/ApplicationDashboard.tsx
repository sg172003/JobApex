import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Building2, MapPin, Calendar, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { useJobs } from '@/contexts/JobContext';

const statusColors: Record<string, string> = {
  Applied: 'bg-blue-100 text-blue-700',
  Interview: 'bg-yellow-100 text-yellow-700',
  Offer: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

const statusFlow = ['Applied', 'Interview', 'Offer', 'Rejected'];

interface ApplicationDashboardProps {
  onBack: () => void;
}

export function ApplicationDashboard({ onBack }: ApplicationDashboardProps) {
  const { applications, updateApplicationStatus, isLoadingApplications } = useJobs();
  const [expandedApp, setExpandedApp] = useState<string | null>(null);

  const toggleExpand = (appId: string) => {
    setExpandedApp(expandedApp === appId ? null : appId);
  };

  const handleStatusChange = async (appId: string, newStatus: string) => {
    await updateApplicationStatus(appId, newStatus);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoadingApplications) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <FileText className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          No applications yet
        </h3>
        <p className="text-gray-500 max-w-md">
          Start applying to jobs to see your tracked applications here.
        </p>
        <Button onClick={onBack} className="mt-4">
          Browse Jobs
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Application Tracking Dashboard</h2>
        <Button variant="outline" onClick={onBack}>
          Back to Jobs
        </Button>
      </div>

      <div className="space-y-4">
        {applications.map((app) => (
          <Card key={app.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {app.job?.title || 'Unknown Position'}
                      </h3>
                      <Badge className={statusColors[app.status] || 'bg-gray-100'}>
                        {app.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        <span>{app.job?.company || 'Unknown Company'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{app.job?.location || 'Unknown Location'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Applied {formatDate(app.appliedAt)}</span>
                      </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="flex items-center gap-2 mt-4">
                      {statusFlow.map((status, index) => {
                        const isActive = statusFlow.indexOf(app.status) >= index;
                        const isCurrent = app.status === status;

                        return (
                          <React.Fragment key={status}>
                            <div
                              className={`
                                w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                                ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}
                                ${isCurrent ? 'ring-2 ring-blue-300 ring-offset-2' : ''}
                              `}
                            >
                              {index + 1}
                            </div>
                            {index < statusFlow.length - 1 && (
                              <div
                                className={`w-8 h-0.5 ${
                                  isActive && statusFlow.indexOf(app.status) > index
                                    ? 'bg-blue-600'
                                    : 'bg-gray-200'
                                }`}
                              />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                    <div className="flex gap-8 mt-1 text-xs text-gray-500">
                      {statusFlow.map((status) => (
                        <span key={status} className="w-8 text-center">
                          {status}
                        </span>
                      ))}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(app.id, 'Applied')}
                        disabled={app.status === 'Applied'}
                      >
                        Mark as Applied
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(app.id, 'Interview')}
                        disabled={app.status === 'Interview'}
                      >
                        Mark as Interview
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(app.id, 'Offer')}
                        disabled={app.status === 'Offer'}
                      >
                        Mark as Offer
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(app.id, 'Rejected')}
                        disabled={app.status === 'Rejected'}
                      >
                        Mark as Rejected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Expandable Timeline Details */}
                <button
                  onClick={() => toggleExpand(app.id)}
                  className="flex items-center gap-1 text-sm text-blue-600 mt-4 hover:text-blue-800"
                >
                  {expandedApp === app.id ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Hide timeline details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Show timeline details
                    </>
                  )}
                </button>

                {expandedApp === app.id && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-3">Application Timeline</h4>
                    <div className="space-y-3">
                      {app.timeline.map((event, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" />
                          <div>
                            <p className="font-medium">{event.status}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(event.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
