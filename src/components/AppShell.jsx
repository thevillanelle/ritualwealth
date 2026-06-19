'use client'
import { useEffect } from 'react'
import { useAuthStore } from '../stores/useAuthStore'
import SuiteNav from './SuiteNav'

export default function AppShell({ children }) {
  const { initialize } = useAuthStore()
  useEffect(() => { initialize() }, [])
  return (
    <>
      <SuiteNav />
      {children}
    </>
  )
}
