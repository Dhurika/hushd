import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import MapScreen from './screens/MapScreen'
import DiscoverScreen from './screens/DiscoverScreen'
import LettersScreen from './screens/LettersScreen'
import DropMoodScreen from './screens/DropMoodScreen'
import LetterScreen from './screens/LetterScreen'
import ProfileScreen from './screens/ProfileScreen'
import BottomNav from './components/BottomNav'

const HIDE_NAV = ['/drop', '/write']

export default function App() {
  const { pathname } = useLocation()
  const showNav = !HIDE_NAV.includes(pathname)

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
