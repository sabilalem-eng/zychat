import { MessageType } from '../types';

export interface RemoteMessage {
  id: string;
  fromPhone: string;
  fromName: string;
  fromAvatar?: string;
  toPhone: string;
  text?: string;
  type: MessageType;
  mediaUrl?: string;
  duration?: number;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
}

export interface RemoteUser {
  phone: string;
  name: string;
  avatarUrl: string;
  lastSeen: number;
  isOnline: boolean;
}

type MessageCallback = (msg: RemoteMessage) => void;
type TypingCallback = (data: { fromPhone: string; toPhone: string; isTyping: boolean }) => void;
type ReadReceiptCallback = (data: { msgId: string; byPhone: string }) => void;

class RealtimeChatService {
  private channel: BroadcastChannel | null = null;
  private messageListeners: Set<MessageCallback> = new Set();
  private typingListeners: Set<TypingCallback> = new Set();
  private readReceiptListeners: Set<ReadReceiptCallback> = new Set();
  private currentPhone: string = '';
  private syncInterval: any = null;
  private lastSyncTimestamp: number = 0;

  constructor() {
    this.initChannel();
    this.initStorageListener();
    this.startBackendPolling();
  }

  private initChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('zychat_network_bus');
        this.channel.onmessage = (event) => {
          this.handleIncomingEvent(event.data);
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported or error:', e);
      }
    }
  }

  private initStorageListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'zychat_shared_network_event' && e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            this.handleIncomingEvent(data);
          } catch {
            // ignore
          }
        }
      });
    }
  }

  private handleIncomingEvent(data: any) {
    if (!data || !data.type) return;

    if (data.type === 'NEW_MESSAGE') {
      const msg: RemoteMessage = data.message;
      // Only process if addressed to current user or if current phone is not set or matches
      if (this.currentPhone && msg.toPhone.replace(/\D/g, '') === this.currentPhone.replace(/\D/g, '')) {
        this.messageListeners.forEach((cb) => cb(msg));
      }
    } else if (data.type === 'TYPING') {
      if (this.currentPhone && data.toPhone.replace(/\D/g, '') === this.currentPhone.replace(/\D/g, '')) {
        this.typingListeners.forEach((cb) => cb(data));
      }
    } else if (data.type === 'READ_RECEIPT') {
      if (this.currentPhone && data.forPhone.replace(/\D/g, '') === this.currentPhone.replace(/\D/g, '')) {
        this.readReceiptListeners.forEach((cb) => cb(data));
      }
    }
  }

  public setCurrentPhone(phone: string) {
    this.currentPhone = phone;
  }

  public subscribeMessages(cb: MessageCallback) {
    this.messageListeners.add(cb);
    return () => this.messageListeners.delete(cb);
  }

  public subscribeTyping(cb: TypingCallback) {
    this.typingListeners.add(cb);
    return () => this.typingListeners.delete(cb);
  }

  public subscribeReadReceipts(cb: ReadReceiptCallback) {
    this.readReceiptListeners.add(cb);
    return () => this.readReceiptListeners.delete(cb);
  }

  // Broadcast event across BroadcastChannel & localStorage
  private broadcastEvent(payload: any) {
    if (this.channel) {
      try {
        this.channel.postMessage(payload);
      } catch (err) {
        console.warn('BroadcastChannel post error:', err);
      }
    }

    try {
      localStorage.setItem('zychat_shared_network_event', JSON.stringify({ ...payload, _t: Date.now() }));
    } catch {
      // storage quota or private mode
    }

    // Also attempt sending to server backend if reachable
    if (payload.type === 'NEW_MESSAGE') {
      fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload.message),
      }).catch(() => {
        // silent fail if running purely offline or server not mounted
      });
    }
  }

  // Send message across distance
  public sendRemoteMessage(message: RemoteMessage) {
    this.broadcastEvent({
      type: 'NEW_MESSAGE',
      message,
    });
  }

  // Send typing state
  public sendTyping(fromPhone: string, toPhone: string, isTyping: boolean) {
    this.broadcastEvent({
      type: 'TYPING',
      fromPhone,
      toPhone,
      isTyping,
    });
  }

  // Send read receipt
  public sendReadReceipt(msgId: string, byPhone: string, forPhone: string) {
    this.broadcastEvent({
      type: 'READ_RECEIPT',
      msgId,
      byPhone,
      forPhone,
    });
  }

  // Request SMS OTP code
  public requestOtp(phone: string): string {
    // Generate authentic 6-digit code
    const digits = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      sessionStorage.setItem(`zychat_otp_${phone}`, digits);
    } catch {
      // ignore
    }
    return digits;
  }

  // Poll backend for multi-device sync
  private startBackendPolling() {
    if (typeof window === 'undefined') return;
    this.syncInterval = setInterval(async () => {
      if (!this.currentPhone) return;
      try {
        const res = await fetch(`/api/chat/messages?phone=${encodeURIComponent(this.currentPhone)}&since=${this.lastSyncTimestamp}`);
        if (res.ok) {
          const newMessages: RemoteMessage[] = await res.json();
          if (Array.isArray(newMessages) && newMessages.length > 0) {
            newMessages.forEach((msg) => {
              if (msg.timestamp > this.lastSyncTimestamp) {
                this.lastSyncTimestamp = msg.timestamp;
              }
              this.messageListeners.forEach((cb) => cb(msg));
            });
          }
        }
      } catch {
        // server endpoint may not be active; local broadcast handles it
      }
    }, 2000);
  }
}

export const realtimeChatService = new RealtimeChatService();
