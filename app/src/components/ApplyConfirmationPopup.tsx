import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import type { Job } from '@/types';

interface ApplyConfirmationPopupProps {
  job: Job;
  onConfirm: (status: 'applied' | 'browsing' | 'earlier') => void;
}

export function ApplyConfirmationPopup({ job, onConfirm }: ApplyConfirmationPopupProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            Did you apply to {job.title} at {job.company}?
          </CardTitle>
          <p className="text-gray-500 mt-2">
            Please confirm to track this application.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={() => onConfirm('applied')}
            className="w-full justify-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-5 h-5" />
            Yes, applied
          </Button>

          <Button
            onClick={() => onConfirm('browsing')}
            variant="outline"
            className="w-full justify-center gap-2"
          >
            <XCircle className="w-5 h-5" />
            No, just browsing
          </Button>

          <Button
            onClick={() => onConfirm('earlier')}
            variant="outline"
            className="w-full justify-center gap-2"
          >
            <Clock className="w-5 h-5" />
            Applied earlier
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
