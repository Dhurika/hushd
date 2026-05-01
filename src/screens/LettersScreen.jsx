import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './LettersScreen.module.css'

export default function LettersScreen() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('inbox')

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>←</button>
        <span className={styles.title}>Letters 💌</span>
        <div style={{ width: 40 }} />
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'inbox' ? styles.tabActive : ''}`} onClick={() => setTab('inbox')}>
          📬 Inbox
        </button>
        <button className={`${styles.tab} ${tab === 'sent' ? styles.tabActive : ''}`} onClick={() => setTab('sent')}>
          ✉️ Sent
        </button>
      </div>

      <div className={styles.scroll}>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>{tab === 'inbox' ? '📬' : '✉️'}</div>
          <div className={styles.emptyTitle}>No {tab === 'inbox' ? 'letters' : 'sent letters'} yet</div>
          <p className={styles.emptySub}>
            {tab === 'inbox'
              ? 'When strangers write to you, their letters will appear here.'
              : 'Tap a mood dot on the map and write to a stranger.'}
          </p>
        </div>
      </div>
    </div>
  )
}
