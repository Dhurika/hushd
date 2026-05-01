import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MOOD_COLORS } from '../data/moods'
import styles from './DropMoodScreen.module.css'

const DROP_MOODS = [
  { emoji:'😄', label:'Happy',    mood:'happy',    color:'#FFD600' },
  { emoji:'😔', label:'Sad',      mood:'sad',      color:'#00E5FF' },
  { emoji:'😰', label:'Anxious',  mood:'anxious',  color:'#FF8C42' },
  { emoji:'😌', label:'Peaceful', mood:'peaceful', color:'#C8FF00' },
  { emoji:'🔥', label:'Hyped',    mood:'hyped',    color:'#B388FF' },
  { emoji:'💗', label:'In love',  mood:'love',     color:'#FF6EC7' },
]

export default function DropMoodScreen() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const userLocation = state?.location
  const [selected, setSelected] = useState(null)
  const [caption, setCaption] = useState('')
  const [dropped, setDropped] = useState(false)

  const handleDrop = () => {
    if (!selected) return
    const existing = JSON.parse(localStorage.getItem('hushd_drops') || '[]')
    const newDrop = {
      id: Date.now().toString(),
      lat: userLocation?.lat,
      lng: userLocation?.lng,
      city: userLocation?.city || 'Unknown',
      emoji: selected.emoji,
      mood: selected.mood,
      caption: caption || `feeling ${selected.label.toLowerCase()}`,
      time: 'just now',
      relates: 0,
      letters: 0,
    }
    localStorage.setItem('hushd_drops', JSON.stringify([newDrop, ...existing]))
    setDropped(true)
    setTimeout(() => navigate('/'), 2200)
  }

  if (dropped) return (
    <div className={styles.droppedContainer}>
      <div className={styles.droppedBlob1} />
      <div className={styles.droppedBlob2} />
      <div className={styles.droppedEmoji}>{selected?.emoji}</div>
      <div className={styles.droppedTitle}>Mood dropped! 🌍</div>
      <p className={styles.droppedSub}>Your vibe is now live on the map. Strangers can see it and write to you.</p>
    </div>
  )

  return (
    <div className={styles.container}>
      {/* bg blobs */}
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.blob3} />

      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>✕</button>
        <span className={styles.title}>drop your mood</span>
        <div style={{width:40}} />
      </div>

      <div className={styles.scroll}>
        <p className={styles.sub}>anonymous · no account · just you and the world 🌍</p>

        {/* Selected preview */}
        {selected && (
          <div className={styles.selectedPreview} style={{ borderColor: selected.color + '66', background: selected.color + '11' }}>
            <span className={styles.selectedEmoji}>{selected.emoji}</span>
            <div>
              <div className={styles.selectedLabel} style={{ color: selected.color }}>feeling {selected.label.toLowerCase()}</div>
              <div className={styles.selectedSub}>tap another to change</div>
            </div>
          </div>
        )}

        {/* Mood grid */}
        <div className={styles.grid}>
          {DROP_MOODS.map((m, i) => {
            const isSelected = selected?.emoji === m.emoji
            return (
              <button
                key={i}
                className={`${styles.moodOpt} ${isSelected ? styles.moodOptSelected : ''}`}
                style={isSelected ? {
                  borderColor: m.color,
                  background: m.color + '22',
                  boxShadow: `0 0 20px ${m.color}44`
                } : {}}
                onClick={() => setSelected(m)}
              >
                <span className={styles.moodEmoji}>{m.emoji}</span>
                <span className={`${styles.moodLabel} ${isSelected ? styles.moodLabelSelected : ''}`}
                  style={isSelected ? { color: m.color } : {}}
                >{m.label}</span>
              </button>
            )
          })}
        </div>

        {/* Caption */}
        <div className={styles.captionWrap}>
          <div className={styles.captionLabel}>add a caption <span>(optional)</span></div>
          <textarea
            className={styles.captionInput}
            placeholder="what's going on? be honest — no one knows who you are..."
            value={caption}
            onChange={e => setCaption(e.target.value)}
            maxLength={200}
          />
          <div className={styles.charCount}>{caption.length}/200</div>
        </div>

        {/* Location */}
        <div className={styles.locationCard}>
          <span className={styles.locationIcon}>📍</span>
          <div className={styles.locationInfo}>
            <div className={styles.locationLabel}>dropping from</div>
            <div className={styles.locationValue}>{userLocation?.city || 'your location'}</div>
          </div>
          <span className={styles.locationBadge}>live</span>
        </div>

        {/* Drop button */}
        <button
          className={`${styles.dropBtn} ${!selected ? styles.dropBtnDisabled : ''}`}
          onClick={handleDrop}
          disabled={!selected}
          style={selected ? { boxShadow: `0 8px 32px ${selected.color}55` } : {}}
        >
          {selected ? `drop ${selected.emoji} on the map` : 'pick a mood first'}
        </button>

        <p className={styles.disclaimer}>
          🤫 your post is 100% anonymous and fades after 6 hours
        </p>

        <div style={{height:100}} />
      </div>
    </div>
  )
}
