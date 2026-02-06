import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { JobProvider } from '@/contexts/JobContext';
import { Login } from '@/components/Login';
import { JobFeed } from '@/components/JobFeed';
import { Toaster } from '@/components/ui/sonner';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <JobFeed />;
}

function App() {
  return (
    <AuthProvider>
      <JobProvider>
        <AppContent />
        <Toaster />
      </JobProvider>
    </AuthProvider>
  );
}

export default App;
