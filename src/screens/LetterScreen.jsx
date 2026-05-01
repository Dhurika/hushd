import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import styles from './LetterScreen.module.css'

export default function LetterScreen() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const dot = state?.dot
  const [letter, setLetter] = useState('')
  const [sent, setSent] = useState(false)

  if (sent) return (
    <div className={styles.sentContainer}>
      <div className={styles.sentIcon}>💌</div>
      <div className={styles.sentTitle}>Letter sent!</div>
      <p className={styles.sentSub}>Your words are on their way to a stranger who needed to hear something today. They might just write back.</p>
      <button className={styles.backBtn} onClick={() => navigate('/')}>Back to map 🗺️</button>
    </div>
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.closeBtn} onClick={() => navigate(-1)}>←</button>
        <span className={styles.title}>Anonymous Letter 💌</span>
        <div style={{width:40}} />
      </div>

      <div className={styles.scroll}>
        <div className={styles.toPill}>
          ✉️ to <strong>stranger in {dot?.city?.split(',')[0] || 'the world'}</strong>
        </div>

        {dot && (
          <div className={styles.originalPost}>
            <div className={styles.originalLabel}>replying to</div>
            <span className={styles.originalEmoji}>{dot.emoji}</span>
            <p className={styles.originalCaption}>{dot.caption}</p>
          </div>
        )}

        <textarea
          className={styles.letterInput}
          placeholder="Write something honest. They'll never know who you are."
          value={letter}
          onChange={e => setLetter(e.target.value)}
          maxLength={500}
          autoFocus
        />
        <div className={styles.charCount}>{letter.length}/500</div>

        <p className={styles.anon}>🤫 100% anonymous — they'll never know it's you</p>

        <button
          className={styles.sendBtn}
          disabled={!letter.trim()}
          onClick={() => setSent(true)}
        >
          Send anonymously 🤫
        </button>
      </div>
    </div>
  )
}
