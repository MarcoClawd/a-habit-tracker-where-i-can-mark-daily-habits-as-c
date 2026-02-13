import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app'
import './index.css'

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null }
  
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <h1 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
              {this.state.error.message}
            </pre>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)