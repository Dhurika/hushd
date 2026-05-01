import React, { useState } from 'react'
import styles from './LocationGate.module.css'

export default function LocationGate({ onLocation }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const requestLocation = () => {
    setLoading(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          )
          const data = await res.json()
          const city = data.address?.city || data.address?.town || data.address?.village || 'Your city'
          const country = data.address?.country || ''
          onLocation({ lat: latitude, lng: longitude, city: `${city}, ${country}` })
        } catch {
          onLocation({ lat: latitude, lng: longitude, city: 'Your location' })
        }
        setLoading(false)
      },
      (err) => {
        if (err.code === 1) setError('Location blocked. Click the 🔒 icon in your browser bar and allow location, then try again.')
        else if (err.code === 2) setError('Location unavailable. Check your device location settings.')
        else setError('Location timed out. Please try again.')
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div className={styles.container}>
      {/* BG blobs */}
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.blob3} />

      <div className={styles.card}>
        <div className={styles.logo}>hush<span>d</span></div>
        <div className={styles.globe}>🌍</div>
        <h1 className={styles.title}>Where are you in the world?</h1>
        <p className={styles.sub}>
          Hushd places your mood on a live map so strangers nearby can connect with you.
          We need your location to make this magic happen.
        </p>

        <div className={styles.features}>
          <div className={styles.feature}><span>🤫</span> Always anonymous</div>
          <div className={styles.feature}><span>📍</span> Only your city is shown</div>
          <div className={styles.feature}><span>💌</span> Strangers can write to you</div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button
          className={styles.btn}
          onClick={requestLocation}
          disabled={loading}
        >
          {loading ? (
            <span className={styles.loadingRow}>
              <span className={styles.spinner} /> finding you...
            </span>
          ) : (
            '📍 Share my location'
          )}
        </button>

        <p className={styles.fine}>
          Your exact coordinates are never stored or shared. Only your city name appears on the map.
        </p>
      </div>
    </div>
  )
}
