import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProjectWorkspace from './pages/ProjectWorkspace';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
      refetchOnWindowFocus: false, // Prevent aggressive refetching when switching tabs or windows
      retry: 1, // Only retry failed requests once before showing an error
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/project/:id" element={<ProjectWorkspace />} />
          
          {/* Fallback/Home Route:
            For now, if someone visits the root URL ("/"), we will redirect them
            to a hardcoded project ID for testing purposes. 
            (Later, you would replace this with a Dashboard page showing all projects).
          */}
          <Route path="/" element={<Navigate to="/project/test-project-id" replace />} />
          
          {/* Catch-all route for 404 Not Found errors */}
          <Route 
            path="*" 
            element={
              <div className="flex h-screen w-full items-center justify-center bg-background text-accent-cyan font-mono text-xl">
                404 // SYSTEM NODE NOT FOUND
              </div>
            } 
          />
        </Routes>
      </Router>

      {/* React Query Devtools:
        This creates a small icon in the bottom corner of your screen during development.
        Clicking it lets you inspect all the cached API data (Schemas, Endpoints, etc.).
        It automatically hides itself in production builds.
      */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}