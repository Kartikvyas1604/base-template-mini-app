export type ConnectionMethod = 'bluetooth' | 'nfc' | 'qr'

export interface PeerConnection {
  id: string
  method: ConnectionMethod
  timestamp: number
  address?: string
}

export interface Message {
  type: 'emoji' | 'connect' | 'disconnect'
  from: string
  to?: string
  data: unknown
  timestamp: number
}

class PeerConnectionManager {
  private connections: Map<string, PeerConnection> = new Map()
  private messageCallbacks: Map<string, (msg: Message) => void> = new Map()
  private sessionId: string | null = null

  generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  createSession(method: ConnectionMethod, address?: string): PeerConnection {
    this.sessionId = this.generateSessionId()
    const connection: PeerConnection = {
      id: this.sessionId,
      method,
      timestamp: Date.now(),
      address
    }
    this.connections.set(this.sessionId, connection)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(`tapmint-session-${this.sessionId}`, JSON.stringify(connection))
    }
    
    return connection
  }

  getSession(sessionId: string): PeerConnection | null {
    if (this.connections.has(sessionId)) {
      return this.connections.get(sessionId)!
    }
    
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`tapmint-session-${sessionId}`)
      if (stored) {
        const connection = JSON.parse(stored)
        this.connections.set(sessionId, connection)
        return connection
      }
    }
    
    return null
  }

  sendMessage(sessionId: string, message: Message): boolean {
    if (typeof window !== 'undefined') {
      const key = `tapmint-message-${sessionId}-${Date.now()}`
      localStorage.setItem(key, JSON.stringify(message))
      
      window.dispatchEvent(new CustomEvent('tapmint-message', {
        detail: { sessionId, message }
      }))
      
      return true
    }
    return false
  }

  onMessage(sessionId: string, callback: (msg: Message) => void) {
    this.messageCallbacks.set(sessionId, callback)
    
    if (typeof window !== 'undefined') {
      const handler = (event: Event) => {
        const customEvent = event as CustomEvent
        if (customEvent.detail.sessionId === sessionId) {
          callback(customEvent.detail.message)
        }
      }
      
      window.addEventListener('tapmint-message', handler)
      
      const checkStorage = setInterval(() => {
        const keys = Object.keys(localStorage).filter(k => 
          k.startsWith(`tapmint-message-${sessionId}`)
        )
        
        keys.forEach(key => {
          try {
            const msg = JSON.parse(localStorage.getItem(key) || '')
            const msgAge = Date.now() - msg.timestamp
            
            if (msgAge < 5000) {
              callback(msg)
            }
            
            if (msgAge > 10000) {
              localStorage.removeItem(key)
            }
          } catch {
            localStorage.removeItem(key)
          }
        })
      }, 500)
      
      return () => {
        window.removeEventListener('tapmint-message', handler)
        clearInterval(checkStorage)
      }
    }
    
    return () => {}
  }

  disconnect(sessionId: string) {
    this.connections.delete(sessionId)
    this.messageCallbacks.delete(sessionId)
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`tapmint-session-${sessionId}`)
      
      Object.keys(localStorage)
        .filter(k => k.startsWith(`tapmint-message-${sessionId}`))
        .forEach(k => localStorage.removeItem(k))
    }
  }

  cleanupOldSessions() {
    if (typeof window !== 'undefined') {
      const now = Date.now()
      const maxAge = 30 * 60 * 1000
      
      Object.keys(localStorage)
        .filter(k => k.startsWith('tapmint-session-'))
        .forEach(key => {
          try {
            const session = JSON.parse(localStorage.getItem(key) || '')
            if (now - session.timestamp > maxAge) {
              const sessionId = key.replace('tapmint-session-', '')
              this.disconnect(sessionId)
            }
          } catch {
            localStorage.removeItem(key)
          }
        })
    }
  }
}

export const peerManager = new PeerConnectionManager()

if (typeof window !== 'undefined') {
  peerManager.cleanupOldSessions()
  setInterval(() => peerManager.cleanupOldSessions(), 5 * 60 * 1000)
}
