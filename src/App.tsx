import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { EditorLayout } from '@/components/layout/EditorLayout'
import { Toaster } from '@/components/ui/toaster'
import { useEditorStore } from '@/store/editorStore'

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
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
      )
    }

    return this.props.children
  }
}

// 404 Page Component
const NotFound: React.FC = () => {
  return (
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
  )
}

// Theme Provider Component
const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme')
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const theme = savedTheme || systemTheme

    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [])

  return <>{children}</>
}

// Loading Component
const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading editor...</p>
      </div>
    </div>
  )
}

function App() {
  const { isLoading } = useEditorStore()

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<EditorLayout />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App