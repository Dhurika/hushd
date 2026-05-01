import React, { useState, useEffect } from 'react'
import styles from './DiscoverScreen.module.css'

export default function DiscoverScreen() {
  const [liveCount, setLiveCount] = useState(2847)

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount(n => Math.max(0, n + Math.floor(Math.random() * 3) - 1))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>hush<span>d</span></div>
          <div className={styles.sub}>world pulse</div>
        </div>
        <div className={styles.livePill}>
          <span className={styles.liveDot} />
          <span>{liveCount.toLocaleString()} live</span>
        </div>
      </div>

      <div className={styles.scroll}>
        <div className={styles.empty}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌍</div>
          <div className={styles.emptyTitle}>No data yet</div>
          <p className={styles.emptySub}>World mood stats will appear here once people start dropping moods.</p>
        </div>
        <div style={{ height: 100 }} />
      </div>
    </div>
  )
}
