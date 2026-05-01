import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { MOOD_FILTERS, MOOD_COLORS } from '../data/moods'
import LocationGate from '../components/LocationGate'
import '../index.css'
import styles from './MapScreen.module.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl: '', iconUrl: '', shadowUrl: '' })

const TILE_URL = 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'

function createMoodIcon(dot) {
  const color = MOOD_COLORS[dot.mood] || '#FF6EC7'
  const html = `
    <div class="mood-marker-wrap">
      <div class="mood-ring" style="color:${color};border-color:${color}"></div>
      <div class="mood-dot" style="
        background: radial-gradient(circle at 35% 35%, ${color}, ${color}99);
        box-shadow: 0 0 0 3px #fff, 0 0 20px 4px ${color}88, 0 4px 16px rgba(0,0,0,0.3);
        font-size: 20px;
      ">${dot.emoji}</div>
    </div>`
  return L.divIcon({ className: '', html, iconSize: [42, 42], iconAnchor: [21, 21] })
}

function UserDot({ location }) {
  const icon = L.divIcon({
    className: '',
    html: `<div style="width:18px;height:18px;border-radius:50%;background:#FF6EC7;box-shadow:0 0 0 4px rgba(255,110,199,0.3),0 0 20px 6px rgba(255,110,199,0.4);"></div>`,
    iconSize: [18, 18], iconAnchor: [9, 9]
  })
  return <Marker position={[location.lat, location.lng]} icon={icon} />
}

function ZoomControls() {
  const map = useMap()
  return (
    <div className={styles.zoomControls}>
      <button className={styles.zoomBtn} onClick={() => map.zoomIn()}>+</button>
      <button className={styles.zoomBtn} onClick={() => map.zoomOut()}>−</button>
    </div>
  )
}

function FlyToUser({ location }) {
  const map = useMap()
  useEffect(() => {
    if (location) map.flyTo([location.lat, location.lng], 8, { duration: 2 })
  }, [location])
  return null
}

const DROP_MOODS = [
  { emoji: '😄', mood: 'happy',    color: '#FFD600' },
  { emoji: '😔', mood: 'sad',      color: '#00E5FF' },
  { emoji: '😰', mood: 'anxious',  color: '#FF8C42' },
  { emoji: '😌', mood: 'peaceful', color: '#C8FF00' },
  { emoji: '🔥', mood: 'hyped',    color: '#B388FF' },
  { emoji: '💗', mood: 'love',     color: '#FF6EC7' },
]

