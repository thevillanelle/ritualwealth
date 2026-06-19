import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuthStore } from './stores/useAuthStore'
import SuiteNav     from './components/SuiteNav'
import Welcome      from './views/Welcome'
import Quiz         from './views/Quiz'
import Results      from './views/Results'
import Plan         from './views/Plan'
import AuthCallback from './views/AuthCallback'
import WhatIsFire  from './views/WhatIsFire'
import DebtPayoff      from './views/DebtPayoff'
import RitualProfile   from './views/RitualProfile'

export default function App() {
  const { initialize } = useAuthStore()
  useEffect(() => { initialize() }, [])

  return (
    <BrowserRouter>
      <SuiteNav />
      <Routes>
        <Route path="/"                    element={<Welcome />} />
        <Route path="/quiz/:slug"          element={<Quiz />} />
        <Route path="/results/:slug"       element={<Results />} />
        <Route path="/plan"                element={<Plan />} />
        <Route path="/what-is-fire"        element={<WhatIsFire />} />
        <Route path="/tools/debt"          element={<DebtPayoff />} />
        <Route path="/profile"             element={<RitualProfile />} />
        <Route path="/auth/callback"       element={<AuthCallback />} />
      </Routes>
    </BrowserRouter>
  )
}
