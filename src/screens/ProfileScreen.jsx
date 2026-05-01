import React from 'react'
import styles from './ProfileScreen.module.css'

export default function ProfileScreen() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>hush<span>d</span></div>
        <div className={styles.sub}>your space</div>
      </div>

      <div className={styles.scroll}>
        <div className={styles.avatarSection}>
          <div className={styles.avatar}>🤫</div>
          <div className={styles.anonLabel}>Anonymous</div>
          <div className={styles.anonSub}>Your identity is always protected</div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statNum}>0</div>
            <div className={styles.statLabel}>mood drops</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNum}>0</div>
            <div className={styles.statLabel}>relates</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNum} style={{ color: 'var(--pink)' }}>0</div>
            <div className={styles.statLabel}>letters received</div>
          </div>
        </div>

        <div className={styles.sectionTitle}>Your mood drops</div>
        <div className={styles.empty}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✏️</div>
          <div>No drops yet. Go drop your mood on the map!</div>
        </div>

        <div style={{ height: 100 }} />
      </div>
    </div>
  )
}
