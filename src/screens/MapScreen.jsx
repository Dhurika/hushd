import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import { supabase, ensureAuth } from '../supabase'
import { trackPresence } from '../utils/presence'
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
  const [replyText, setReplyText] = useState('')
  const [drops, setDrops] = useState([])
  const [onlineCount, setOnlineCount] = useState(0)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [threads, setThreads] = useState({})
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [pickedMood, setPickedMood] = useState(null)
  const [caption, setCaption] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [showRocket, setShowRocket] = useState(false)
  const [rocketPath, setRocketPath] = useState({ start: { x: 0, y: 0 }, end: { x: 0, y: 0 } })
  const [pageFlipped, setPageFlipped] = useState(false)
  const searchRef = useRef(null)
  const filterRef = useRef(null)
  const mapRef = useRef(null)

  // Track online users
  useEffect(() => {
    console.log('👥 Setting up presence tracking...')
    ensureAuth().then((user) => {
      console.log('✅ User ready for presence:', user.id)
      setCurrentUserId(user.id)
      
      // Set initial count to 1 (current user)
      setOnlineCount(1)
      
      const unsubscribe = trackPresence(user.id, (count) => {
        console.log('👥 Online users updated:', count)
        setOnlineCount(count > 0 ? count : 1)
      })
      return unsubscribe
    }).catch(err => {
      console.error('❌ Presence setup error:', err)
      setOnlineCount(1) // Fallback to 1
    })
  }, [])

  // Real-time Supabase listener
  useEffect(() => {
    console.log('🔄 Setting up Supabase listener...')
    ensureAuth().then(async () => {
      console.log('✅ Auth ready, fetching moods...')
      
      // Clean up expired moods
      const { error: deleteError } = await supabase
        .from('moods')
        .delete()
        .lt('expires_at', new Date().toISOString())
      
      if (deleteError) {
        console.warn('⚠️ Cleanup error (non-critical):', deleteError)
      }
      
      // Fetch active moods
      const fetchMoods = async () => {
        console.log('📥 Fetching moods from Supabase...')
        const { data, error } = await supabase
          .from('moods')
          .select('*')
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('❌ Supabase fetch error:', error)
          return
        }
        
        console.log('✅ Fetched moods:', data.length, 'moods')
        
        const moods = data.map(mood => {
          const createdAt = new Date(mood.created_at)
          const now = new Date()
          const diffMs = now - createdAt
          const diffMins = Math.floor(diffMs / 60000)
          
          let timeStr = 'just now'
          if (diffMins < 1) timeStr = 'just now'
          else if (diffMins < 60) timeStr = `${diffMins}m ago`
          else if (diffMins < 1440) timeStr = `${Math.floor(diffMins / 60)}h ago`
          else timeStr = `${Math.floor(diffMins / 1440)}d ago`
          
          // Add small random offset to prevent exact overlap (0.005 degrees ≈ 500m)
          const offsetLat = (Math.random() - 0.5) * 0.005
          const offsetLng = (Math.random() - 0.5) * 0.005
          
          return {
            id: mood.id,
            user_id: mood.user_id,
            lat: mood.lat + offsetLat,
            lng: mood.lng + offsetLng,
            city: mood.city,
            emoji: mood.emoji,
            mood: mood.mood,
            caption: mood.caption,
            relates: mood.relates,
            letters: mood.letters,
            time: timeStr
          }
        })
        
        console.log('🗺️ Setting moods on map:', moods)
        setDrops(moods)
      }
      
      fetchMoods()
      
      // Real-time subscription
      console.log('🔔 Setting up real-time subscription...')
      const channel = supabase
        .channel('moods-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'moods' },
          (payload) => {
            console.log('🔔 Real-time update received:', payload)
            fetchMoods()
          }
        )
        .subscribe((status) => {
          console.log('📡 Subscription status:', status)
        })
      
      return () => {
        console.log('🔌 Cleaning up subscription...')
        supabase.removeChannel(channel)
      }
    }).catch(err => {
      console.error('❌ Setup error:', err)
    })
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

  const handleDrop = async () => {
    if (!pickedMood) return
    
    // Calculate rocket animation path
    const btnRect = document.querySelector(`.${styles.dropBtn}`)?.getBoundingClientRect()
    const mapContainer = document.querySelector('.leaflet-container')
    const mapRect = mapContainer?.getBoundingClientRect()
    
    if (btnRect && mapRect) {
      const targetX = mapRect.left + (mapRect.width * 0.4)
      const targetY = mapRect.top + (mapRect.height * 0.5)
      
      setRocketPath({
        start: { x: btnRect.left + btnRect.width / 2, y: btnRect.top },
        end: { x: targetX, y: targetY }
      })
      setShowRocket(true)
      setTimeout(() => setShowRocket(false), 1500)
    }
    
    try {
      console.log('🔄 Starting mood drop from map...')
      const user = await ensureAuth()
      console.log('✅ User authenticated:', user.id)
      
      const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
      
      const moodData = {
        user_id: user.id,
        lat: location.lat,
        lng: location.lng,
        city: location.city,
        emoji: pickedMood.emoji,
        mood: pickedMood.mood,
        caption: caption.trim() || `feeling ${pickedMood.mood}`,
        expires_at: expiresAt,
        relates: 0,
        letters: 0,
      }
      
      console.log('📤 Sending mood data:', moodData)
      
      const { data, error } = await supabase
        .from('moods')
        .insert(moodData)
        .select()
      
      if (error) {
        console.error('❌ Supabase error:', error)
        throw error
      }
      
      console.log('✅ Mood dropped successfully!', data)
      setPickedMood(null)
      setCaption('')
      setPageFlipped(false)
    } catch (error) {
      console.error('❌ Error dropping mood:', error)
      alert(`Failed to drop mood:\n\n${error.message}\n\nCheck console for details.`)
    }
  }

  if (!location) return <LocationGate onLocation={handleLocation} />

  const filtered = drops.filter(m => filter === 'all' || m.mood === filter)
  const thread = selected ? (threads[selected.id] || []) : []

  const handleMarkerClick = useCallback(async (dot) => {
    setSelected(dot)
    setReplyText('')
    
    // Fetch replies for this mood
    try {
      const { data, error } = await supabase
        .from('replies')
        .select('*')
        .eq('mood_id', dot.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      const replies = data.map(reply => {
        const createdAt = new Date(reply.created_at)
        const now = new Date()
        const diffMins = Math.floor((now - createdAt) / 60000)
        
        let timeStr = 'just now'
        if (diffMins < 1) timeStr = 'just now'
        else if (diffMins < 60) timeStr = `${diffMins}m ago`
        else if (diffMins < 1440) timeStr = `${Math.floor(diffMins / 60)}h ago`
        else timeStr = `${Math.floor(diffMins / 1440)}d ago`
        
        return {
          id: reply.id,
          text: reply.text,
          time: timeStr,
          emoji: '💬'
        }
      })
      
      setThreads(prev => ({ ...prev, [dot.id]: replies }))
    } catch (error) {
      console.error('Fetch replies error:', error)
    }
  }, [])

  const handleSendReply = async () => {
    if (!replyText.trim() || !selected) return
    
    try {
      const user = await ensureAuth()
      
      const { error } = await supabase
        .from('replies')
        .insert({
          mood_id: selected.id,
          user_id: user.id,
          text: replyText.trim()
        })
      
      if (error) throw error
      
      // Add to local state for instant feedback
      const msg = { id: Date.now().toString(), text: replyText, time: 'just now', emoji: '💬' }
      setThreads(prev => ({ ...prev, [selected.id]: [msg, ...(prev[selected.id] || [])] }))
      setReplyText('')
    } catch (error) {
      console.error('Reply error:', error)
      alert('Failed to send reply')
    }
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

      {/* LIVE USER COUNT */}
      <div className={styles.liveCount}>
        <span className={styles.liveCountDot}></span>
        <span className={styles.liveCountText}>{onlineCount} online</span>
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
        <button className={styles.iconBtn} onClick={() => { navigate('/letters'); setUnreadCount(0); }}>
          💌
          {unreadCount > 0 && (
            <span className={styles.notificationBadge}>{unreadCount}</span>
          )}
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

      {/* TOOLTIP */}
      {selected && (
        <>
          <div className={styles.overlay} onClick={() => setSelected(null)} />
          <div className={styles.ownMoodTooltip}>
            <button className={styles.tooltipClose} onClick={() => setSelected(null)}>✕</button>
            <div className={styles.tooltipEmoji}>{selected.emoji}</div>
            <div className={styles.tooltipMessage}>"{selected.caption}"</div>
            
            {selected.user_id === currentUserId && (
              <button className={styles.tooltipLetterIcon} onClick={() => navigate('/letters')}>
                💌
                {unreadCount > 0 && (
                  <span className={styles.tooltipLetterBadge}>{unreadCount}</span>
                )}
              </button>
            )}
            
            {thread.length > 0 && (
              <div className={styles.tooltipThreads}>
                <div className={styles.tooltipThreadTitle}>💬 {thread.length} {thread.length === 1 ? 'reply' : 'replies'}</div>
                <div className={styles.tooltipThreadList}>
                  {thread.map(msg => (
                    <div key={msg.id} className={styles.tooltipThreadItem}>
                      <div className={styles.tooltipThreadText}>{msg.text}</div>
                      <div className={styles.tooltipThreadTime}>{msg.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {selected.user_id !== currentUserId && (
              <div className={styles.tooltipActions}>
                <input
                  className={styles.tooltipReplyInput}
                  placeholder="Reply anonymously..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                />
                <button className={styles.tooltipActionBtn} onClick={handleSendReply}>
                  💬 Reply
                </button>
                <button className={styles.tooltipActionBtn} onClick={() => navigate('/write', { state: { dot: selected } })}>
                  💌 Letter
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
