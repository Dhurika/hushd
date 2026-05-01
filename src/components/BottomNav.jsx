import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import styles from './BottomNav.module.css'

const TABS = [
  { path: '/',         icon: '🗺️', label: 'Map'      },
  { path: '/discover', icon: '🌍', label: 'Discover' },
  { path: '/letters',  icon: '💌', label: 'Letters'  },
  { path: '/profile',  icon: '👤', label: 'Me'       },
]

export default function SideNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <div className={`${styles.nav} ${open ? styles.navOpen : ''}`}>
      <button className={styles.toggle} onClick={() => setOpen(o => !o)}>
        {open ? '✕' : '☰'}
      </button>

      <div className={styles.tabs}>
        {TABS.map(t => {
          const active = pathname === t.path
          return (
            <button
              key={t.path}
              className={`${styles.tab} ${active ? styles.active : ''}`}
              onClick={() => { navigate(t.path); setOpen(false) }}
            >
              <span className={styles.icon}>{t.icon}</span>
              {open && <span className={styles.label}>{t.label}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
