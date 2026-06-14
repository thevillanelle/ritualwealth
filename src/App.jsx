import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuthStore } from './stores/useAuthStore'
import Welcome      from './pages/Welcome'
import Quiz         from './pages/Quiz'
import Results      from './pages/Results'
import Plan         from './pages/Plan'
import AuthCallback from './pages/AuthCallback'

export default function App() {
  const { initialize } = useAuthStore()
  useEffect(() => { initialize() }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                    element={<Welcome />} />
        <Route path="/quiz/:slug"          element={<Quiz />} />
        <Route path="/results/:slug"       element={<Results />} />
        <Route path="/plan"                element={<Plan />} />
        <Route path="/auth/callback"       element={<AuthCallback />} />
      </Routes>
    </BrowserRouter>
  )
}
