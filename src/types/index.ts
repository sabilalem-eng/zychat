export type ChatTheme = 'whatsapp_dark' | 'whatsapp_light' | 'comic' | 'dark' | 'purple' | 'cyber';

export type AvatarRing = 'comic' | 'polos' | 'duo_merah' | 'halftone' | 'speed_line' | 'pow';

export type MessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'view_once_image'
  | 'view_once_video'
  | 'document'
  | 'location';

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text?: string;
  type: MessageType;
  mediaUrl?: string;
  duration?: number; // detik untuk audio / video
  timestamp: number;
  isOutgoing: boolean; // true = dikirim oleh pengguna, false = diterima
  isViewed?: boolean; // untuk view once
  status: 'sent' | 'delivered' | 'read';
  reactions?: { emoji: string; count: number; byMe?: boolean }[];
  replyTo?: { id: string; text: string; senderName: string };
  isDeleted?: boolean;
  isEdited?: boolean;
  documentName?: string;
  documentSize?: string;
}

export interface ChatConversation {
  id: string;
  name: string;
  phone: string;
  avatarUrl: string;
  avatarRing: AvatarRing;
  isVerified: boolean;
  isOnline: boolean;
  isTyping?: boolean;
  unreadCount: number;
  lastMessage: string;
  lastTimestamp: number;
  isPinned: boolean;
  isArchived: boolean;
  folder: 'pribadi' | 'grup' | 'channel';
  wallpaperUrl?: string;
  customStatus?: string;
}

export interface StoryItem {
  id: string;
  authorName: string;
  authorPhone: string;
  authorAvatar: string;
  type: 'text' | 'image' | 'audio';
  content: string;
  backgroundColor?: string;
  timestamp: number;
  viewCount: number;
  duration?: number;
}

export interface ChannelPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  mediaUrl?: string;
  timestamp: number;
  likesCount: number;
}

export interface ChannelItem {
  id: string;
  name: string;
  avatarUrl: string;
  verified: boolean;
  followersCount: number;
  postsCount: number;
  isAdmin: boolean;
  isFollowing: boolean;
  description: string;
  posts: ChannelPost[];
}

export interface CommunityGroup {
  id: string;
  name: string;
  avatarUrl: string;
  memberCount: number;
  lastMessage: string;
  lastTimestamp: number;
}

export interface CommunityItem {
  id: string;
  name: string;
  description: string;
  avatarUrl: string;
  announcementChatId?: string;
  groups: CommunityGroup[];
}

export interface CallRecord {
  id: string;
  contactName: string;
  contactNumber: string;
  contactAvatar: string;
  type: 'voice' | 'video';
  direction: 'incoming' | 'outgoing' | 'missed';
  timestamp: number;
  durationSeconds?: number;
}

export interface UserProfile {
  name: string;
  phone: string;
  bio: string;
  avatarUrl: string;
  avatarRing: AvatarRing;
  isVerified: boolean;
  isPublic: boolean;
  isLoggedIn?: boolean;
  lastSeenActive: boolean;
  autoReplyEnabled: boolean;
  autoReplyText: string;
  birthday: string;
  theme: ChatTheme;
  chatWallpaper: string;
  soundVolume: number;
  cleanScreenshotMode?: boolean;
}

export interface ActiveCallState {
  isOpen: boolean;
  contact: {
    name: string;
    number: string;
    avatarUrl: string;
  };
  type: 'voice' | 'video';
  status: 'ringing' | 'connected' | 'ended';
  durationSeconds: number;
  isMuted: boolean;
  isSpeaker: boolean;
  isCameraOff: boolean;
}

// Auxiliary types for exam & floating components
export type QuestionType = 'multiple_choice' | 'true_false' | 'essay';

export interface ExamOption {
  key: string;
  text: string;
}

export interface ExamQuestion {
  id: string;
  number: number;
  type: QuestionType;
  question: string;
  options: ExamOption[];
  correctAnswer?: string;
  userSelectedAnswer?: string;
  selectedAnswer?: string;
  isSolvedByRobot?: boolean;
  explanation?: string;
  confidence?: number;
}

export interface AnalysisResult {
  id?: string;
  question?: string;
  questionText?: string;
  questionNumber?: number;
  date?: string;
  timestamp?: number;
  type?: QuestionType;
  detectedType?: QuestionType;
  options: ExamOption[];
  bestAnswer: string;
  confidence: number;
  explanation: string;
  patternAnalysis?: any;
  studyConcept?: any;
  visualDetected?: boolean;
  timeTakenMs?: number;
  [key: string]: any;
}

export interface AutoPilotProgress {
  totalQuestions: number;
  solvedCount: number;
  currentQuestionIndex: number;
  isRunning: boolean;
  status: 'idle' | 'scanning' | 'solving' | 'paused' | 'completed' | 'counting';
  autoClickEnabled?: boolean;
  currentQuestionNumber?: number;
  lastAnswerGiven?: string | null;
  warningAntiExitActive?: boolean;
}

export interface RobotBubbleState {
  text: string;
  type: 'idle' | 'analyzing' | 'solved' | 'warning' | 'error';
}

export interface AppSettings {
  apiKey?: string;
  model?: string;
  autoClick?: boolean;
  autoAdvance?: boolean;
  delayMs?: number;
  answerDelaySeconds?: number;
  overlayOpacity?: number;
  theme?: string;
  crossTabFloatingEnabled?: boolean;
  antiExitWarningEnabled?: boolean;
  soundEffectsEnabled?: boolean;
  [key: string]: any;
}

export interface PresetScreen {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  difficulty?: string;
  totalQuestionsInSet?: number;
  questions: ExamQuestion[];
}
