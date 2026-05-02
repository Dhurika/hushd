import { supabase } from '../supabase'

/**
 * Track online users using Supabase Presence
 * Returns unsubscribe function
 */
export const trackPresence = (userId, onCountChange) => {
  console.log('🔔 Creating presence channel for user:', userId)
  
  const channel = supabase.channel('online-users', {
    config: {
      presence: {
        key: userId,
      },
    },
  })

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      const count = Object.keys(state).length
      console.log('👥 Presence synced. State:', state, 'Count:', count)
      onCountChange(count)
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('✅ User joined:', key, newPresences)
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('❌ User left:', key, leftPresences)
    })
    .subscribe(async (status) => {
      console.log('📡 Presence subscription status:', status)
      if (status === 'SUBSCRIBED') {
        const trackStatus = await channel.track({
          user_id: userId,
          online_at: new Date().toISOString(),
        })
        console.log('📍 Track status:', trackStatus)
      }
    })

  return () => {
    console.log('🔌 Untracking presence...')
    channel.untrack()
    supabase.removeChannel(channel)
  }
}
