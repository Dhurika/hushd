import React, { useEffect, useState } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { supabase } from './supabase'
import MapScreen from './screens/MapScreen'
import DiscoverScreen from './screens/DiscoverScreen'
import LettersScreen from './screens/LettersScreen'
import DropMoodScreen from './screens/DropMoodScreen'
import LetterScreen from './screens/LetterScreen'
import ProfileScreen from './screens/ProfileScreen'
import LoginScreen from './screens/LoginScreen'
import BottomNav from './components/BottomNav'

const HIDE_NAV = ['/drop', '/write', '/login']

export default function App() {
  const { pathname } = useLocation()
  const showNav = !HIDE_NAV.includes(pathname)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Nunito', fontSize: 18 }}>Loading...</div>

  if (!session) return <LoginScreen />

  return (
    <>
      <Routes>
        <Route path="/"         element={<MapScreen />} />
        <Route path="/discover" element={<DiscoverScreen />} />
        <Route path="/letters"  element={<LettersScreen />} />
        <Route path="/drop"     element={<DropMoodScreen />} />
        <Route path="/write"    element={<LetterScreen />} />
        <Route path="/profile"  element={<ProfileScreen />} />
      </Routes>
      {showNav && <BottomNav />}
    </>
  )
}