export default function MapScreen() {
  const navigate = useNavigate()
  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem('hushd_location')
    return saved ? JSON.parse(saved) : null
  })
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [sheetTab, setSheetTab] = useState('vibes')
  const [replyText, setReplyText] = useState('')
  const [drops, setDrops] = useState(() => JSON.parse(localStorage.getItem('hushd_drops') || '[]'))
  const [threads, setThreads] = useState({})
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [reactionsOpen, setReactionsOpen] = useState(false)
  const [pickedMood, setPickedMood] = useState(null)
  const [caption, setCaption] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [showRocket, setShowRocket] = useState(false)
  const [rocketPath, setRocketPath] = useState({ start: { x: 0, y: 0 }, end: { x: 0, y: 0 } })
  const [pageFlipped, setPageFlipped] = useState(false)
  const searchRef = useRef(null)
  const filterRef = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    const reload = () => setDrops(JSON.parse(localStorage.getItem('hushd_drops') || '[]'))
    reload()
    window.addEventListener('focus', reload)
    return () => window.removeEventListener('focus', reload)
  }, [])

  useEffect(() => {
    if (search.length < 2) { setSuggestions([]); return }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search)}&format=json&limit=5&featuretype=city`)
        const data = await res.json()
        setSuggestions(data.map(d => ({ name: d.display_name.split(',').slice(0, 2).join(','), lat: d.lat, lng: d.lon })))
      } catch { setSuggestions([]) }
    }, 350)
    return () => clearTimeout(t)
  }, [search])

  const handleLocation = (loc) => {
    localStorage.setItem('hushd_location', JSON.stringify(loc))
    setLocation(loc)
  }

  const handleDrop = () => {
    if (!pickedMood) return
    
    // Calculate rocket animation path
    const btnRect = document.querySelector(`.${styles.dropBtn}`)?.getBoundingClientRect()
    const mapContainer = document.querySelector('.leaflet-container')
    const mapRect = mapContainer?.getBoundingClientRect()
    
    if (btnRect && mapRect) {
      // Calculate approximate position on map for user location
      const targetX = mapRect.left + (mapRect.width * 0.4)
      const targetY = mapRect.top + (mapRect.height * 0.5)
      
      setRocketPath({
        start: { x: btnRect.left + btnRect.width / 2, y: btnRect.top },
        end: { x: targetX, y: targetY }
      })
      setShowRocket(true)
      
      setTimeout(() => setShowRocket(false), 1500)
    }
    
    const existing = JSON.parse(localStorage.getItem('hushd_drops') || '[]')
    const newDrop = {
      id: Date.now().toString(),
      lat: location.lat, lng: location.lng,
      city: location.city,
      emoji: pickedMood.emoji, mood: pickedMood.mood,
      caption: caption.trim() || `feeling ${pickedMood.mood}`,
      time: 'just now', relates: 0, letters: 0,
    }
    localStorage.setItem('hushd_drops', JSON.stringify([newDrop, ...existing]))
    setDrops([newDrop, ...existing])
    
    setPickedMood(null)
    setCaption('')
    setPageFlipped(false)
  }

  if (!location) return <LocationGate onLocation={handleLocation} />

  const filtered = drops.filter(m => filter === 'all' || m.mood === filter)
  const thread = selected ? (threads[selected.id] || []) : []

  const handleMarkerClick = useCallback((dot) => {
    setSelected(dot); setSheetTab('vibes'); setReplyText('')
  }, [])

  const handleSendReply = () => {
    if (!replyText.trim() || !selected) return
    const msg = { id: Date.now().toString(), text: replyText, time: 'just now', emoji: '💬' }
    setThreads(prev => ({ ...prev, [selected.id]: [msg, ...(prev[selected.id] || [])] }))
    setReplyText('')
  }

  return (
    <div className={styles.container}>

      {/* MAP */}
      <MapContainer
        ref={mapRef}
        center={[20, 10]} zoom={3} minZoom={2} maxZoom={16}
        style={{ position: 'absolute', inset: 0, zIndex: 1 }}
        zoomControl={false} attributionControl={false}
      >
        <TileLayer url={TILE_URL} />
        <ZoomControls />
        <FlyToUser location={location} />
        <UserDot location={location} />
        {filtered.map(dot => (
          <Marker key={dot.id} position={[dot.lat, dot.lng]}
            icon={createMoodIcon(dot)}
            eventHandlers={{ click: () => handleMarkerClick(dot) }}
          />
        ))}
      </MapContainer>

      {/* SIDEBAR */}
      <div className={styles.sidebar}>
        {/* Floating doodles */}
        <div className={`${styles.sidebarDoodle} ${styles.doodle1}`}>✨</div>
        <div className={`${styles.sidebarDoodle} ${styles.doodle2}`}>💌</div>
        <div className={`${styles.sidebarDoodle} ${styles.doodle3}`}>❤️</div>

        <img src="/logo-version1-removebg-preview.png" className={styles.logo} alt="hushd" />

        {/* MAIN: tell the world - Notebook style */}
        <div className={styles.tellCard}>
          <div className={`${styles.pageContainer} ${pageFlipped ? styles.flipped : ''}`}>
            {/* FRONT PAGE */}
            <div className={styles.pageFront}>
              <div className={styles.tellTitle}>📝 what's on your mind?</div>
              <div className={styles.tellSub}>pick a vibe · drop it on the map</div>
              
              <div className={styles.moodRow}>
                {DROP_MOODS.map(m => (
                  <button key={m.mood}
                    className={`${styles.moodChip} ${pickedMood?.mood === m.mood ? styles.moodChipActive : ''}`}
                    style={{ background: m.color, boxShadow: pickedMood?.mood === m.mood ? `0 0 0 3px #1a1a2e, 0 0 0 5px ${m.color}` : '2px 2px 0 #1a1a2e' }}
                    onClick={() => setPickedMood(pickedMood?.mood === m.mood ? null : m)}
                  >{m.emoji}</button>
                ))}
              </div>
              
              {pickedMood && (
                <>
                  <button className={styles.flipBtn} onClick={() => setPageFlipped(true)}>
                    →
                  </button>
                  <button className={styles.dropBtn} onClick={handleDrop}>
                    🚀 drop now
                  </button>
                </>
              )}
            </div>
            
            {/* BACK PAGE */}
            <div className={styles.pageBack}>
              <div className={styles.backPageTitle}>✏️ write something...</div>
              <div className={styles.backPageSub}>optional · share your thoughts anonymously</div>
              
              <textarea
                className={styles.captionInput}
                placeholder="what's really on your mind?"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                maxLength={120}
                rows={5}
              />
              
              <button className={styles.flipBtn} onClick={() => setPageFlipped(false)}>
                ←
              </button>
              
              {pickedMood && (
                <button className={styles.dropBtnBack} onClick={handleDrop}>
                  🚀 drop with note
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className={styles.myLocPill}>
          <span>📍</span>
          <span>{location.city}</span>
          <button className={styles.myLocChange} onClick={() => { localStorage.removeItem('hushd_location'); setLocation(null) }}>change</button>
        </div>
      </div>

      {/* PAPER ROCKET ANIMATION */}
      {showRocket && (
        <>
          {/* Dotted trail */}
          <svg className={styles.rocketTrail} style={{ 
            left: 0, 
            top: 0, 
            width: '100%', 
            height: '100%',
            position: 'fixed'
          }}>
            <path d={`M ${rocketPath.start.x} ${rocketPath.start.y} Q ${(rocketPath.start.x + rocketPath.end.x) / 2} ${rocketPath.start.y - 100} ${rocketPath.end.x} ${rocketPath.end.y}`} />
          </svg>
          
          {/* Rocket */}
          <div 
            className={styles.paperRocket} 
            style={{ 
              left: rocketPath.start.x, 
              top: rocketPath.start.y,
              '--tx': `${rocketPath.end.x - rocketPath.start.x}px`,
              '--ty': `${rocketPath.end.y - rocketPath.start.y}px`,
              animation: 'flyRocket 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
            }}
          >
            🚀
          </div>
        </>
      )}

      {/* WAVY EDGE - Yellow hand-drawn style */}
      <svg className={styles.wavyEdge} viewBox="0 0 120 1000" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 0 0 Q 30 50 20 100 Q 10 150 35 200 Q 50 250 25 300 Q 5 350 40 400 Q 60 450 30 500 Q 10 550 45 600 Q 65 650 35 700 Q 15 750 40 800 Q 55 850 30 900 Q 10 950 25 1000 L 0 1000 Z" 
          fill="#FF6EC7" />
        <path d="M 0 0 Q 30 50 20 100 Q 10 150 35 200 Q 50 250 25 300 Q 5 350 40 400 Q 60 450 30 500 Q 10 550 45 600 Q 65 650 35 700 Q 15 750 40 800 Q 55 850 30 900 Q 10 950 25 1000" 
          stroke="#FFE500" strokeWidth="6" fill="none" strokeLinecap="round" />
      </svg>

      {/* Yellow connecting lines in sidebar */}
      <svg className={styles.yellowLines} viewBox="0 0 350 1000" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 10 300 Q 150 350 280 320 Q 200 380 300 420" 
          stroke="#FFE500" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M 20 500 Q 180 480 290 520" 
          stroke="#FFE500" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M 280 150 Q 200 180 100 160 Q 50 200 10 180" 
          stroke="#FFE500" strokeWidth="4" fill="none" strokeLinecap="round" />
      </svg>

      {/* TOP RIGHT SEARCH */}
      <div className={styles.topRightSearch} ref={searchRef}>
        <span className={styles.searchIcon}>🔍</span>
        <input className={styles.searchTop} placeholder="search city..."
          value={search} onChange={e => setSearch(e.target.value)} />
        {suggestions.length > 0 && (
          <div className={styles.suggestionsTop}>
            {suggestions.map((s, i) => (
              <div key={i} className={styles.suggestion}
                onClick={() => { setSearch(s.name); setSuggestions([]) }}>
                📍 {s.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FILTER DROPDOWN */}
      <div className={styles.filterDropdown} ref={filterRef}>
        <button className={styles.filterBtn} onClick={() => setFilterOpen(!filterOpen)}>
          🌍
        </button>
        {filterOpen && (
          <div className={styles.filterMenu}>
            <div className={styles.filterMenuTitle}>Filter Moods</div>
            {MOOD_FILTERS.map(f => (
              <button key={f.key}
                className={`${styles.filterMenuItem} ${filter === f.key ? styles.filterMenuItemActive : ''}`}
                onClick={() => { setFilter(f.key); setFilterOpen(false); }}
              >
                <span className={styles.filterMenuEmoji}>{f.emoji}</span>
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT SIDE ICONS */}
      <div className={styles.rightIcons}>
        <button className={styles.iconBtn} onClick={() => navigate('/letters')}>
          💌
        </button>
        <button className={styles.iconBtn}>
          📝
        </button>
        <button className={styles.iconBtn}>
          🌍
        </button>
        <button className={styles.iconBtn}>
          👤
        </button>
      </div>

      {/* RIGHT NAV - Hidden, using rightIcons instead */}
      <div className={styles.navTabs} style={{display:'none'}}>
        <button className={styles.navTab} onClick={() => navigate('/letters')}>💌<span>Letters</span></button>
        {[
          { path:'/',         icon:'🗺️', label:'Map'      },
          { path:'/discover', icon:'🌍', label:'Discover' },
          { path:'/profile',  icon:'👤', label:'Me'       },
        ].map(t => (
          <button key={t.path} className={styles.navTab} onClick={() => navigate(t.path)}>
            <span>{t.icon}</span><span>{t.label}</span>
          </button>
        ))}
      </div>


<div className={styles.exploreBadge}>EXPLORE.<br />CONNECT.<br />EXPRESS.</div>

      {/* SHEET */}
      {selected && (
        <>
          <div className={styles.overlay} onClick={() => setSelected(null)} />
          <div className={styles.sheet}>
            <div className={styles.sheetHandle} />
            <div className={styles.sheetHeader}>
              <span className={styles.sheetEmoji}>{selected.emoji}</span>
              <div className={styles.sheetMeta}>
                <div className={styles.sheetCity}>📍 {selected.city}</div>
                <div className={styles.sheetCaption}>{selected.caption}</div>
                <div className={styles.sheetTime}>{selected.time}</div>
                <span className={styles.moodTag} style={{ background: MOOD_COLORS[selected.mood] }}>{selected.mood}</span>
              </div>
              <button className={styles.sheetClose} onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className={styles.sheetTabs}>
              {[{ key: 'vibes', label: '🤝 Vibes' }, { key: 'thread', label: `💬 Thread${thread.length > 0 ? ` (${thread.length})` : ''}` }, { key: 'letter', label: '💌 Letter' }]
                .map(t => <button key={t.key} className={`${styles.sheetTab} ${sheetTab === t.key ? styles.sheetTabActive : ''}`} onClick={() => setSheetTab(t.key)}>{t.label}</button>)}
            </div>
            {sheetTab === 'vibes' && (
              <div className={styles.sheetBody}>
                <button className={styles.reactionsToggle} onClick={() => setReactionsOpen(o => !o)}>🤝 React {reactionsOpen ? '▲' : '▼'}</button>
                {reactionsOpen && (
                  <div className={styles.reactions}>
                    {['💙 felt this', '🤝 same here', '🌸 sending love', '🫂 hugs', '🔥 same energy', '✨ thinking of you'].map(r => (
                      <button key={r} className={styles.reactionChip} onClick={() => setReactionsOpen(false)}>{r}</button>
                    ))}
                  </div>
                )}
                <div className={styles.stats}>
                  <span>🤝 {selected.relates} relates</span>
                  <span>💌 {selected.letters} letters</span>
                  <span>💬 {thread.length} replies</span>
                </div>
                <button className={styles.primaryBtn} onClick={() => navigate('/write', { state: { dot: selected } })}>💌 Send anonymous letter</button>
              </div>
            )}
            {sheetTab === 'thread' && (
              <div className={styles.sheetBody}>
                <div className={styles.threadList}>
                  {thread.length === 0
                    ? <div className={styles.emptyThread}><div style={{ fontSize: 32, marginBottom: 8 }}>💬</div><div>No replies yet. Be the first.</div></div>
                    : thread.map(msg => (
                      <div key={msg.id} className={styles.threadMsg}>
                        <span className={styles.threadEmoji}>{msg.emoji}</span>
                        <div><div className={styles.threadText}>{msg.text}</div><div className={styles.threadTime}>{msg.time} · anonymous</div></div>
                      </div>
                    ))}
                </div>
                <div className={styles.replyBox}>
                  <input className={styles.replyInput} placeholder="reply anonymously..."
                    value={replyText} onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendReply()} />
                  <button className={styles.replySubmit} onClick={handleSendReply}>↑</button>
                </div>
              </div>
            )}
            {sheetTab === 'letter' && (
              <div className={styles.sheetBody}>
                <p className={styles.letterPrompt}>Send a private anonymous letter. Only they'll see it.</p>
                <button className={styles.primaryBtn} onClick={() => navigate('/write', { state: { dot: selected } })}>💌 Write them a letter</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
