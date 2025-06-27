import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { EditorLayout } from '@/components/layout/EditorLayout';
import { Toaster } from '@/components/ui/toaster';
import { useEditorStore } from '@/store/editorStore';

// Error Boundary for catching runtime errors in the app
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-4">
              The application encountered an unexpected error.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// 404 Page
const NotFound: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-gray-600 mb-8">Page not found</p>
      <a
        href="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Go back to editor
      </a>
    </div>
  </div>
);

// Placeholder for future settings page
const SettingsPage: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Settings</h1>
      <p className="text-gray-600 mb-8">Settings coming soon.</p>
      <a
        href="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Back to Editor
      </a>
    </div>
  </div>
);

// Placeholder for loading
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <span className="text-lg text-gray-600">Loading...</span>
  </div>
);

function App() {
  const { isLoading } = useEditorStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<EditorLayout />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
