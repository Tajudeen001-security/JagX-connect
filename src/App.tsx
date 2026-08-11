import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  Tv,
  Radio,
  ShoppingBag,
  MessageSquare,
  Coins,
  CreditCard,
  User,
  Heart,
  Bookmark,
  Send,
  Plus,
  Coins as CoinIcon,
  Video,
  Phone,
  Settings,
  Bell,
  Search,
  CheckCircle,
  X,
  Share2,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Sparkles,
  ArrowLeft,
  Sliders,
  TrendingUp,
  ShieldCheck,
  Music,
  RefreshCw,
  Image as ImageIcon,
  Check,
  MessageCircle,
  Trash2,
  Lock,
  Mail,
  UserCheck,
  LogOut,
  Database,
  Wifi,
  WifiOff,
  Clock,
  Key,
  Eye,
  EyeOff,
  BarChart3,
  QrCode,
  Paperclip,
  Flame,
  Volume2,
  Award,
  Filter,
  UserX,
  Smile,
  Zap,
  FolderPlus,
  Folder,
  Pin,
  VolumeX,
  Link,
  Copy,
  Edit3,
  Camera,
  Palette,
  Moon,
  Sun,
  Vibrate,
  Globe,
  ChevronLeft,
  Crop,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Smartphone,
  ChevronDown,
  AlertTriangle,
  Languages,
  FolderOpen,
  Target,
  Move,
  MapPin,
  Map,
  Compass,
  BookmarkPlus,
  Crown,
  Vote
} from 'lucide-react';
import { supabase, isSupabaseConfigured, saveOfflineCache, loadOfflineCache } from './lib/supabase';
import { jagxGenerateImage, imageResultToDataUrl, isJagxAIConfigured } from './lib/jagxAI';

// --- DATA TYPES ---
interface CommentItem {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  timestamp: string;
}

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Post {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  timestamp: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  likesCount: number;
  commentsCount: number;
  giftsCount: number;
  isLiked: boolean;
  isSaved: boolean;
  isCloseFriend?: boolean;
  isSponsored?: boolean;
  language?: string;
  poll?: {
    question: string;
    options: PollOption[];
    totalVotes: number;
    userVotedOptionId?: string;
  };
  analytics?: {
    impressions: number;
    engagementRate: string;
    shares: number;
  };
}

interface Story {
  id: string;
  userName: string;
  userAvatar: string;
}

interface Reel {
  id: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar: string;
  caption: string;
  soundTitle: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
}

interface LiveRoom {
  id: string;
  hostName: string;
  hostAvatar: string;
  title: string;
  viewerCount: number;
  category: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  priceCoins: number;
  priceUsd: number;
  category: string;
  imageUrl: string;
  sellerName: string;
}

interface Conversation {
  id: string;
  partnerName: string;
  partnerAvatar: string;
  lastMessage: string;
  lastTimestamp: string;
}

interface Message {
  id: string;
  sender: 'me' | 'partner';
  content: string;
  timestamp: string;
  isEncrypted?: boolean;
  pinCode?: string; // e.g. "1234"
  isRevealed?: boolean;
  tapCount?: number;
  expiresAt?: number; // timestamp in ms
  autoDestroyDuration?: number; // in seconds
  audioUrl?: string; // for voice note messages
  imageUrl?: string;
}

interface AppNotification {
  id: string;
  title: string;
  desc: string;
  timestamp: string;
  read: boolean;
  type: 'like' | 'gift' | 'comment' | 'system';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'feed' | 'reels' | 'live' | 'market' | 'chat' | 'wallet' | 'invest' | 'profile'>('feed');
  const [accentTheme, setAccentTheme] = useState<'gold' | 'sapphire' | 'emerald' | 'magenta'>('gold');
  
  // State
  const [userCoins, setUserCoins] = useState(2500);
  const [showGiftModal, setShowGiftModal] = useState<string | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCall, setShowCall] = useState<{ partner: string; isVideo: boolean } | null>(null);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [newProductTitle, setNewProductTitle] = useState('');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductPriceCoins, setNewProductPriceCoins] = useState('');
  const [newProductPriceUsd, setNewProductPriceUsd] = useState('');
  const [newProductImageFile, setNewProductImageFile] = useState<File | null>(null);
  const [newProductImagePreview, setNewProductImagePreview] = useState<string | null>(null);
  const [isPublishingProduct, setIsPublishingProduct] = useState(false);
  const [activeLiveRoom, setActiveLiveRoom] = useState<LiveRoom | null>(null);
  const liveChatChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Authentication & Supabase state
  const [currentUser, setCurrentUser] = useState<{ id?: string; email: string; name: string; handle: string; avatar: string } | null>(() => {
    return loadOfflineCache('user_session', null);
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showSupabaseConfigInfo, setShowSupabaseConfigInfo] = useState(false);

  // New features state
  const [animatingHeartPostId, setAnimatingHeartPostId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [newCommentInput, setNewCommentInput] = useState('');
  const [feedSearchQuery, setFeedSearchQuery] = useState('');
  const [activeHashtagFilter, setActiveHashtagFilter] = useState<string | null>(null);
  const [profileTab, setProfileTab] = useState<'posts' | 'saved' | 'collections' | 'badges'>('posts');
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{ type: 'post' | 'product'; id: string; title?: string } | null>(null);
  
  // Custom Collections State
  const [savedCollections, setSavedCollections] = useState<{ id: string; name: string; postIds: string[]; icon: string }[]>([
    { id: 'col1', name: 'Web3 & AI Innovations', postIds: ['p1'], icon: '⚡' },
    { id: 'col2', name: 'Crypto Tokenomics', postIds: ['p2'], icon: '🪙' },
    { id: 'col3', name: 'VIP Insights', postIds: [], icon: '💎' }
  ]);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionIcon, setNewCollectionIcon] = useState('📁');
  const [showAddToCollectionPostId, setShowAddToCollectionPostId] = useState<string | null>(null);

  // Web Audio API Recorder state
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [voiceRecordingSeconds, setVoiceRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<any>(null);

  // Active Call Screen State
  const [activeCall, setActiveCall] = useState<{ partner: string; isVideo: boolean; isMuted: boolean; isCamOff: boolean; isScreenSharing: boolean; durationSeconds: number } | null>(null);

  // Secret PIN Cipher & Auto-Destroy Chat state
  const [showPinPromptModal, setShowPinPromptModal] = useState<{ conversationId: string; messageId: string; correctPin: string } | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [isEncryptNextMessage, setIsEncryptNextMessage] = useState(false);
  const [nextMessagePin, setNextMessagePin] = useState('1234');
  const [autoDestroySeconds, setAutoDestroySeconds] = useState<number>(0); // 0 = off, 5, 30, 60
  const [chatInputText, setChatInputText] = useState('');
  const [chatSelectedImage, setChatSelectedImage] = useState<string | null>(null);

  // Modals & New Features State
  const [showQrModal, setShowQrModal] = useState(false);
  const [activeAnalyticsPost, setActiveAnalyticsPost] = useState<Post | null>(null);
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const [marketCategoryFilter, setMarketCategoryFilter] = useState<string>('All');
  const [liveStreamEmojis, setLiveStreamEmojis] = useState<{ id: string; emoji: string; left: number }[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>(['@spammer_bot']);
  const [showMuteModal, setShowMuteModal] = useState<string | null>(null);
  const [showTipModal, setShowTipModal] = useState<{ userName: string; handle: string; avatar: string } | null>(null);
  const [tipAmount, setTipAmount] = useState(50);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyReasonInput, setVerifyReasonInput] = useState('');
  const [sharePostModal, setSharePostModal] = useState<Post | null>(null);
  const [profileBannerUrl, setProfileBannerUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80');
  const [profileBioLink, setProfileBioLink] = useState('https://jri.network/tajudeen');
  const [isAmoledBlack, setIsAmoledBlack] = useState(false);
  const [soundNotificationsEnabled, setSoundNotificationsEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [showBlockedUsersModal, setShowBlockedUsersModal] = useState(false);
  const [liveStreamGoal, setLiveStreamGoal] = useState({ current: 1850, target: 2500 });

  // JagX Light vs Deep Space Dark Theme & Daily Streak & Live Stream Chat
  const [isLightMode, setIsLightMode] = useState(false);
  const [dailyStreak, setDailyStreak] = useState({ count: 4, claimedToday: false, lastClaimedDate: '' });
  const [liveStreamMessages, setLiveStreamMessages] = useState<{ id: string; user: string; text: string; avatar: string }[]>([
    { id: 'lm1', user: 'Aisha Bello', text: '🔥 This Live stream quality is crisp!', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80' },
    { id: 'lm2', user: 'Davido Official', text: '🪙 Tipping 100 coins to support!', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80' },
    { id: 'lm3', user: 'Kemi Adebayo', text: '🚀 JagX Ecosystem to the moon!', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' }
  ]);
  const [newLiveMsgText, setNewLiveMsgText] = useState('');

  // Helper trigger for Capacitor / Web Haptics
  const triggerHaptic = (pattern: number | number[] = 40) => {
    if (hapticsEnabled && typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(pattern);
      } catch (e) {
        // ignore
      }
    }
  };

  // Deep Linking, Skeleton Loading, Push Notifications & Image Cropper State
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [deepLinkNotice, setDeepLinkNotice] = useState<string | null>(null);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [pushToken, setPushToken] = useState('cap_push_token_992182_jagx');
  const [showPushPermissionModal, setShowPushPermissionModal] = useState(false);
  const [simulatedPushToast, setSimulatedPushToast] = useState<{ title: string; body: string } | null>(null);
  const [cropperState, setCropperState] = useState<{ imageUrl: string; type: 'avatar' | 'banner'; zoom: number; rotation: number } | null>(null);
  
  // Additional Features State
  const [userStatus, setUserStatus] = useState('🟢 Building Web3 on JagX');
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [storyViewersModal, setStoryViewersModal] = useState<{ storyName: string; viewers: { name: string; avatar: string; time: string }[] } | null>(null);
  const [savedTypeFilter, setSavedTypeFilter] = useState<'all' | 'text' | 'image' | 'poll'>('all');
  const [audioPlaybackSpeed, setAudioPlaybackSpeed] = useState<number>(1.0);
  const [isDataSaverMode, setIsDataSaverMode] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [deepSharePostModal, setDeepSharePostModal] = useState<Post | null>(null);
  const [expandedPostIds, setExpandedPostIds] = useState<Record<string, boolean>>({});
  const [showReportUserModal, setShowReportUserModal] = useState<{ userName: string; handle: string } | null>(null);
  const [swipedChatId, setSwipedChatId] = useState<string | null>(null);

  // Focus Mode, Translations & QR Scanner State
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [postTranslations, setPostTranslations] = useState<Record<string, { translatedText: string; sourceLang: string; isTranslating?: boolean }>>({});
  const [showQrScannerModal, setShowQrScannerModal] = useState(false);
  const [scannedQrUser, setScannedQrUser] = useState<{ name: string; handle: string; avatar: string; bio: string; coins: number } | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const qrVideoRef = useRef<HTMLVideoElement | null>(null);

  // Radial Quick Actions, Explore Map & AI Collections State
  const [radialQuickActionPost, setRadialQuickActionPost] = useState<Post | null>(null);
  const [marketplaceViewMode, setMarketplaceViewMode] = useState<'listings' | 'map'>('listings');
  const [selectedMapPin, setSelectedMapPin] = useState<{ id: string; name: string; handle?: string; type: 'user' | 'event'; distance: string; title: string; category: string; avatar: string; attendees?: number; desc: string; lat: number; lng: number } | null>(null);
  const [isAutoSortingCollections, setIsAutoSortingCollections] = useState(false);

  // TikTok-Style Live Gifting & Full Screen Animation FX State
  const [giftCategoryTab, setGiftCategoryTab] = useState<'Popular' | 'Luxury' | 'Beasts' | 'Universe' | 'Imperial'>('Popular');
  const [giftMultiplier, setGiftMultiplier] = useState<number>(1);
  const [giftSearchQuery, setGiftSearchQuery] = useState('');
  const [activeGiftFx, setActiveGiftFx] = useState<{
    giftName: string;
    giftIcon: string;
    giftCoins: number;
    senderName: string;
    category: string;
    multiplier: number;
    fxType: string;
  } | null>(null);

  // 20+ New Integrated Features State
  const [selectedVoiceFilter, setSelectedVoiceFilter] = useState<'normal' | 'robot' | 'deep' | 'studio' | 'echo' | 'anime'>('normal');
  const [isGeneratingAiCaption, setIsGeneratingAiCaption] = useState(false);
  const [showAiImageStudioModal, setShowAiImageStudioModal] = useState(false);
  const [aiImagePrompt, setAiImagePrompt] = useState('');
  const [isGeneratingAiImage, setIsGeneratingAiImage] = useState(false);
  const [generatedAiImageUrl, setGeneratedAiImageUrl] = useState<string | null>(null);
  const [showDualCamModal, setShowDualCamModal] = useState(false);
  const [selectedBackgroundTrack, setSelectedBackgroundTrack] = useState<{ name: string; artist: string; icon: string } | null>(null);
  const [showMusicTrackPicker, setShowMusicTrackPicker] = useState(false);
  const [selectedArFilter, setSelectedArFilter] = useState<string | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState<{ creatorName: string; handle: string; avatar: string } | null>(null);
  const [userSubscribedCreators, setUserSubscribedCreators] = useState<string[]>(['@davido_official']);
  const [stakedCoins, setStakedCoins] = useState(500);
  const [stakedYieldEarned, setStakedYieldEarned] = useState(14.8);
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [showDaoVotingModal, setShowDaoVotingModal] = useState(false);
  const [daoProposals, setDaoProposals] = useState([
    { id: 'prop1', title: 'Fund 100k JagX Coins Creator Growth Grant', yesVotes: 14200, noVotes: 1200, userVoted: null as string | null },
    { id: 'prop2', title: 'Add Zero-Fee Decentralized P2P Escrow Market', yesVotes: 28900, noVotes: 450, userVoted: 'yes' }
  ]);
  const [userNfts] = useState([
    { id: 'nft1', name: 'JagX Genesis Badge #001', image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=300&q=80', rarity: 'Legendary', valueCoins: 5000 },
    { id: 'nft2', name: 'Lagos Tech Pioneer', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80', rarity: 'Rare', valueCoins: 1200 },
    { id: 'nft3', name: 'Web3 Voice Stage Host', image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=300&q=80', rarity: 'Epic', valueCoins: 2500 }
  ]);
  const [tickerActiveIndex, setTickerActiveIndex] = useState(0);
  const tickerItems = [
    '⚽ Arsenal 2 - 1 Chelsea (88\')',
    '🪙 JAGX Token +18.4% • $0.245 USD',
    '⚡ Lagos Web3 Summit Live Stream Starts in 15m',
    '🏆 Davido Official sent 10,000 Golden Lion King Gift!',
    '🏀 Lakers 112 - 108 Celtics (FT)'
  ];
  const [isBionicReading, setIsBionicReading] = useState(false);
  const [liveStreamTab, setLiveStreamTab] = useState<'streams' | 'audio_stage'>('streams');
  const [activeVoiceRoom, setActiveVoiceRoom] = useState<{
    title: string;
    speakers: { name: string; avatar: string; role: string; isMuted?: boolean }[];
    listenersCount: number;
    isUserSpeaker: boolean;
    hasRaisedHand: boolean;
  } | null>(null);
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState<{ name: string; artist: string; isPlaying: boolean } | null>({
    name: 'Afro-Web3 Vibes 2026',
    artist: 'Burna Boy x JagX Beats',
    isPlaying: false
  });
  const [userLevel] = useState({ level: 7, currentXp: 340, maxXp: 500, title: 'JagX Ambassador' });
  const [isAiShieldEnabled, setIsAiShieldEnabled] = useState(true);

  // Poll Deep Link Share & Poll Demographics Analytics State
  const [sharePollModalPost, setSharePollModalPost] = useState<Post | null>(null);
  const [showPollAnalyticsModal, setShowPollAnalyticsModal] = useState<Post | null>(null);
  const [analyticsSelectedOptionId, setAnalyticsSelectedOptionId] = useState<string | 'all'>('all');

  // Coin Toss Gifting Effect State
  const [activeCoinToss, setActiveCoinToss] = useState<{ id: string; giftName: string } | null>(null);

  // Live Stream Gifting Streak State
  const [giftingStreak, setGiftingStreak] = useState<{
    hostHandle: string;
    count: number;
    multiplier: number;
    lastGiftTime: number;
    unlockedBonusCoins: number;
  }>({
    hostHandle: '@davido_official',
    count: 0,
    multiplier: 1.0,
    lastGiftTime: 0,
    unlockedBonusCoins: 0
  });

  // Daily Missions System State
  const [dailyMissions, setDailyMissions] = useState([
    { id: 'm1', title: 'Like 3 Posts on Feed', current: 0, target: 3, rewardCoins: 50, completed: false, claimed: false, icon: '❤️' },
    { id: 'm2', title: 'Send 1 Virtual Gift to Creator', current: 0, target: 1, rewardCoins: 100, completed: false, claimed: false, icon: '🎁' },
    { id: 'm3', title: 'Vote in 1 Community Poll', current: 0, target: 1, rewardCoins: 75, completed: false, claimed: false, icon: '📊' }
  ]);
  const [showMissionsModal, setShowMissionsModal] = useState(false);

  // Helper to update Daily Mission Progress
  const updateMissionProgress = (missionId: string, increment = 1) => {
    setDailyMissions(prev => prev.map(m => {
      if (m.id === missionId && !m.claimed) {
        const nextCurrent = Math.min(m.target, m.current + increment);
        const isNowCompleted = nextCurrent >= m.target;
        if (isNowCompleted && !m.completed) {
          triggerToast(`🎯 Daily Mission Completed: "${m.title}"! Tap to claim 🪙${m.rewardCoins} Coins!`);
        }
        return { ...m, current: nextCurrent, completed: isNowCompleted };
      }
      return m;
    }));
  };

  // Explore Map Pins Sample Data
  const exploreMapPins = [
    {
      id: 'pin1',
      name: 'Aisha Bello',
      handle: '@aisha_tech',
      type: 'user' as const,
      title: 'Aisha Bello • Web3 Developer',
      category: 'AI & Blockchain Developer',
      distance: '0.6 km away',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      desc: 'Building decentralized social infrastructure & JagX Connect modules in Victoria Island.',
      lat: 42,
      lng: 35
    },
    {
      id: 'pin2',
      name: 'Lagos Web3 Founders Hub',
      type: 'event' as const,
      title: 'Lagos Web3 & AI Summit 2026',
      category: 'Tech Meetup',
      distance: '1.2 km away',
      avatar: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=150&q=80',
      attendees: 184,
      desc: 'Join 180+ developers, creators and investors for the monthly JagX ecosystem meetup!',
      lat: 25,
      lng: 65
    },
    {
      id: 'pin3',
      name: 'Davido Live Studio Session',
      handle: '@davido_official',
      type: 'event' as const,
      title: 'Davido Exclusive Listening Party',
      category: 'Music & VIP Event',
      distance: '2.4 km away',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      attendees: 420,
      desc: 'Exclusive VIP listening experience with live streaming on JagX Connect Rooms.',
      lat: 70,
      lng: 50
    },
    {
      id: 'pin4',
      name: 'Crypto & Coffee Lounge',
      type: 'user' as const,
      title: 'Crypto Founders Hub • Ikoyi',
      category: 'Marketplace & Workspace',
      distance: '3.1 km away',
      avatar: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=150&q=80',
      desc: 'Local peer-to-peer JagX Coin trade desk, artisan coffee, and high-speed Wi-Fi.',
      lat: 60,
      lng: 20
    }
  ];

  // Estimated Reading Time Calculator
  const calculateReadingTime = (text: string) => {
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const mins = Math.max(1, Math.ceil(wordCount / 25));
    return `${mins} min read`;
  };

  // User VIP Badges
  const [userBadges, setUserBadges] = useState<string[]>(['Diamond Ambassador', 'Black VIP', 'Verified Creator', 'Top Supporter']);

  // Notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Helper glitch cipher
  const toGlitchCipher = (str: string) => {
    const chars = '⌘§#9x!∅ψ@1⨁𝄫⚡∆%*$&?#@!';
    return str.split('').map((char, i) => char === ' ' ? ' ' : chars[(char.charCodeAt(0) + i) % chars.length]).join('');
  };

  // Google SSO Handler
  const handleGoogleAuth = async () => {
    setAuthLoading(true);
    if (isSupabaseConfigured()) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) setAuthError(error.message);
    } else {
      setTimeout(() => {
        const googleUser = {
          id: `usr_g_${Date.now()}`,
          email: 'tajudeen.google@gmail.com',
          name: 'Tajudeen Gbadamosi (Google)',
          handle: '@tajudeen_google',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
        };
        setCurrentUser(googleUser);
        saveOfflineCache('user_session', googleUser);
        setShowAuthModal(false);
        triggerToast('⚡ Successfully signed in with Google!');
        setAuthLoading(false);
      }, 600);
    }
  };

  // X (Twitter) SSO Handler
  const handleXAuth = async () => {
    setAuthLoading(true);
    if (isSupabaseConfigured()) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: { redirectTo: window.location.origin },
      });
      if (error) setAuthError(error.message);
    } else {
      setTimeout(() => {
        const xUser = {
          id: `usr_x_${Date.now()}`,
          email: 'tajudeen.x@twitter.com',
          name: 'Tajudeen Gbadamosi (X)',
          handle: '@jagx_x_tajudeen',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
        };
        setCurrentUser(xUser);
        saveOfflineCache('user_session', xUser);
        setShowAuthModal(false);
        triggerToast('𝕏 Successfully signed in with X (Twitter)!');
        setAuthLoading(false);
      }, 600);
    }
  };

  // Auto-Destroy Messages Interval Checker
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let destroyedAny = false;

      setMessages(prev => {
        const nextMsgs: Record<string, Message[]> = {};
        for (const [convId, msgList] of Object.entries(prev)) {
          const filtered = msgList.filter(m => {
            if (m.expiresAt && m.expiresAt <= now) {
              destroyedAny = true;
              return false;
            }
            return true;
          });
          nextMsgs[convId] = filtered;
        }
        return nextMsgs;
      });

      if (destroyedAny) {
        triggerToast('🔥 Self-destruct message expired and auto-destroyed!');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Capacitor Deep Linking Listener
  useEffect(() => {
    const handleDeepLink = () => {
      const url = window.location.href;
      if (url.includes('post=') || url.includes('#post-')) {
        const pId = url.split('post=')[1]?.split('&')[0] || url.split('#post-')[1];
        if (pId) {
          setActiveTab('feed');
          setFeedSearchQuery(pId);
          setDeepLinkNotice(`🔗 Deep link routed to Post #${pId}`);
          triggerToast(`🔗 Direct Deep Link: Showing Post #${pId}`);
        }
      } else if (url.includes('poll=') || url.includes('#poll-')) {
        const pollId = url.split('poll=')[1]?.split('&')[0] || url.split('#poll-')[1];
        if (pollId) {
          setActiveTab('feed');
          setFeedSearchQuery(pollId);
          setDeepLinkNotice(`📊 Deep link routed to Poll Post #${pollId}`);
          triggerToast(`📊 Direct Poll Deep Link: Showing Poll #${pollId}`);
        }
      } else if (url.includes('user=') || url.includes('#user-')) {
        const uHandle = url.split('user=')[1]?.split('&')[0] || url.split('#user-')[1];
        if (uHandle) {
          setActiveTab('profile');
          setDeepLinkNotice(`👤 Deep link routed to Profile ${uHandle}`);
          triggerToast(`👤 Direct Deep Link: Navigated to ${uHandle}`);
        }
      }
    };

    handleDeepLink();
    window.addEventListener('hashchange', handleDeepLink);
    return () => window.removeEventListener('hashchange', handleDeepLink);
  }, []);

  // Simulated Push Notification Dispatcher
  const triggerPushNotification = (title: string, body: string) => {
    if (!pushEnabled) return;
    setSimulatedPushToast({ title, body });
    setTimeout(() => setSimulatedPushToast(null), 4500);
  };

  // Refresh feed with Skeleton Screen
  const handleRefreshFeedWithSkeleton = () => {
    setIsLoadingData(true);
    setIsRefreshing(true);
    setTimeout(() => {
      setIsLoadingData(false);
      setIsRefreshing(false);
      triggerToast('✨ Feed updated with latest Supabase posts!');
    }, 900);
  };
  
  // Create Post image picker state
  const [selectedImageForPost, setSelectedImageForPost] = useState<string | null>(null);
  const [selectedPostMediaFile, setSelectedPostMediaFile] = useState<File | null>(null);
  const [selectedVideoForPost, setSelectedVideoForPost] = useState<string | null>(null);
  const [isPublishingPost, setIsPublishingPost] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

  // Sample placeholder images for post creation
  const placeholderImages = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80'
  ];

  // Helper toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Auth Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setAuthError('Please enter both email and password.');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });

        if (error) {
          setAuthError(error.message);
          return;
        }

        if (data.user) {
          const loggedUser = {
            id: data.user.id,
            email: data.user.email || authEmail,
            name: data.user.user_metadata?.full_name || authEmail.split('@')[0],
            handle: `@${authEmail.split('@')[0]}`,
            avatar: data.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
          };
          setCurrentUser(loggedUser);
          saveOfflineCache('user_session', loggedUser);
          setShowAuthModal(false);
          triggerToast(`Welcome back, ${loggedUser.name}!`);
        }
      } else {
        // Simulation mode when keys not provided in .env
        const mockUser = {
          id: `usr_${Date.now()}`,
          email: authEmail,
          name: authEmail.split('@')[0],
          handle: `@${authEmail.split('@')[0]}`,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
        };
        setCurrentUser(mockUser);
        saveOfflineCache('user_session', mockUser);
        setShowAuthModal(false);
        triggerToast(`Logged in as ${mockUser.name}`);
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Login failed — check your connection and try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword || !authName) {
      setAuthError('Please fill in all fields.');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: {
              full_name: authName,
            }
          }
        });

        if (error) {
          setAuthError(error.message);
          return;
        }

        if (data.user) {
          const newUser = {
            id: data.user.id,
            email: data.user.email || authEmail,
            name: authName,
            handle: `@${authName.toLowerCase().replace(/\s+/g, '_')}`,
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
          };
          setCurrentUser(newUser);
          saveOfflineCache('user_session', newUser);
          setShowAuthModal(false);
          triggerToast(`Account created! Welcome, ${newUser.name}`);
        }
      } else {
        const newUser = {
          id: `usr_${Date.now()}`,
          email: authEmail,
          name: authName,
          handle: `@${authName.toLowerCase().replace(/\s+/g, '_')}`,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
        };
        setCurrentUser(newUser);
        saveOfflineCache('user_session', newUser);
        setShowAuthModal(false);
        triggerToast(`Account created for ${newUser.name}`);
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Sign up failed — check your connection and try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    localStorage.removeItem('jagx_cache_user_session');
    triggerToast('Signed out successfully.');
  };

  // Accent Colors
  const accentColors = {
    gold: { primary: 'bg-yellow-500 text-black', border: 'border-yellow-500', text: 'text-yellow-400', ring: 'focus:ring-yellow-500' },
    sapphire: { primary: 'bg-blue-600 text-white', border: 'border-blue-500', text: 'text-blue-400', ring: 'focus:ring-blue-500' },
    emerald: { primary: 'bg-emerald-500 text-black', border: 'border-emerald-500', text: 'text-emerald-400', ring: 'focus:ring-emerald-500' },
    magenta: { primary: 'bg-pink-600 text-white', border: 'border-pink-500', text: 'text-pink-400', ring: 'focus:ring-pink-500' },
  }[accentTheme];

  // Feed Posts
  const [posts, setPosts] = useState<Post[]>([]);

  // Comments state per post
  const [postComments, setPostComments] = useState<Record<string, CommentItem[]>>({});

  const stories: Story[] = [];

  // Reels
  const reels: Reel[] = [];

  // Live Rooms
  const liveRooms: LiveRoom[] = [];

  // Conversations & DMs
  const conversations: Conversation[] = [];

  // Marketplace listings
  const [products, setProducts] = useState<Product[]>([]);

  const [messages, setMessages] = useState<Record<string, Message[]>>({});

  // Handlers
  const handleVotePoll = (postId: string, optionId: string) => {
    setPosts(posts.map(p => {
      if (p.id === postId && p.poll) {
        if (p.poll.userVotedOptionId) {
          triggerToast('You have already voted in this poll!');
          return p;
        }
        const updatedOptions = p.poll.options.map(o => o.id === optionId ? { ...o, votes: o.votes + 1 } : o);
        triggerToast('Vote recorded!');
        updateMissionProgress('m3');
        return {
          ...p,
          poll: {
            ...p.poll,
            options: updatedOptions,
            totalVotes: p.poll.totalVotes + 1,
            userVotedOptionId: optionId
          }
        };
      }
      return p;
    }));
  };

  const handleSendMessage = (convId: string) => {
    if (!chatInputText.trim() && !chatSelectedImage) return;

    triggerHaptic([30, 60]);

    const expiresAt = autoDestroySeconds > 0 ? Date.now() + autoDestroySeconds * 1000 : undefined;

    const newMsg: Message = {
      id: `m_${Date.now()}`,
      sender: 'me',
      content: chatInputText.trim(),
      timestamp: 'Just now',
      isEncrypted: isEncryptNextMessage,
      pinCode: isEncryptNextMessage ? (nextMessagePin || '1234') : undefined,
      autoDestroyDuration: autoDestroySeconds > 0 ? autoDestroySeconds : undefined,
      expiresAt,
      imageUrl: chatSelectedImage || undefined
    };

    setMessages(prev => ({
      ...prev,
      [convId]: [...(prev[convId] || []), newMsg]
    }));

    setChatInputText('');
    setChatSelectedImage(null);

    if (isEncryptNextMessage) {
      triggerToast(`🔒 Encrypted PIN message sent! PIN: ${nextMessagePin || '1234'}`);
    } else if (autoDestroySeconds > 0) {
      triggerToast(`🔥 Disappearing message set for ${autoDestroySeconds}s!`);
    } else {
      triggerToast('Message sent!');
    }
  };

  // Real Web Audio API Microphone Recorder
  const startAudioRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        triggerToast('⚠️ Microphone access not supported in this browser.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100);
      mediaRecorderRef.current = mediaRecorder;
      setIsVoiceRecording(true);
      setVoiceRecordingSeconds(0);
      
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = setInterval(() => {
        setVoiceRecordingSeconds(prev => prev + 1);
      }, 1000);
      
      triggerHaptic(40);
      triggerToast('🎙️ Recording voice note... Speak into microphone.');
    } catch (err) {
      console.error('Microphone error:', err);
      setIsVoiceRecording(true);
      setVoiceRecordingSeconds(0);
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = setInterval(() => {
        setVoiceRecordingSeconds(prev => prev + 1);
      }, 1000);
      triggerToast('🎙️ Voice note recorder active.');
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsVoiceRecording(false);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    triggerHaptic(30);
    triggerToast('⏹️ Recording captured. Tap send!');
  };

  const handleSendRecordedAudio = (convId: string) => {
    const finalUrl = recordedAudioUrl || 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg';
    const durationSec = voiceRecordingSeconds || 8;
    const durationStr = `0:${durationSec < 10 ? '0' : ''}${durationSec}`;

    const newMsg: Message = {
      id: `m_audio_${Date.now()}`,
      sender: 'me',
      content: `🎙️ Voice Note (${durationStr})`,
      timestamp: 'Just now',
      audioUrl: finalUrl
    };

    setMessages(prev => ({
      ...prev,
      [convId]: [...(prev[convId] || []), newMsg]
    }));

    setRecordedAudioUrl(null);
    setVoiceRecordingSeconds(0);
    setIsVoiceRecording(false);
    triggerHaptic([30, 60]);
    triggerToast('🎙️ Voice note clip sent!');
  };

  // Block/Unblock Handlers
  const handleBlockUser = (handle: string) => {
    if (!blockedUsers.includes(handle)) {
      setBlockedUsers([...blockedUsers, handle]);
      triggerHaptic(40);
      triggerToast(`🚫 Blocked ${handle}. Content & DMs hidden.`);
    }
  };

  const handleUnblockUser = (handle: string) => {
    setBlockedUsers(blockedUsers.filter(u => u !== handle));
    triggerHaptic(30);
    triggerToast(`✅ Unblocked ${handle}.`);
  };

  // Collections Handlers
  const handleCreateCollection = (name: string, icon: string) => {
    if (!name.trim()) return;
    const newCol = {
      id: `col_${Date.now()}`,
      name: name.trim(),
      postIds: [],
      icon: icon || '📁'
    };
    setSavedCollections([...savedCollections, newCol]);
    setNewCollectionName('');
    setShowCreateCollectionModal(false);
    triggerHaptic([40, 80]);
    triggerToast(`📁 Collection "${newCol.name}" created!`);
  };

  const handleAddPostToCollection = (postId: string, colId: string) => {
    setSavedCollections(savedCollections.map(col => {
      if (col.id === colId) {
        if (col.postIds.includes(postId)) {
          triggerToast('Post is already in this collection!');
          return col;
        }
        triggerHaptic([40, 70]);
        triggerToast(`Added post to "${col.name}"!`);
        return { ...col, postIds: [...col.postIds, postId] };
      }
      return col;
    }));
    setShowAddToCollectionPostId(null);
  };

  const handleSendVoiceNote = (convId: string) => {
    if (isVoiceRecording) {
      stopAudioRecording();
    } else {
      startAudioRecording();
    }
  };

  const handleTriggerReaction = (emoji: string) => {
    const newEmoji = {
      id: `emo_${Date.now()}_${Math.random()}`,
      emoji,
      left: Math.floor(Math.random() * 80) + 10
    };
    setLiveStreamEmojis(prev => [...prev, newEmoji]);
    setTimeout(() => {
      setLiveStreamEmojis(prev => prev.filter(e => e.id !== newEmoji.id));
    }, 2000);
  };

  // Handlers
  const handleLike = (id: string) => {
    // Trigger scaling animation and heart pulse haptic
    setAnimatingHeartPostId(id);
    setTimeout(() => setAnimatingHeartPostId(null), 300);
    triggerHaptic([30, 50]);

    setPosts(posts.map(p => {
      if (p.id === id) {
        const nextLiked = !p.isLiked;
        if (nextLiked) {
          updateMissionProgress('m1');
        }
        return { ...p, isLiked: nextLiked, likesCount: nextLiked ? p.likesCount + 1 : p.likesCount - 1 };
      }
      return p;
    }));
  };

  const handleToggleSave = (id: string) => {
    triggerHaptic([40, 70]);
    setPosts(posts.map(p => {
      if (p.id === id) {
        const nextSaved = !p.isSaved;
        triggerToast(nextSaved ? 'Post saved to collection!' : 'Post removed from saved!');
        return { ...p, isSaved: nextSaved };
      }
      return p;
    }));
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteModal) return;
    triggerHaptic(40);
    if (confirmDeleteModal.type === 'post') {
      setPosts(posts.filter(p => p.id !== confirmDeleteModal.id));
      if (isSupabaseConfigured() && !confirmDeleteModal.id.startsWith('p_')) {
        const { error } = await supabase.from('posts').delete().eq('id', confirmDeleteModal.id);
        if (error) triggerToast(`⚠️ Deleted locally only: ${error.message}`);
      }
      triggerToast('Post deleted successfully.');
    } else if (confirmDeleteModal.type === 'product') {
      setProducts(products.filter(p => p.id !== confirmDeleteModal.id));
      if (isSupabaseConfigured() && !confirmDeleteModal.id.startsWith('prod_')) {
        const { error } = await supabase.from('products').delete().eq('id', confirmDeleteModal.id);
        if (error) triggerToast(`⚠️ Deleted locally only: ${error.message}`);
      }
      triggerToast('Marketplace listing removed.');
    }
    setConfirmDeleteModal(null);
  };

  const handlePullToRefresh = () => {
    setIsRefreshing(true);
    triggerHaptic(30);
    setTimeout(() => {
      setIsRefreshing(false);
      triggerToast('Feed updated with latest posts!');
    }, 1200);
  };

  const handleAddComment = (postId: string) => {
    if (!newCommentInput.trim()) return;
    
    triggerHaptic([25, 50]);

    const newComment: CommentItem = {
      id: `comm_${Date.now()}`,
      authorName: currentUser?.name || 'Tajudeen Gbadamosi',
      authorAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      text: newCommentInput.trim(),
      timestamp: 'Just now'
    };

    setPostComments({
      ...postComments,
      [postId]: [...(postComments[postId] || []), newComment]
    });

    setPosts(posts.map(p => p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p));
    setNewCommentInput('');
    triggerToast('Comment added!');
  };

  // --- TIKTOK LIVE VIRTUAL GIFTS (100 ITEMS) ---
  const GENERATED_TIKTOK_GIFTS = [
    // Popular (1 - 99 coins)
    { id: 'g_rose', name: 'Rose', icon: '🌹', coins: 1, category: 'Popular' as const, fxType: 'rose' },
    { id: 'g_heart', name: 'Finger Heart', icon: '🫰', coins: 5, category: 'Popular' as const, fxType: 'heart' },
    { id: 'g_icecream', name: 'Ice Cream', icon: '🍦', coins: 10, category: 'Popular' as const, fxType: 'rose' },
    { id: 'g_coinbag', name: 'Coin Bag', icon: '💰', coins: 20, category: 'Popular' as const, fxType: 'diamond' },
    { id: 'g_discoball', name: 'Disco Ball', icon: '🪩', coins: 30, category: 'Popular' as const, fxType: 'magic' },
    { id: 'g_lightning', name: 'Lightning', icon: '⚡', coins: 40, category: 'Popular' as const, fxType: 'magic' },
    { id: 'g_teddy', name: 'Teddy Bear', icon: '🧸', coins: 50, category: 'Popular' as const, fxType: 'rose' },
    { id: 'g_fireworks', name: 'Fireworks', icon: '🎆', coins: 75, category: 'Popular' as const, fxType: 'fireworks' },
    { id: 'g_ring', name: 'Diamond Ring', icon: '💍', coins: 99, category: 'Popular' as const, fxType: 'diamond' },
    { id: 'g_balloon', name: 'Red Balloon', icon: '🎈', coins: 8, category: 'Popular' as const, fxType: 'rose' },
    { id: 'g_lollipop', name: 'Lollipop', icon: '🍭', coins: 3, category: 'Popular' as const, fxType: 'rose' },
    { id: 'g_sparkler', name: 'Sparkler', icon: '🎇', coins: 12, category: 'Popular' as const, fxType: 'fireworks' },
    { id: 'g_champagne', name: 'Champagne', icon: '🥂', coins: 65, category: 'Popular' as const, fxType: 'magic' },
    { id: 'g_mic', name: 'Gold Mic', icon: '🎙️', coins: 88, category: 'Popular' as const, fxType: 'magic' },
    { id: 'g_cat', name: 'Lucky Cat', icon: '🐱', coins: 45, category: 'Popular' as const, fxType: 'rose' },
    { id: 'g_coffee', name: 'Hot Coffee', icon: '☕', coins: 6, category: 'Popular' as const, fxType: 'rose' },
    { id: 'g_donut', name: 'Glazed Donut', icon: '🍩', coins: 15, category: 'Popular' as const, fxType: 'rose' },
    { id: 'g_fire', name: 'Flame Heart', icon: '❤️‍🔥', coins: 35, category: 'Popular' as const, fxType: 'heart' },
    { id: 'g_music', name: 'Music Note', icon: '🎵', coins: 18, category: 'Popular' as const, fxType: 'magic' },
    { id: 'g_rainbow', name: 'Rainbow Star', icon: '🌈', coins: 90, category: 'Popular' as const, fxType: 'magic' },

    // Luxury (100 - 999 coins)
    { id: 'g_sports_car', name: 'Sports Car', icon: '🏎️', coins: 500, category: 'Luxury' as const, fxType: 'car' },
    { id: 'g_yacht', name: 'Luxury Yacht', icon: '🛥️', coins: 800, category: 'Luxury' as const, fxType: 'car' },
    { id: 'g_crown', name: 'Gold Crown', icon: '👑', coins: 300, category: 'Luxury' as const, fxType: 'crown' },
    { id: 'g_trophy', name: 'Champion Trophy', icon: '🏆', coins: 250, category: 'Luxury' as const, fxType: 'crown' },
    { id: 'g_diamond', name: 'Giant Diamond', icon: '💎', coins: 999, category: 'Luxury' as const, fxType: 'diamond' },
    { id: 'g_perfume', name: 'Chanel Bottle', icon: '🍾', coins: 150, category: 'Luxury' as const, fxType: 'magic' },
    { id: 'g_guitar', name: 'Electric Guitar', icon: '🎸', coins: 200, category: 'Luxury' as const, fxType: 'magic' },
    { id: 'g_watch', name: 'Rolex Watch', icon: '⌚', coins: 450, category: 'Luxury' as const, fxType: 'diamond' },
    { id: 'g_jetpack', name: 'Cyber Jetpack', icon: '🚀', coins: 650, category: 'Luxury' as const, fxType: 'jet' },
    { id: 'g_helicopter', name: 'Helicopter', icon: '🚁', coins: 750, category: 'Luxury' as const, fxType: 'jet' },
    { id: 'g_castle', name: 'Magic Castle', icon: '🏰', coins: 900, category: 'Luxury' as const, fxType: 'castle' },
    { id: 'g_chest', name: 'Treasure Chest', icon: '🧰', coins: 350, category: 'Luxury' as const, fxType: 'diamond' },
    { id: 'g_monalisa', name: 'NFT Masterpiece', icon: '🖼️', coins: 550, category: 'Luxury' as const, fxType: 'magic' },
    { id: 'g_ferrari', name: 'Red Supercar', icon: '🚘', coins: 700, category: 'Luxury' as const, fxType: 'car' },
    { id: 'g_champagne_tower', name: 'Crystal Tower', icon: '🍸', coins: 400, category: 'Luxury' as const, fxType: 'magic' },
    { id: 'g_gold_bar', name: 'Gold Bullion', icon: '🪙', coins: 600, category: 'Luxury' as const, fxType: 'diamond' },
    { id: 'g_stage', name: 'Concert Stage', icon: '🎪', coins: 850, category: 'Luxury' as const, fxType: 'magic' },
    { id: 'g_mansion', name: 'Miami Villa', icon: '🏙️', coins: 950, category: 'Luxury' as const, fxType: 'castle' },
    { id: 'g_vr', name: 'VR Headset', icon: '🥽', coins: 180, category: 'Luxury' as const, fxType: 'magic' },
    { id: 'g_island', name: 'Tropical Island', icon: '🏝️', coins: 980, category: 'Luxury' as const, fxType: 'universe' },

    // Beasts (1,000 - 4,999 coins)
    { id: 'g_lion', name: 'Golden Lion King', icon: '🦁', coins: 1000, category: 'Beasts' as const, fxType: 'lion' },
    { id: 'g_tiger', name: 'White Tiger', icon: '🐅', coins: 1200, category: 'Beasts' as const, fxType: 'lion' },
    { id: 'g_dragon', name: 'Cyber Dragon', icon: '🐉', coins: 2500, category: 'Beasts' as const, fxType: 'dragon' },
    { id: 'g_phoenix', name: 'Phoenix Flame', icon: '🦅', coins: 3000, category: 'Beasts' as const, fxType: 'phoenix' },
    { id: 'g_gorilla', name: 'Silverback Ape', icon: '🦍', coins: 1500, category: 'Beasts' as const, fxType: 'lion' },
    { id: 'g_wolf', name: 'Alpha Wolf', icon: '🐺', coins: 1800, category: 'Beasts' as const, fxType: 'lion' },
    { id: 'g_shark', name: 'Great White Shark', icon: '🦈', coins: 2200, category: 'Beasts' as const, fxType: 'dragon' },
    { id: 'g_unicorn', name: 'Mystic Unicorn', icon: '🦄', coins: 2800, category: 'Beasts' as const, fxType: 'magic' },
    { id: 'g_eagle', name: 'Imperial Eagle', icon: '🦅', coins: 1400, category: 'Beasts' as const, fxType: 'phoenix' },
    { id: 'g_bear', name: 'Grizzly Titan', icon: '🐻', coins: 1600, category: 'Beasts' as const, fxType: 'lion' },
    { id: 'g_cobra', name: 'Golden Cobra', icon: '🐍', coins: 2000, category: 'Beasts' as const, fxType: 'dragon' },
    { id: 'g_kraken', name: 'Sea Kraken', icon: '🐙', coins: 3500, category: 'Beasts' as const, fxType: 'dragon' },
    { id: 'g_pegasus', name: 'Pegasus Flight', icon: '🐎', coins: 3800, category: 'Beasts' as const, fxType: 'magic' },
    { id: 'g_mammoth', name: 'Frost Mammoth', icon: '🦣', coins: 2400, category: 'Beasts' as const, fxType: 'lion' },
    { id: 'g_panther', name: 'Black Panther', icon: '🐆', coins: 2100, category: 'Beasts' as const, fxType: 'lion' },
    { id: 'g_dino', name: 'T-Rex Titan', icon: '🦖', coins: 4000, category: 'Beasts' as const, fxType: 'lion' },
    { id: 'g_falcon', name: 'Cyber Falcon', icon: '🦅', coins: 2300, category: 'Beasts' as const, fxType: 'phoenix' },
    { id: 'g_whale', name: 'Crypto Whale', icon: '🐋', coins: 4500, category: 'Beasts' as const, fxType: 'dragon' },
    { id: 'g_fox', name: 'Nine-Tailed Fox', icon: '🦊', coins: 3200, category: 'Beasts' as const, fxType: 'magic' },
    { id: 'g_scorpion', name: 'Neon Scorpion', icon: '🦂', coins: 1900, category: 'Beasts' as const, fxType: 'dragon' },

    // Universe (5,000 - 19,999 coins)
    { id: 'g_jet', name: 'Private Gulfstream Jet', icon: '🛩️', coins: 5000, category: 'Universe' as const, fxType: 'jet' },
    { id: 'g_rocket', name: 'SpaceX Falcon Heavy', icon: '🚀', coins: 7500, category: 'Universe' as const, fxType: 'jet' },
    { id: 'g_ufo', name: 'Alien Mothership', icon: '🛸', coins: 10000, category: 'Universe' as const, fxType: 'universe' },
    { id: 'g_supernova', name: 'Galactic Supernova', icon: '🌌', coins: 12500, category: 'Universe' as const, fxType: 'universe' },
    { id: 'g_blackhole', name: 'Cosmic Black Hole', icon: '🕳️', coins: 15000, category: 'Universe' as const, fxType: 'universe' },
    { id: 'g_train', name: 'Hyperloop Maglev', icon: '🚆', coins: 6000, category: 'Universe' as const, fxType: 'car' },
    { id: 'g_comet', name: 'Halley Comet', icon: '☄️', coins: 8000, category: 'Universe' as const, fxType: 'universe' },
    { id: 'g_saturn', name: 'Ringed Saturn', icon: '🪐', coins: 9000, category: 'Universe' as const, fxType: 'universe' },
    { id: 'g_station', name: 'Space Station', icon: '🛰️', coins: 11000, category: 'Universe' as const, fxType: 'universe' },
    { id: 'g_sun', name: 'Solar Flare', icon: '☀️', coins: 14000, category: 'Universe' as const, fxType: 'universe' },
    { id: 'g_moon_base', name: 'Lunar Colony', icon: '🌕', coins: 16000, category: 'Universe' as const, fxType: 'universe' },
    { id: 'g_nebula', name: 'Orion Nebula', icon: '✨', coins: 17500, category: 'Universe' as const, fxType: 'universe' },
    { id: 'g_cyber_car', name: 'Cybertruck Titan', icon: '🛻', coins: 5500, category: 'Universe' as const, fxType: 'car' },
    { id: 'g_time_machine', name: 'Time Machine', icon: '⌛', coins: 13000, category: 'Universe' as const, fxType: 'magic' },
    { id: 'g_aurora', name: 'Aurora Borealis', icon: '🌌', coins: 8500, category: 'Universe' as const, fxType: 'universe' },
    { id: 'g_stargate', name: 'Quantum Stargate', icon: '🌀', coins: 18000, category: 'Universe' as const, fxType: 'universe' },
    { id: 'g_solar_sail', name: 'Photon Solar Sail', icon: '⛵', coins: 6800, category: 'Universe' as const, fxType: 'jet' },
    { id: 'g_meteor', name: 'Golden Meteor Shower', icon: '🌠', coins: 9500, category: 'Universe' as const, fxType: 'universe' },
    { id: 'g_milkyway', name: 'Milky Way Galaxy', icon: '🪐', coins: 19000, category: 'Universe' as const, fxType: 'universe' },
    { id: 'g_portal', name: 'Interdimensional Portal', icon: '🔮', coins: 19999, category: 'Universe' as const, fxType: 'universe' },

    // Imperial (20,000 - 100,000 coins)
    { id: 'g_jagx_emperor', name: 'JagX Emperor Crown', icon: '👑', coins: 20000, category: 'Imperial' as const, fxType: 'crown' },
    { id: 'g_god_lion', name: 'Celestial Lion God', icon: '🦁', coins: 25000, category: 'Imperial' as const, fxType: 'lion' },
    { id: 'g_mythic_dragon', name: 'Ancient Gold Dragon', icon: '🐉', coins: 35000, category: 'Imperial' as const, fxType: 'dragon' },
    { id: 'g_cyber_city', name: 'Neo Lagos Metropolis', icon: '🌆', coins: 40000, category: 'Imperial' as const, fxType: 'castle' },
    { id: 'g_zeus', name: 'Zeus Lightning Throne', icon: '⚡', coins: 50000, category: 'Imperial' as const, fxType: 'magic' },
    { id: 'g_atlantis', name: 'Sunken Atlantis', icon: '🏛️', coins: 60000, category: 'Imperial' as const, fxType: 'castle' },
    { id: 'g_galaxy_king', name: 'Galactic Overlord', icon: '🌌', coins: 75000, category: 'Imperial' as const, fxType: 'universe' },
    { id: 'g_multiverse', name: 'Multiverse Core', icon: '🔮', coins: 88000, category: 'Imperial' as const, fxType: 'universe' },
    { id: 'g_god_phoenix', name: 'Immortal Sun Phoenix', icon: '🦅', coins: 95000, category: 'Imperial' as const, fxType: 'phoenix' },
    { id: 'g_universe_sovereign', name: 'Universe Sovereign', icon: '🪐', coins: 100000, category: 'Imperial' as const, fxType: 'universe' },
    { id: 'g_infinity_gauntlet', name: 'Infinity Gauntlet', icon: '🥊', coins: 22000, category: 'Imperial' as const, fxType: 'magic' },
    { id: 'g_excalibur', name: 'Excalibur Blade', icon: '🗡️', coins: 28000, category: 'Imperial' as const, fxType: 'magic' },
    { id: 'g_pyramid', name: 'Golden Pharaoh Pyramid', icon: '🛕', coins: 32000, category: 'Imperial' as const, fxType: 'castle' },
    { id: 'g_valhalla', name: 'Hall of Valhalla', icon: '🛡️', coins: 45000, category: 'Imperial' as const, fxType: 'castle' },
    { id: 'g_black_hole_god', name: 'Singularity Core', icon: '🕳️', coins: 55000, category: 'Imperial' as const, fxType: 'universe' },
    { id: 'g_time_lord', name: 'Chrono Time Sovereign', icon: '⏳', coins: 65000, category: 'Imperial' as const, fxType: 'universe' },
    { id: 'g_web3_god', name: 'Genesis Block Core', icon: '🧱', coins: 70000, category: 'Imperial' as const, fxType: 'magic' },
    { id: 'g_sun_god', name: 'Ra Sun Chariot', icon: '🛞', coins: 80000, category: 'Imperial' as const, fxType: 'phoenix' },
    { id: 'g_titan', name: 'Cosmic Titan Golem', icon: '🤖', coins: 90000, category: 'Imperial' as const, fxType: 'dragon' },
    { id: 'g_omega', name: 'Omega Supreme JagX', icon: '💎', coins: 99999, category: 'Imperial' as const, fxType: 'universe' }
  ];

  const handleSendTikTokGift = (gift: typeof GENERATED_TIKTOK_GIFTS[0]) => {
    const totalCost = gift.coins * giftMultiplier;
    if (userCoins < totalCost) {
      triggerHaptic(60);
      triggerToast(`⚠️ Insufficient JagX Coins! Need 🪙${totalCost.toLocaleString()}`);
      return;
    }

    // Deduct coins & trigger unique Coin Toss haptic pattern
    setUserCoins(prev => prev - totalCost);
    triggerHaptic([20, 40, 20, 40, 80, 140]);

    // Trigger Coin Toss effect
    setActiveCoinToss({ id: `ct_${Date.now()}`, giftName: gift.name });
    setTimeout(() => setActiveCoinToss(null), 1600);

    // Update Daily Mission Progress (m2: Send 1 Virtual Gift)
    updateMissionProgress('m2');

    // Live Stream Gifting Streak Logic
    const now = Date.now();
    const isStreakActive = giftingStreak.lastGiftTime > 0 && (now - giftingStreak.lastGiftTime < 45000);
    const newCount = isStreakActive ? giftingStreak.count + 1 : 1;
    let newMultiplier = 1.0;
    let streakBonusCoins = 0;

    if (newCount >= 10) {
      newMultiplier = 2.0;
      streakBonusCoins = 100;
    } else if (newCount >= 5) {
      newMultiplier = 1.5;
      streakBonusCoins = 50;
    } else if (newCount >= 3) {
      newMultiplier = 1.2;
      streakBonusCoins = 20;
    }

    if (streakBonusCoins > 0 && (newCount === 3 || newCount === 5 || newCount === 10)) {
      setUserCoins(prev => prev + streakBonusCoins);
      triggerToast(`🔥 GIFTING STREAK x${newCount}! Awarded +🪙${streakBonusCoins} Bonus Coins & ${newMultiplier}x Multiplier! 🚀`);
    }

    setGiftingStreak({
      hostHandle: activeLiveRoom ? activeLiveRoom.hostName : '@davido_official',
      count: newCount,
      multiplier: newMultiplier,
      lastGiftTime: now,
      unlockedBonusCoins: giftingStreak.unlockedBonusCoins + streakBonusCoins
    });

    // Trigger full-screen animation FX
    setActiveGiftFx({
      giftName: gift.name,
      giftIcon: gift.icon,
      giftCoins: totalCost,
      senderName: currentUser?.name || 'Tajudeen Gbadamosi',
      category: gift.category,
      multiplier: giftMultiplier,
      fxType: gift.fxType
    });

    // Automatically dismiss FX after 2.8s
    setTimeout(() => {
      setActiveGiftFx(null);
    }, 2800);

    // Increment gift count on active post if open
    if (showGiftModal) {
      setPosts(prev => prev.map(p => p.id === showGiftModal ? { ...p, giftsCount: p.giftsCount + giftMultiplier } : p));
    }

    // Add message to live stream chat if live stream is active
    if (activeLiveRoom) {
      setLiveStreamMessages(prev => [
        ...prev,
        {
          id: `lm_${Date.now()}`,
          user: currentUser?.name || 'Tajudeen Gbadamosi',
          text: `🎁 SENT ${giftMultiplier > 1 ? `x${giftMultiplier} ` : ''}${gift.icon} ${gift.name} (🪙${totalCost.toLocaleString()})! 🔥 Streak x${newCount}`,
          avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
        }
      ]);
    }

    triggerToast(`🎉 Sent ${giftMultiplier > 1 ? `x${giftMultiplier} ` : ''}${gift.icon} ${gift.name} (🪙${totalCost.toLocaleString()})!`);
    setShowGiftModal(null);
  };

  const handleGiftCoins = (amount: number) => {
    if (userCoins < amount) {
      triggerHaptic(50);
      triggerToast('Insufficient JagX Coins balance!');
      return;
    }
    triggerHaptic([50, 100, 50]);
    setUserCoins(userCoins - amount);
    triggerToast(`Sent ${amount} JagX Coins gift! 🪙`);
    setShowGiftModal(null);
  };

  // Persistent Caching & Supabase Realtime Subscription
  useEffect(() => {
    // Load cached posts if available
    const cachedPosts = loadOfflineCache<Post[]>('posts', []);
    if (cachedPosts && cachedPosts.length > 0) {
      setPosts(cachedPosts);
    }

    // Supabase Realtime setup if configured
    if (isSupabaseConfigured()) {
      const channel = supabase
        .channel('public_posts')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'posts' },
          (payload) => {
            if (payload.eventType === 'INSERT' && payload.new) {
              const newPost = payload.new as Post;
              setPosts((prev) => [newPost, ...prev]);
              triggerToast('⚡ New post received via Supabase Realtime!');
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  // Save offline cache whenever posts change
  useEffect(() => {
    if (posts && posts.length > 0) {
      saveOfflineCache('posts', posts);
    }
  }, [posts]);

  const handleCreatePostSubmit = async (text: string) => {
    if (!text.trim() && !selectedImageForPost && !selectedVideoForPost) {
      triggerToast('⚠️ Write something or attach media first.');
      return;
    }
    setIsPublishingPost(true);

    const authorName = currentUser?.name || 'Tajudeen Gbadamosi';
    const authorHandle = currentUser?.handle || '@jagx_tajudeen';
    const authorAvatar = currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80';

    let finalImageUrl = selectedImageForPost || undefined;
    let finalVideoUrl = selectedVideoForPost || undefined;

    // If the user picked a real file from their device, upload it to Supabase
    // Storage so it gets a stable public URL instead of a giant data: URL.
    if (isSupabaseConfigured() && selectedPostMediaFile && currentUser?.id) {
      const ext = selectedPostMediaFile.name.split('.').pop() || 'bin';
      const path = `${currentUser.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('post-media')
        .upload(path, selectedPostMediaFile, { upsert: false });

      if (uploadError) {
        triggerToast(`⚠️ Media upload failed: ${uploadError.message}`);
        setIsPublishingPost(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from('post-media').getPublicUrl(path);
      if (selectedPostMediaFile.type.startsWith('video/')) {
        finalVideoUrl = publicUrlData.publicUrl;
        finalImageUrl = undefined;
      } else {
        finalImageUrl = publicUrlData.publicUrl;
        finalVideoUrl = undefined;
      }
    }

    const localId = `p_${Date.now()}`;
    const newP: Post = {
      id: localId,
      authorName,
      authorHandle,
      authorAvatar,
      timestamp: 'Just now',
      content: text,
      imageUrl: finalImageUrl,
      videoUrl: finalVideoUrl,
      likesCount: 0,
      commentsCount: 0,
      giftsCount: 0,
      isLiked: false,
      isSaved: false
    };

    // Push to Supabase if configured — the realtime subscription (see
    // useEffect below) will also receive this insert and reconcile the
    // local temp id with the real DB id, and will deliver it live to
    // every other connected device.
    if (isSupabaseConfigured() && currentUser?.id) {
      const { error } = await supabase.from('posts').insert([{
        author_id: currentUser.id,
        content: text,
        author_name: authorName,
        author_handle: authorHandle,
        author_avatar: authorAvatar,
        image_url: finalImageUrl || null,
        video_url: finalVideoUrl || null
      }]);
      if (error) {
        triggerToast(`⚠️ Post saved locally only — Supabase insert failed: ${error.message}`);
      }
    }

    setPosts([newP, ...posts]);
    setShowCreatePost(false);
    setSelectedImageForPost(null);
    setSelectedVideoForPost(null);
    setSelectedPostMediaFile(null);
    setShowImagePicker(false);
    setIsPublishingPost(false);
    triggerToast('Post published successfully!');
  };

  // Live-load posts from Supabase and keep them updated in real time across
  // every device — this is what makes posting actually "real time" instead
  // of only visible to the person who created it.
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let cancelled = false;

    supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        setPosts(
          data.map((row: any): Post => ({
            id: row.id,
            authorName: row.author_name,
            authorHandle: row.author_handle,
            authorAvatar: row.author_avatar,
            timestamp: new Date(row.created_at).toLocaleString(),
            content: row.content,
            imageUrl: row.image_url || undefined,
            videoUrl: row.video_url || undefined,
            likesCount: row.likes_count ?? 0,
            commentsCount: row.comments_count ?? 0,
            giftsCount: row.gifts_count ?? 0,
            isLiked: false,
            isSaved: false,
            isSponsored: row.is_sponsored ?? false,
            language: row.language || 'en'
          }))
        );
      });

    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
        const row: any = payload.new;
        setPosts((prev) => {
          // Avoid duplicating a post we already added optimistically ourselves
          if (prev.some((p) => p.id === row.id)) return prev;
          const incoming: Post = {
            id: row.id,
            authorName: row.author_name,
            authorHandle: row.author_handle,
            authorAvatar: row.author_avatar,
            timestamp: 'Just now',
            content: row.content,
            imageUrl: row.image_url || undefined,
            videoUrl: row.video_url || undefined,
            likesCount: row.likes_count ?? 0,
            commentsCount: row.comments_count ?? 0,
            giftsCount: row.gifts_count ?? 0,
            isLiked: false,
            isSaved: false,
            isSponsored: row.is_sponsored ?? false,
            language: row.language || 'en'
          };
          return [incoming, ...prev.filter((p) => !p.id.startsWith('p_'))];
        });
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCreateProductSubmit = async () => {
    if (!newProductTitle.trim()) return;
    setIsPublishingProduct(true);

    const sellerName = currentUser?.name || 'JagX Seller';
    let finalImageUrl = newProductImagePreview || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';

    if (isSupabaseConfigured() && newProductImageFile && currentUser?.id) {
      const ext = newProductImageFile.name.split('.').pop() || 'jpg';
      const path = `${currentUser.id}/products/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('post-media')
        .upload(path, newProductImageFile, { upsert: false });
      if (uploadError) {
        triggerToast(`⚠️ Photo upload failed: ${uploadError.message}`);
        setIsPublishingProduct(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from('post-media').getPublicUrl(path);
      finalImageUrl = publicUrlData.publicUrl;
    }

    const localId = `prod_${Date.now()}`;
    const newProd: Product = {
      id: localId,
      title: newProductTitle.trim(),
      description: newProductDescription.trim(),
      priceCoins: parseInt(newProductPriceCoins) || 0,
      priceUsd: parseFloat(newProductPriceUsd) || 0,
      category: 'general',
      imageUrl: finalImageUrl,
      sellerName
    };

    if (isSupabaseConfigured() && currentUser?.id) {
      const { error } = await supabase.from('products').insert([{
        seller_id: currentUser.id,
        seller_name: sellerName,
        title: newProd.title,
        description: newProd.description,
        price_coins: newProd.priceCoins,
        price_usd: newProd.priceUsd,
        category: newProd.category,
        image_url: finalImageUrl
      }]);
      if (error) triggerToast(`⚠️ Listed locally only — Supabase insert failed: ${error.message}`);
    }

    setProducts(prev => [newProd, ...prev]);
    setShowCreateProduct(false);
    setNewProductTitle('');
    setNewProductDescription('');
    setNewProductPriceCoins('');
    setNewProductPriceUsd('');
    setNewProductImageFile(null);
    setNewProductImagePreview(null);
    setIsPublishingProduct(false);
    triggerToast('🛍️ Listing published!');
  };

  // Live-load marketplace listings and keep them synced in real time
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let cancelled = false;

    supabase.from('products').select('*').order('created_at', { ascending: false }).limit(100)
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        setProducts(data.map((row: any): Product => ({
          id: row.id,
          title: row.title,
          description: row.description,
          priceCoins: row.price_coins,
          priceUsd: Number(row.price_usd),
          category: row.category,
          imageUrl: row.image_url,
          sellerName: row.seller_name
        })));
      });

    const channel = supabase
      .channel('public:products')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'products' }, (payload) => {
        const row: any = payload.new;
        setProducts((prev) => {
          if (prev.some((p) => p.id === row.id)) return prev;
          const incoming: Product = {
            id: row.id,
            title: row.title,
            description: row.description,
            priceCoins: row.price_coins,
            priceUsd: Number(row.price_usd),
            category: row.category,
            imageUrl: row.image_url,
            sellerName: row.seller_name
          };
          return [incoming, ...prev.filter((p) => !p.id.startsWith('prod_'))];
        });
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'products' }, (payload) => {
        const oldRow: any = payload.old;
        setProducts((prev) => prev.filter((p) => p.id !== oldRow.id));
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  // Live-load this user's notifications and keep them synced in real time
  useEffect(() => {
    if (!isSupabaseConfigured() || !currentUser?.id) return;
    let cancelled = false;

    supabase.from('notifications').select('*').eq('user_id', currentUser.id)
      .order('created_at', { ascending: false }).limit(100)
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        setNotifications(data.map((row: any): AppNotification => ({
          id: row.id,
          title: row.title,
          desc: row.description,
          timestamp: new Date(row.created_at).toLocaleString(),
          read: row.read,
          type: row.type
        })));
      });

    const channel = supabase
      .channel(`notifications-${currentUser.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${currentUser.id}` }, (payload) => {
        const row: any = payload.new;
        setNotifications((prev) => {
          if (prev.some((n) => n.id === row.id)) return prev;
          return [{
            id: row.id,
            title: row.title,
            desc: row.description,
            timestamp: 'Just now',
            read: row.read,
            type: row.type
          }, ...prev];
        });
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id]);

  // Join/leave a real live-chat broadcast channel whenever the user opens
  // or closes a live room — this is what makes live chat actually live
  // across every device watching the same stream, not just the sender's.
  useEffect(() => {
    if (!isSupabaseConfigured() || !activeLiveRoom) {
      liveChatChannelRef.current = null;
      return;
    }
    const channel = supabase.channel(`live-room-${activeLiveRoom.id}`);
    channel
      .on('broadcast', { event: 'chat' }, (payload) => {
        const msg = payload.payload as { id: string; user: string; text: string; avatar: string };
        setLiveStreamMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      })
      .subscribe();
    liveChatChannelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      liveChatChannelRef.current = null;
    };
  }, [activeLiveRoom?.id]);

  const sendLiveChatMessage = (text: string) => {
    if (!text.trim()) return;
    const newEntry = {
      id: `lm_${Date.now()}`,
      user: currentUser?.name || 'Tajudeen',
      text: text.trim(),
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'
    };
    setLiveStreamMessages((prev) => [...prev, newEntry]);
    liveChatChannelRef.current?.send({ type: 'broadcast', event: 'chat', payload: newEntry });
    setNewLiveMsgText('');
    triggerHaptic(40);
  };



  // Camera stream initializer for QR Scanner modal
  useEffect(() => {
    if (showQrScannerModal) {
      setIsCameraActive(true);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
          .then(stream => {
            if (qrVideoRef.current) {
              qrVideoRef.current.srcObject = stream;
            }
          })
          .catch(err => {
            console.log('Camera access notice:', err);
          });
      }
    } else {
      setIsCameraActive(false);
      if (qrVideoRef.current && qrVideoRef.current.srcObject) {
        const stream = qrVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        qrVideoRef.current.srcObject = null;
      }
    }
  }, [showQrScannerModal]);

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0C10] text-[#F1F5F9] max-w-md mx-auto relative border-x border-[#1F222C] shadow-2xl">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1F222C] border border-yellow-500 text-yellow-400 px-4 py-2 rounded-full text-xs font-semibold shadow-lg flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Simulated Capacitor Push Notification Banner Toast */}
      {simulatedPushToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#14161D] border-2 border-yellow-500 text-white px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-200 max-w-xs w-full">
          <div className="p-2 rounded-full bg-yellow-500/20 text-yellow-400 shrink-0">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="font-bold text-yellow-400 truncate text-[11px]">{simulatedPushToast.title}</h5>
            <p className="text-[10px] text-gray-300 truncate">{simulatedPushToast.body}</p>
          </div>
          <button onClick={() => setSimulatedPushToast(null)} className="text-gray-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TOP HEADER BAR */}
      <header className="sticky top-0 z-40 bg-[#14161D]/90 backdrop-blur-md px-3 py-2.5 border-b border-[#1F222C] flex items-center justify-between" style={{ paddingTop: 'calc(0.625rem + env(safe-area-inset-top))' }}>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-black tracking-tight ${accentColors.text}`}>JagX Connect</span>
          
          {/* Connection Status Pill */}
          <button 
            onClick={() => setShowSupabaseConfigInfo(true)}
            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border transition ${
              isSupabaseConfigured() 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
            }`}
            title="Connection status"
          >
            {isSupabaseConfigured() ? <Wifi className="w-3 h-3" /> : <Database className="w-3 h-3" />}
            <span className="hidden sm:inline">{isSupabaseConfigured() ? 'Connected' : 'Offline Mode'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <button 
            onClick={() => setShowNotificationsDrawer(true)} 
            className="relative p-1 text-gray-400 hover:text-white"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {notifications.some(n => !n.read) && (
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>

          {/* Wallet Balance Pill */}
          <button 
            onClick={() => setActiveTab('wallet')}
            className="flex items-center gap-1 bg-[#1F222C] border border-yellow-500/30 px-2.5 py-1 rounded-full text-xs font-bold hover:border-yellow-500 transition-all"
          >
            <span>🪙</span>
            <span className="text-yellow-400">{userCoins}</span>
          </button>

          {/* User Auth Avatar / Login Button */}
          {currentUser ? (
            <button 
              onClick={() => setActiveTab('profile')} 
              className="relative group p-0.5 rounded-full border border-yellow-500/50"
              title={`Logged in as ${currentUser.name}`}
            >
              <img src={currentUser.avatar} className="w-7 h-7 rounded-full object-cover" />
            </button>
          ) : (
            <button 
              onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
              className="flex items-center gap-1 bg-yellow-500 text-black px-2.5 py-1 rounded-full text-xs font-bold hover:bg-yellow-400 transition"
            >
              <User className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}

          <button 
            onClick={() => {
              triggerHaptic(30);
              setShowQrScannerModal(true);
            }} 
            className="p-1 text-yellow-400 hover:text-white transition"
            title="Scan QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>

          <button onClick={() => setShowSettings(true)} className="p-1 text-gray-400 hover:text-white">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN SCREEN CONTENT */}
      <main className="flex-1 pb-20">
        {/* 1. FEED SCREEN */}
        {activeTab === 'feed' && (
          <div className="space-y-3 py-2">
            {/* LIVE SPORTS, CRYPTO & STREAM GIFTS TICKER BANNER */}
            <div className="mx-3 bg-[#14161D] border border-yellow-500/30 rounded-2xl p-2 flex items-center justify-between text-xs overflow-hidden shadow-md">
              <div className="flex items-center gap-2 overflow-hidden flex-1">
                <span className="bg-yellow-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 animate-pulse uppercase">
                  ⚡ LIVE TICKER
                </span>
                <span className="text-gray-200 font-bold truncate text-[11px] animate-in fade-in duration-300">
                  {tickerItems[tickerActiveIndex]}
                </span>
              </div>
              <button 
                onClick={() => setTickerActiveIndex((prev) => (prev + 1) % tickerItems.length)}
                className="text-[10px] text-yellow-400 font-extrabold ml-2 hover:underline shrink-0"
              >
                Next ▶
              </button>
            </div>

            {/* QUICK FEATURE CHIPS (VIP, Vault Staking, DAO, AI Studio) */}
            <div className="px-3 flex items-center gap-2 overflow-x-auto scrollbar-none text-[10px] font-extrabold">
              <button 
                onClick={() => {
                  triggerHaptic(30);
                  setShowVaultModal(true);
                }}
                className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-yellow-400 border border-yellow-500/40 px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1 hover:bg-yellow-500/30 transition"
              >
                <span>🏦 Yield Vault (12% APY)</span>
              </button>

              <button 
                onClick={() => {
                  triggerHaptic(30);
                  setShowDaoVotingModal(true);
                }}
                className="bg-purple-500/20 text-purple-300 border border-purple-500/40 px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1 hover:bg-purple-500/30 transition"
              >
                <span>🏛️ Community DAO</span>
              </button>

              <button 
                onClick={() => {
                  triggerHaptic(30);
                  setShowSubscriptionModal({ creatorName: 'Davido Official', handle: '@davido_official', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' });
                }}
                className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1 hover:bg-emerald-500/30 transition"
              >
                <span>👑 VIP Creator Tiers</span>
              </button>

              <button 
                onClick={() => {
                  triggerHaptic(30);
                  setShowAiImageStudioModal(true);
                }}
                className="bg-blue-500/20 text-blue-300 border border-blue-500/40 px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1 hover:bg-blue-500/30 transition"
              >
                <span>🎨 AI Image Studio</span>
              </button>
            </div>

            {/* Search Bar & Hashtags at Top of Feed */}
            <div className="px-4 space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  value={feedSearchQuery}
                  onChange={e => setFeedSearchQuery(e.target.value)}
                  placeholder="Search feed by hashtags (#Tech), creators (@aisha)..."
                  className="w-full bg-[#14161D] border border-[#1F222C] rounded-full pl-9 pr-8 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 transition"
                />
                {feedSearchQuery && (
                  <button onClick={() => setFeedSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Trending Hashtag Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] font-semibold">
                {['#All', '#Tech', '#Web3', '#AI', '#Crypto', '#JagX'].map(tag => {
                  const isActive = (tag === '#All' && !activeHashtagFilter) || activeHashtagFilter === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        if (tag === '#All') setActiveHashtagFilter(null);
                        else setActiveHashtagFilter(activeHashtagFilter === tag ? null : tag);
                      }}
                      className={`px-3 py-0.5 rounded-full border transition whitespace-nowrap ${
                        isActive 
                          ? 'bg-yellow-500 text-black border-yellow-500 font-bold' 
                          : 'bg-[#14161D] border-[#1F222C] text-gray-400 hover:text-white'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pull to refresh control */}
            <div className="px-4 flex justify-between items-center text-xs text-gray-400">
              <span className="font-semibold text-gray-400">Main Feed</span>
              <button 
                onClick={handleRefreshFeedWithSkeleton}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 bg-[#1F222C] hover:bg-gray-800 border border-gray-700 text-yellow-400 px-3 py-1 rounded-full text-[11px] font-bold transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Pull to Refresh'}</span>
              </button>
            </div>

            {/* Deep Link Active Notice Banner */}
            {deepLinkNotice && (
              <div className="mx-4 bg-yellow-500/10 border border-yellow-500/30 p-2.5 rounded-xl flex items-center justify-between text-xs text-yellow-400 font-bold">
                <span>{deepLinkNotice}</span>
                <button onClick={() => setDeepLinkNotice(null)} className="text-gray-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Focus Mode Active Banner */}
            {isFocusMode && (
              <div className="mx-4 bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border border-yellow-500/40 p-3 rounded-2xl flex items-center justify-between text-xs font-bold text-yellow-400 shadow-lg">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-yellow-400 animate-pulse" />
                  <div>
                    <span>🎯 Focus Mode Active</span>
                    <p className="text-[10px] text-gray-300 font-normal">Showing Close Friends posts only. Ads & recommendations hidden.</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsFocusMode(false);
                    triggerHaptic(30);
                    triggerToast('Focus Mode turned off');
                  }}
                  className="text-[10px] bg-yellow-500 text-black px-2.5 py-1 rounded-lg font-black hover:bg-yellow-400 transition"
                >
                  Disable
                </button>
              </div>
            )}

            {/* Stories Tray */}
            <div className="px-4">
              <p className="text-xs font-bold text-gray-400 mb-2">Stories & Highlights</p>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                <div 
                  onClick={() => triggerToast('📸 Story uploader active! Tap to publish temporary highlight.')}
                  className="flex flex-col items-center gap-1 min-w-[60px] cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-full bg-[#1F222C] flex items-center justify-center border-2 border-dashed border-yellow-500/50 hover:border-yellow-400 transition relative">
                    <Plus className="w-5 h-5 text-yellow-400" />
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">Add Story</span>
                </div>
                {stories.map(s => (
                  <div 
                    key={s.id} 
                    onClick={() => setStoryViewersModal({
                      storyName: `${s.userName}'s Highlight`,
                      viewers: [
                        { name: 'Aisha Bello', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', time: '2m ago' },
                        { name: 'Kemi Adebayo', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80', time: '14m ago' },
                        { name: 'Davido Official', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', time: '1h ago' }
                      ]
                    })}
                    className="flex flex-col items-center gap-1 min-w-[60px] cursor-pointer group"
                  >
                    <div className="p-0.5 rounded-full bg-gradient-to-tr from-yellow-500 to-pink-500 group-hover:scale-105 transition">
                      <img src={s.userAvatar} alt={s.userName} className="w-12 h-12 rounded-full object-cover border-2 border-[#0B0C10]" />
                    </div>
                    <span className="text-[10px] text-gray-300 font-medium truncate w-14 text-center">{s.userName}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Post trigger card */}
            <div className="px-4">
              <div 
                onClick={() => setShowCreatePost(true)}
                className="bg-[#14161D] border border-[#1F222C] p-3 rounded-xl flex items-center gap-3 cursor-pointer hover:border-gray-700 transition"
              >
                <img src={currentUser?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"} className="w-8 h-8 rounded-full object-cover" />
                <span className="text-xs text-gray-400">What's happening on JagX today?</span>
              </div>
            </div>

            {/* Posts List or Skeleton Screen */}
            <div className="space-y-4 px-4">
              {isLoadingData ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-[#14161D] border border-[#1F222C] rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-800 rounded-full" />
                        <div className="space-y-1 flex-1">
                          <div className="h-3 bg-gray-800 rounded w-1/3" />
                          <div className="h-2 bg-gray-800/60 rounded w-1/4" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-800 rounded w-full" />
                        <div className="h-3 bg-gray-800 rounded w-5/6" />
                        <div className="h-3 bg-gray-800 rounded w-2/3" />
                      </div>
                      <div className="h-36 bg-gray-800/80 rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : (
                posts
                  .filter(p => !blockedUsers.includes(p.authorHandle))
                  .filter(p => {
                    if (isFocusMode) {
                      if (p.isSponsored) return false;
                      return p.isCloseFriend === true || p.authorHandle === currentUser?.handle;
                    }
                    return true;
                  })
                  .filter(p => {
                    if (!feedSearchQuery.trim()) return true;
                    const q = feedSearchQuery.toLowerCase();
                    return p.content.toLowerCase().includes(q) ||
                           p.authorName.toLowerCase().includes(q) ||
                           p.authorHandle.toLowerCase().includes(q) ||
                           p.id.toLowerCase() === q;
                  })
                  .map(post => (
                  <div 
                    key={post.id} 
                    onTouchStart={(e) => {
                      const timer = setTimeout(() => {
                        triggerHaptic([40, 80]);
                        setRadialQuickActionPost(post);
                      }, 550);
                      (e.currentTarget as any)._longPressTimer = timer;
                    }}
                    onTouchEnd={(e) => {
                      if ((e.currentTarget as any)._longPressTimer) {
                        clearTimeout((e.currentTarget as any)._longPressTimer);
                      }
                    }}
                    className="bg-[#14161D] border border-[#1F222C] hover:border-gray-800 rounded-2xl p-4 space-y-3 relative group transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={post.authorAvatar} className="w-10 h-10 rounded-full object-cover border border-[#1F222C]" />
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-1">
                            {post.authorName}
                            <CheckCircle className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400/20" />
                            {post.isCloseFriend && (
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-full border border-emerald-500/30 font-bold">
                                ⭐ Close Friend
                              </span>
                            )}
                            {post.isSponsored && (
                              <span className="text-[9px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.2 rounded-full border border-yellow-500/30 font-bold">
                                Promoted
                              </span>
                            )}
                          </h4>
                          <p className="text-[11px] text-gray-400">{post.authorHandle} • {post.timestamp}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Estimated Reading Time Indicator */}
                        <span className="text-[10px] text-gray-300 font-medium bg-[#1F222C] px-2 py-0.5 rounded-full flex items-center gap-1 border border-gray-800" title="Estimated reading duration">
                          <Clock className="w-3 h-3 text-yellow-400" />
                          <span>{calculateReadingTime(post.content)}</span>
                        </span>

                        {/* Quick Actions Radial Trigger */}
                        <button 
                          onClick={() => {
                            triggerHaptic([30, 60]);
                            setRadialQuickActionPost(post);
                          }}
                          title="Quick Actions (Hold post or tap)"
                          className="p-1 text-gray-400 hover:text-yellow-400 bg-gray-800/40 rounded-full transition"
                        >
                          <Zap className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete post button */}
                        <button 
                          onClick={() => setConfirmDeleteModal({ type: 'post', id: post.id })}
                          title="Delete post"
                          className="p-1.5 text-gray-500 hover:text-red-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Read More / Show Less Toggle for Long Post Content */}
                    {(() => {
                      const isExpanded = !!expandedPostIds[post.id];
                      const isLong = post.content.length > 120;
                      const displayContent = (!isLong || isExpanded) ? post.content : `${post.content.slice(0, 120)}...`;
                      return (
                        <div className="space-y-1">
                          <p className="text-xs leading-relaxed text-gray-200">{displayContent}</p>
                          {isLong && (
                            <button 
                              onClick={() => setExpandedPostIds(prev => ({ ...prev, [post.id]: !isExpanded }))}
                              className="text-[11px] font-bold text-yellow-400 hover:underline flex items-center gap-0.5 inline-flex"
                            >
                              <span>{isExpanded ? 'Show Less' : 'Read More'}</span>
                              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                          )}
                        </div>
                      );
                    })()}

                    {/* Translate Post Action & Display */}
                    <div className="pt-0.5">
                      {!postTranslations[post.id] ? (
                        <button 
                          onClick={() => {
                            triggerHaptic(25);
                            setPostTranslations(prev => ({
                              ...prev,
                              [post.id]: {
                                translatedText: post.language === 'fr' 
                                  ? 'Hello everyone! We are very excited to present the new version of JagX Connect. The Web3 network is incredible! 🚀✨ #Tech #Web3'
                                  : `Translated (${post.language || 'Detected'} → English): "${post.content}"`,
                                sourceLang: post.language === 'fr' ? 'French' : 'Native Dialect',
                                isTranslating: false
                              }
                            }));
                            triggerToast('🌐 Post translated using JagX AI Translate API');
                          }}
                          className="text-[11px] font-bold text-yellow-400 hover:underline flex items-center gap-1 opacity-90 hover:opacity-100 transition inline-flex"
                        >
                          <Languages className="w-3.5 h-3.5" />
                          <span>Translate Post</span>
                        </button>
                      ) : (
                        <div className="bg-[#1F222C] border border-yellow-500/30 p-2.5 rounded-xl space-y-1 text-xs animate-in fade-in duration-150">
                          <div className="flex items-center justify-between text-[10px] text-yellow-400 font-bold">
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3 text-yellow-400" />
                              <span>Translated from {postTranslations[post.id].sourceLang} • JagX AI Translate</span>
                            </span>
                            <button 
                              onClick={() => setPostTranslations(prev => {
                                const next = { ...prev };
                                delete next[post.id];
                                return next;
                              })} 
                              className="text-gray-400 hover:text-white underline text-[10px]"
                            >
                              Hide Translation
                            </button>
                          </div>
                          <p className="text-gray-200 text-xs italic font-medium">{postTranslations[post.id].translatedText}</p>
                        </div>
                      )}
                    </div>

                    {/* Interactive Poll Widget */}
                    {post.poll && (
                      <div className="bg-[#1F222C]/80 border border-yellow-500/30 p-3.5 rounded-2xl space-y-3 shadow-md">
                        <div className="flex items-center justify-between border-b border-gray-800/80 pb-2">
                          <p className="text-xs font-black text-yellow-400 flex items-center gap-1.5">
                            <BarChart3 className="w-4 h-4 text-yellow-400" />
                            <span>{post.poll.question}</span>
                          </p>
                          <span className="text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                            {post.poll.totalVotes} Votes
                          </span>
                        </div>

                        <div className="space-y-2 pt-0.5">
                          {post.poll.options.map(opt => {
                            const percent = post.poll!.totalVotes > 0 ? Math.round((opt.votes / post.poll!.totalVotes) * 100) : 0;
                            const isSelected = post.poll!.userVotedOptionId === opt.id;
                            return (
                              <button
                                key={opt.id}
                                onClick={() => handleVotePoll(post.id, opt.id)}
                                className={`w-full text-left relative overflow-hidden p-2.5 rounded-xl border text-xs transition-all duration-300 group ${
                                  isSelected 
                                    ? 'border-yellow-400 bg-yellow-500/15 font-bold text-white shadow-[0_0_15px_rgba(234,179,8,0.25)]' 
                                    : 'border-gray-800 bg-[#14161D] text-gray-200 hover:border-gray-700'
                                }`}
                              >
                                {/* Smooth Animated Bar Transition with Cubic Bezier & Glow */}
                                <div 
                                  className={`absolute left-0 top-0 bottom-0 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                                    isSelected 
                                      ? 'bg-gradient-to-r from-yellow-500/40 via-amber-400/50 to-yellow-500/30 border-r-2 border-yellow-400' 
                                      : 'bg-gradient-to-r from-yellow-500/20 via-amber-500/25 to-yellow-500/15'
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                                
                                <div className="relative z-10 flex items-center justify-between gap-2">
                                  <span className="flex items-center gap-1.5 font-medium">
                                    {isSelected && <CheckCircle className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400/20 shrink-0" />}
                                    <span className={isSelected ? 'text-yellow-300 font-black' : 'text-gray-200'}>{opt.text}</span>
                                  </span>
                                  <span className="text-[11px] text-yellow-400 font-mono font-black shrink-0 transition-all duration-500 transform group-hover:scale-105">
                                    {percent}% <span className="text-[9px] text-gray-400 font-normal">({opt.votes})</span>
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Poll Widget Bottom Action Bar */}
                        <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between gap-2 text-[11px]">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                triggerHaptic(30);
                                setSharePollModalPost(post);
                              }}
                              className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-extrabold px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition active:scale-95"
                            >
                              <Share2 className="w-3 h-3" />
                              <span>Share Poll</span>
                            </button>

                            <button
                              onClick={() => {
                                triggerHaptic(30);
                                setShowPollAnalyticsModal(post);
                                setAnalyticsSelectedOptionId('all');
                              }}
                              className="bg-[#14161D] hover:bg-gray-800 text-gray-300 border border-gray-800 font-extrabold px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition active:scale-95"
                            >
                              <BarChart3 className="w-3 h-3 text-yellow-400" />
                              <span>Analytics API</span>
                            </button>
                          </div>

                          <span className="text-[10px] text-gray-400 font-mono font-medium">
                            {post.poll.userVotedOptionId ? '✓ Voted' : 'Tap option to vote'}
                          </span>
                        </div>
                      </div>
                    )}

                    {post.imageUrl && (
                      <img src={post.imageUrl} className="w-full h-48 object-cover rounded-xl border border-[#1F222C]" />
                    )}

                    {post.videoUrl && (
                      <video src={post.videoUrl} controls playsInline className="w-full h-48 object-cover rounded-xl border border-[#1F222C] bg-black" />
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#1F222C]">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1.5 text-xs font-semibold ${post.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}
                      >
                        <div className={`transition-transform duration-200 ${animatingHeartPostId === post.id ? 'scale-150 active:scale-125' : 'scale-100'}`}>
                          <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                        </div>
                        <span>{post.likesCount}</span>
                      </button>

                      <button 
                        onClick={() => setActiveCommentsPostId(post.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.commentsCount}</span>
                      </button>

                      <button 
                        onClick={() => setShowGiftModal(post.id)}
                        className="flex items-center gap-1.5 text-xs font-bold text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-full border border-yellow-500/30 hover:bg-yellow-500/20"
                      >
                        <span>🪙 Gift</span>
                        <span>{post.giftsCount}</span>
                      </button>

                      <button 
                        onClick={() => handleToggleSave(post.id)}
                        className={`p-1.5 rounded-full transition ${post.isSaved ? 'text-yellow-400 bg-yellow-500/10' : 'text-gray-400 hover:text-white'}`}
                        title={post.isSaved ? "Saved" : "Save Post"}
                      >
                        <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                      </button>

                      <button 
                        onClick={() => setActiveAnalyticsPost(post)}
                        className="p-1.5 text-gray-400 hover:text-yellow-400 transition"
                        title="View Post Analytics"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>

                      <button 
                        onClick={async () => {
                          triggerHaptic(30);
                          if (navigator.share) {
                            try {
                              await navigator.share({
                                title: `JagX Post by ${post.authorName}`,
                                text: post.content,
                                url: `https://jri.network/app#post=${post.id}`
                              });
                              triggerToast('🚀 Post shared successfully!');
                            } catch (e) {
                              setDeepSharePostModal(post);
                            }
                          } else {
                            setDeepSharePostModal(post);
                          }
                        }}
                        className="text-gray-400 hover:text-white p-1"
                        title="Share Post via Native Share Sheet"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}

              {posts.filter(p => {
                if (!feedSearchQuery.trim()) return true;
                const q = feedSearchQuery.toLowerCase();
                return p.content.toLowerCase().includes(q) ||
                       p.authorName.toLowerCase().includes(q) ||
                       p.authorHandle.toLowerCase().includes(q);
              }).length === 0 && (
                <div className="text-center py-10 space-y-2 bg-[#14161D] rounded-2xl border border-[#1F222C]">
                  {feedSearchQuery.trim() ? (
                    <>
                      <Search className="w-8 h-8 text-gray-600 mx-auto" />
                      <p className="text-xs text-gray-400 font-semibold">No posts found matching "{feedSearchQuery}"</p>
                      <button onClick={() => setFeedSearchQuery('')} className="text-xs text-yellow-400 underline font-bold">Clear search</button>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-8 h-8 text-gray-600 mx-auto" />
                      <p className="text-xs text-gray-400 font-semibold">No posts yet</p>
                      <p className="text-[11px] text-gray-500">Be the first to share something on JagX.</p>
                      <button onClick={() => setShowCreatePost(true)} className="bg-yellow-500 text-black text-xs font-bold px-4 py-1.5 rounded-full mt-1">
                        Create Post
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. REELS SCREEN */}
        {activeTab === 'reels' && (
          reels.length === 0 ? (
            <div className="h-[calc(100vh-120px)] bg-black flex flex-col items-center justify-center gap-3 p-6 text-center">
              <Video className="w-10 h-10 text-gray-600" />
              <p className="text-sm font-bold text-white">No reels yet</p>
              <p className="text-xs text-gray-400">Be the first to post a short video — it'll show up here for everyone.</p>
              <button
                onClick={() => setShowCreatePost(true)}
                className="bg-yellow-500 text-black font-bold text-xs px-4 py-2 rounded-full mt-2"
              >
                Create a Reel
              </button>
            </div>
          ) : (
          <div className="relative h-[calc(100vh-120px)] bg-black overflow-hidden flex flex-col justify-end p-4">
            <img src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80" className="absolute inset-0 w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

            {/* Reel info & action rail */}
            <div className="relative z-10 flex items-end justify-between">
              <div className="space-y-3 max-w-[75%]">
                <div className="flex items-center gap-2">
                  <img src={reels[0].creatorAvatar} className="w-10 h-10 rounded-full border-2 border-yellow-500" />
                  <div>
                    <h4 className="text-sm font-bold text-white">{reels[0].creatorName}</h4>
                    <p className="text-[11px] text-gray-300">{reels[0].creatorHandle}</p>
                  </div>
                  <button className="bg-yellow-500 text-black font-bold text-[10px] px-3 py-1 rounded-full ml-2">Follow</button>
                </div>

                <p className="text-xs text-white line-clamp-2">{reels[0].caption}</p>

                <div className="flex items-center gap-2 text-xs text-yellow-400">
                  <Music className="w-3.5 h-3.5" />
                  <span>{reels[0].soundTitle}</span>
                </div>
              </div>

              {/* Action Rail */}
              <div className="flex flex-col items-center gap-5">
                <button className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  </div>
                  <span className="text-[10px] text-white font-bold">{reels[0].likesCount}</span>
                </button>

                <button className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] text-white font-bold">{reels[0].commentsCount}</span>
                </button>

                <button onClick={() => setShowGiftModal(reels[0].id)} className="flex flex-col items-center gap-1">
                  <div className="w-11 h-11 rounded-full bg-yellow-500 text-black flex items-center justify-center font-bold shadow-lg">
                    🪙
                  </div>
                  <span className="text-[10px] text-yellow-400 font-bold">Gift</span>
                </button>
              </div>
            </div>
          </div>
          )
        )}

        {/* 3. LIVE STREAMING SCREEN */}
        {activeTab === 'live' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">JagX Live Streaming</h2>
              <button 
                onClick={() => {
                  if (liveRooms[0]) setActiveLiveRoom(liveRooms[0]);
                  else triggerToast('🎥 Go-live setup coming soon — no active rooms yet.');
                }}
                className="bg-red-600 text-white font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-pulse"
              >
                <Radio className="w-4 h-4" />
                <span>Go Live</span>
              </button>
            </div>

            <div className="space-y-3">
              {liveRooms.length === 0 && (
                <div className="text-center py-14 space-y-2 bg-[#14161D] rounded-2xl border border-[#1F222C]">
                  <Radio className="w-8 h-8 text-gray-600 mx-auto" />
                  <p className="text-xs text-gray-400 font-semibold">No one is live right now</p>
                  <p className="text-[11px] text-gray-500">Tap "Go Live" to start the first stream.</p>
                </div>
              )}
              {liveRooms.map(room => (
                <div 
                  key={room.id}
                  onClick={() => setActiveLiveRoom(room)}
                  className="bg-[#14161D] border border-[#1F222C] rounded-2xl overflow-hidden cursor-pointer group hover:border-gray-700 transition"
                >
                  <div className="relative h-40">
                    <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <span>LIVE</span>
                    </div>
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      👁️ {room.viewerCount}
                    </div>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <img src={room.hostAvatar} className="w-9 h-9 rounded-full object-cover border border-[#1F222C]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#14161D] absolute bottom-0 right-0 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{room.title}</h4>
                        <p className="text-[11px] text-gray-400">Host: {room.hostName} • {room.category}</p>
                      </div>
                    </div>
                    <button className="bg-yellow-500 text-black text-xs font-bold px-3 py-1.5 rounded-xl">Join</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. MARKETPLACE & LOCAL EXPLORE MAP SCREEN */}
        {activeTab === 'market' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">JagX Marketplace & Local Explore</h2>
                <p className="text-[10px] text-gray-400">Discover items, local creators & events nearby</p>
              </div>
              <button 
                onClick={() => setShowCreateProduct(true)}
                className="bg-yellow-500 text-black text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-md hover:bg-yellow-400 transition"
              >
                <Plus className="w-4 h-4" />
                <span>List Item</span>
              </button>
            </div>

            {/* Marketplace vs Explore Map View Mode Selector */}
            <div className="bg-[#14161D] border border-[#1F222C] p-1 rounded-2xl flex items-center justify-between">
              <button 
                onClick={() => {
                  setMarketplaceViewMode('listings');
                  triggerHaptic(20);
                }}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  marketplaceViewMode === 'listings' ? 'bg-yellow-500 text-black shadow-md font-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Listings ({products.length})</span>
              </button>
              <button 
                onClick={() => {
                  setMarketplaceViewMode('map');
                  triggerHaptic(30);
                }}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  marketplaceViewMode === 'map' ? 'bg-yellow-500 text-black shadow-md font-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Explore Local Map 📍</span>
              </button>
            </div>

            {marketplaceViewMode === 'listings' ? (
              <>
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Search gadgets, collectibles, fashion..." 
                    className="w-full bg-[#14161D] border border-[#1F222C] rounded-full pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>

                {/* Products Grid */}
                {products.length === 0 ? (
                  <div className="text-center py-14 space-y-2 bg-[#14161D] rounded-2xl border border-[#1F222C]">
                    <ShoppingBag className="w-8 h-8 text-gray-600 mx-auto" />
                    <p className="text-xs text-gray-400 font-semibold">No listings yet</p>
                    <p className="text-[11px] text-gray-500">Tap "List Item" above to sell the first thing here.</p>
                  </div>
                ) : (
                <div className="grid grid-cols-2 gap-3">
                  {products.map(prod => (
                    <div 
                      key={prod.id} 
                      onClick={() => setSelectedProduct(prod)}
                      className="bg-[#14161D] border border-[#1F222C] rounded-2xl overflow-hidden cursor-pointer hover:border-gray-700 transition relative group"
                    >
                      <img src={prod.imageUrl} className="w-full h-32 object-cover" />
                      
                      {/* Delete product button */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteModal({ type: 'product', id: prod.id, title: prod.title });
                        }}
                        title="Delete product listing"
                        className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white p-1.5 rounded-full backdrop-blur-md transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="p-3 space-y-1">
                        <h4 className="text-xs font-bold text-white truncate">{prod.title}</h4>
                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-yellow-400 font-bold">🪙 {prod.priceCoins}</span>
                          <span className="text-gray-400 font-medium">${prod.priceUsd}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </>
            ) : (
              /* EXPLORE LOCAL GPS MAP INTERFACE */
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="bg-[#14161D] border-2 border-yellow-500/40 rounded-3xl p-4 relative overflow-hidden h-96 flex flex-col justify-between shadow-2xl">
                  {/* Map Grid Vector Background */}
                  <div className="absolute inset-0 bg-[radial-gradient(#1F222C_1px,transparent_1px)] [background-size:16px_16px] opacity-70" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-transparent to-black/40" />

                  {/* Radar Pulse Effect */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-yellow-500/20 rounded-full animate-ping pointer-events-none" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-yellow-500/30 rounded-full pointer-events-none" />

                  {/* Map Header Overlay */}
                  <div className="relative z-10 flex items-center justify-between bg-black/70 backdrop-blur-md p-2.5 rounded-2xl border border-gray-800 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <div>
                        <span className="font-bold text-white block leading-tight">GPS Radar Active</span>
                        <span className="text-[9px] text-gray-400">Victoria Island • 4 Local Pins Nearby</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-md border border-yellow-500/30 font-bold">
                      LIVE MAP
                    </span>
                  </div>

                  {/* Interactive Pins Canvas Overlay */}
                  <div className="absolute inset-0 z-20">
                    {/* User's Current Location Marker */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full bg-yellow-400 ring-4 ring-yellow-500/30 flex items-center justify-center animate-bounce shadow-[0_0_20px_#eab308]">
                        <span className="w-2 h-2 rounded-full bg-black" />
                      </div>
                      <span className="text-[8px] bg-black/80 text-yellow-400 px-1.5 py-0.5 rounded-full font-bold mt-1 border border-yellow-500/40">
                        You
                      </span>
                    </div>

                    {/* Local User & Event Pins */}
                    {exploreMapPins.map(pin => (
                      <button
                        key={pin.id}
                        onClick={() => {
                          triggerHaptic([30, 60]);
                          setSelectedMapPin(pin);
                        }}
                        style={{ top: `${pin.lat}%`, left: `${pin.lng}%` }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-transform active:scale-125 ${
                          selectedMapPin?.id === pin.id ? 'z-30 scale-125' : 'z-20 hover:scale-110'
                        }`}
                      >
                        <div className="relative flex flex-col items-center">
                          <div className={`p-1 rounded-full border-2 shadow-xl ${
                            pin.type === 'event' 
                              ? 'bg-purple-600 border-purple-400 text-white ring-4 ring-purple-500/30' 
                              : 'bg-yellow-500 border-yellow-300 text-black ring-4 ring-yellow-500/30'
                          }`}>
                            <img src={pin.avatar} className="w-7 h-7 rounded-full object-cover" />
                          </div>
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap mt-1 border shadow-md ${
                            pin.type === 'event'
                              ? 'bg-purple-950/90 text-purple-300 border-purple-500/50'
                              : 'bg-black/90 text-yellow-400 border-yellow-500/50'
                          }`}>
                            {pin.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Map Footer Compass Legend */}
                  <div className="relative z-10 flex items-center justify-between text-[10px] text-gray-400 bg-black/60 backdrop-blur-md p-2 rounded-xl border border-gray-800">
                    <span className="flex items-center gap-1 text-gray-300">
                      <Compass className="w-3.5 h-3.5 text-yellow-400 animate-spin" style={{ animationDuration: '10s' }} />
                      <span>Tap any pin on map for profile / event details</span>
                    </span>
                    <span className="text-yellow-400 font-bold">Radar: 5km</span>
                  </div>
                </div>

                {/* Selected Pin Details Drawer Card */}
                {selectedMapPin ? (
                  <div className="bg-[#14161D] border-2 border-yellow-500 p-4 rounded-3xl space-y-3 animate-in slide-in-from-bottom-2 duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img src={selectedMapPin.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-yellow-500" />
                        <div>
                          <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                            <span>{selectedMapPin.title}</span>
                          </h4>
                          <p className="text-[11px] text-yellow-400 font-semibold">{selectedMapPin.category} • {selectedMapPin.distance}</p>
                          {selectedMapPin.attendees && (
                            <p className="text-[10px] text-purple-400 font-bold">🔥 {selectedMapPin.attendees} Attendees RSVP'd</p>
                          )}
                        </div>
                      </div>
                      <button onClick={() => setSelectedMapPin(null)} className="text-gray-400 hover:text-white p-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-gray-300 bg-[#1F222C] p-2.5 rounded-xl border border-gray-800 leading-relaxed">
                      {selectedMapPin.desc}
                    </p>

                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <button 
                        onClick={() => {
                          triggerHaptic(30);
                          triggerToast(`📍 Directions to ${selectedMapPin.name} calculated: 4 mins away via Victoria Island Express.`);
                        }}
                        className="bg-yellow-500 text-black text-[10px] font-extrabold py-2 rounded-xl hover:bg-yellow-400 transition"
                      >
                        Directions 🗺️
                      </button>
                      <button 
                        onClick={() => {
                          triggerHaptic(25);
                          setActiveTab('chat');
                          triggerToast(`💬 Opened direct message thread with ${selectedMapPin.name}`);
                        }}
                        className="bg-[#1F222C] border border-gray-700 text-white text-[10px] font-bold py-2 rounded-xl hover:bg-gray-800 transition"
                      >
                        Message 💬
                      </button>
                      <button 
                        onClick={() => {
                          triggerHaptic(30);
                          triggerToast(selectedMapPin.type === 'event' ? `🎉 RSVP confirmed for ${selectedMapPin.name}!` : `⭐ Following ${selectedMapPin.name}!`);
                        }}
                        className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold py-2 rounded-xl hover:bg-emerald-500/30 transition"
                      >
                        {selectedMapPin.type === 'event' ? 'RSVP Event' : 'Follow'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#14161D] border border-[#1F222C] p-3 rounded-2xl text-center text-xs text-gray-400">
                    💡 Tap any marker on the live map to inspect local creator profiles or join nearby events.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 5. CHAT & DMS SCREEN */}
        {activeTab === 'chat' && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Messages & Calls</h2>
              <span className="text-xs text-yellow-400 font-bold bg-yellow-500/10 px-2.5 py-1 rounded-full border border-yellow-500/20">
                {conversations.filter(c => c.partnerName.toLowerCase().includes(chatSearchQuery.toLowerCase())).length} Active
              </span>
            </div>

            {/* Real-time Conversation Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                value={chatSearchQuery}
                onChange={e => setChatSearchQuery(e.target.value)}
                placeholder="Filter chats by partner name..." 
                className="w-full bg-[#14161D] border border-[#1F222C] rounded-full pl-9 pr-8 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 transition"
              />
              {chatSearchQuery && (
                <button onClick={() => setChatSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-0.5">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-2">
              {conversations
                .filter(c => c.partnerName.toLowerCase().includes(chatSearchQuery.toLowerCase()))
                .map(c => {
                  const isSwiped = swipedChatId === c.id;
                  return (
                    <div key={c.id} className="relative overflow-hidden rounded-2xl group">
                      {/* Swipe-Revealed Red Delete Action Layer */}
                      <div className="absolute inset-y-0 right-0 w-24 bg-red-600 flex items-center justify-center z-0">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setConversations(prev => prev.filter(item => item.id !== c.id));
                            setSwipedChatId(null);
                            triggerHaptic([30, 60]);
                            triggerToast(`Deleted thread with ${c.partnerName}`);
                          }}
                          className="w-full h-full flex flex-col items-center justify-center text-white font-bold text-xs hover:bg-red-700 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-[9px] uppercase font-black">Delete</span>
                        </button>
                      </div>

                      {/* Conversation Card Layer */}
                      <div 
                        onClick={() => {
                          if (isSwiped) {
                            setSwipedChatId(null);
                          } else {
                            setActiveChat(c);
                          }
                        }}
                        onTouchStart={(e) => {
                          (e.currentTarget as any)._touchStartX = e.touches[0].clientX;
                        }}
                        onTouchEnd={(e) => {
                          const startX = (e.currentTarget as any)._touchStartX;
                          if (startX && startX - e.changedTouches[0].clientX > 40) {
                            setSwipedChatId(c.id);
                            triggerHaptic(25);
                          } else if (startX && e.changedTouches[0].clientX - startX > 40) {
                            setSwipedChatId(null);
                          }
                        }}
                        className={`bg-[#14161D] border border-[#1F222C] p-3 rounded-2xl flex items-center justify-between cursor-pointer hover:border-gray-700 transition-transform duration-200 relative z-10 ${
                          isSwiped ? '-translate-x-24' : 'translate-x-0'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img src={c.partnerAvatar} className="w-12 h-12 rounded-full object-cover border border-[#1F222C]" />
                            <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#14161D] absolute bottom-0 right-0" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">{c.partnerName}</h4>
                            <p className="text-[11px] text-gray-400 truncate w-36">{c.lastMessage}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button onClick={(e) => { e.stopPropagation(); setShowCall({ partner: c.partnerName, isVideo: false }); }} className="p-2 text-yellow-400 bg-yellow-500/10 rounded-full hover:bg-yellow-500/20">
                            <Phone className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setShowCall({ partner: c.partnerName, isVideo: true }); }} className="p-2 text-yellow-400 bg-yellow-500/10 rounded-full hover:bg-yellow-500/20">
                            <Video className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSwipedChatId(isSwiped ? null : c.id);
                              triggerHaptic(20);
                            }} 
                            className="p-2 text-gray-400 hover:text-red-400 bg-gray-800/40 rounded-full transition"
                            title="Swipe to delete thread"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {conversations.filter(c => c.partnerName.toLowerCase().includes(chatSearchQuery.toLowerCase())).length === 0 && (
                <div className="bg-[#14161D] border border-[#1F222C] p-6 rounded-2xl text-center space-y-2">
                  <MessageSquare className="w-8 h-8 text-gray-600 mx-auto" />
                  <p className="text-xs text-gray-400">No conversations found matching "{chatSearchQuery}"</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. COINS WALLET SCREEN */}
        {activeTab === 'wallet' && (
          <div className="p-4 space-y-4">
            {/* Coins Balance Card */}
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-black p-6 rounded-3xl space-y-3 shadow-xl">
              <span className="text-xs font-bold uppercase tracking-wider opacity-80">Available JagX Coins</span>
              <div className="flex items-center gap-2">
                <span className="text-3xl">🪙</span>
                <span className="text-4xl font-black">{userCoins.toLocaleString()}</span>
              </div>
              <p className="text-xs font-medium opacity-90">Use coins to gift creators, buy items in Marketplace, or back investment projects.</p>

              {/* Quick-Stake 50% Single-Tap Button */}
              <div className="pt-2 border-t border-black/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-black flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 fill-black" />
                    <span>Quick-Stake Vault</span>
                  </span>
                  <p className="text-[10px] text-black/80 font-medium">Move 50% of coins to 12.4% APY Vault</p>
                </div>

                <button
                  onClick={() => {
                    const halfCoins = Math.floor(userCoins * 0.5);
                    if (halfCoins <= 0) {
                      triggerToast('⚠️ Not enough coins to Quick-Stake!');
                      return;
                    }
                    setUserCoins(prev => prev - halfCoins);
                    setStakedCoins(prev => prev + halfCoins);
                    triggerHaptic([30, 80, 40]);
                    triggerToast(`⚡ Quick-Staked 50% (🪙${halfCoins.toLocaleString()} Coins) into 12.4% APY Vault!`);
                  }}
                  className="bg-black hover:bg-black/80 text-yellow-400 font-black text-xs px-3.5 py-2 rounded-xl shadow-lg transition active:scale-95 flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 fill-yellow-400" />
                  <span>Quick-Stake 50%</span>
                </button>
              </div>
            </div>

            {/* Daily Missions System Card */}
            <div className="bg-[#14161D] border border-yellow-500/40 p-4 rounded-3xl space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                    <span className="text-lg">🎯</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Daily Missions</span>
                      <span className="text-[9px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full font-black border border-yellow-500/30">
                        {dailyMissions.filter(m => m.completed).length}/{dailyMissions.length} COMPLETED
                      </span>
                    </h4>
                    <p className="text-[10px] text-gray-400">Checklist tasks to earn bonus JagX Coins!</p>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    triggerHaptic(25);
                    setShowMissionsModal(true);
                  }}
                  className="bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-extrabold text-xs px-3.5 py-2 rounded-xl shadow hover:brightness-110 active:scale-95 flex items-center gap-1"
                >
                  <span>Open Missions</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Mini task progress list */}
              <div className="space-y-1.5 pt-1 border-t border-[#1F222C]">
                {dailyMissions.map(m => (
                  <div key={m.id} className="flex items-center justify-between text-xs bg-[#1F222C] p-2 rounded-xl border border-gray-800/80">
                    <span className="text-gray-300 font-semibold flex items-center gap-1.5 text-[11px]">
                      <span>{m.icon}</span>
                      <span>{m.title}</span>
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${m.completed ? (m.claimed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500 text-black animate-pulse') : 'bg-gray-800 text-gray-400'}`}>
                      {m.claimed ? 'Claimed' : (m.completed ? 'Claim Reward!' : `${m.current}/${m.target}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Streak Reward Card */}
            <div className="bg-[#14161D] border border-yellow-500/40 p-4 rounded-3xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    <Flame className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{dailyStreak.count} Day Streak</span>
                      <span className="text-[9px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full font-black border border-orange-500/30">🔥 ACTIVE</span>
                    </h4>
                    <p className="text-[10px] text-gray-400">Log in daily for consecutive bonus JagX coins!</p>
                  </div>
                </div>
                <button 
                  disabled={dailyStreak.claimedToday}
                  onClick={() => {
                    if (!dailyStreak.claimedToday) {
                      const newStreak = dailyStreak.count + 1;
                      const bonus = 100 * newStreak;
                      setUserCoins(prev => prev + bonus);
                      setDailyStreak({ count: newStreak, claimedToday: true, lastClaimedDate: new Date().toISOString().split('T')[0] });
                      triggerHaptic([40, 60, 40]);
                      triggerToast(`🎉 Daily streak claimed! +${bonus} Bonus JagX Coins! 🪙`);
                    }
                  }}
                  className={`text-xs font-bold px-3 py-2 rounded-xl transition ${
                    dailyStreak.claimedToday 
                      ? 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-orange-500 to-yellow-500 text-black shadow-lg hover:brightness-110 active:scale-95'
                  }`}
                >
                  {dailyStreak.claimedToday ? 'Claimed Today' : `Claim +${100 * (dailyStreak.count + 1)} Coins`}
                </button>
              </div>

              {/* 7-Day Tracker */}
              <div className="grid grid-cols-7 gap-1 pt-1 border-t border-[#1F222C]">
                {[1, 2, 3, 4, 5, 6, 7].map(day => (
                  <div 
                    key={day}
                    className={`p-1.5 rounded-xl border text-center space-y-0.5 transition ${
                      day <= dailyStreak.count 
                        ? 'bg-orange-500/20 border-orange-500 text-orange-400 font-bold' 
                        : 'bg-[#1F222C] border-gray-800 text-gray-500'
                    }`}
                  >
                    <span className="text-[9px] block">Day {day}</span>
                    <span className="text-xs">{day <= dailyStreak.count ? '🔥' : '🪙'}</span>
                  </div>
                ))}
              </div>
            </div>

            <h3 className="text-sm font-bold text-white">Top Up Coin Packages</h3>
            <div className="space-y-2">
              {[
                { coins: 250, price: 2.99 },
                { coins: 1000, price: 9.99, popular: true },
                { coins: 2800, price: 24.99 },
                { coins: 12000, price: 99.99 }
              ].map((pkg, i) => (
                <div key={i} className="bg-[#14161D] border border-[#1F222C] p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🪙</span>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        {pkg.coins} Coins
                        {pkg.popular && <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-md font-bold">BEST VALUE</span>}
                      </h4>
                      <p className="text-[10px] text-gray-400">Instant delivery to wallet</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setUserCoins(userCoins + pkg.coins);
                      triggerToast(`Purchased ${pkg.coins} JagX Coins! 🪙`);
                    }}
                    className="bg-yellow-500 text-black font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    ${pkg.price}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. INVEST & MEMBER CARD */}
        {activeTab === 'invest' && (
          <div className="p-4 space-y-4">
            {/* Black VIP Member Card */}
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 border border-yellow-500/40 p-5 rounded-3xl space-y-4 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-widest text-yellow-400">JAGX CONNECT</span>
                <span className="bg-yellow-500 text-black text-[9px] font-black px-2 py-0.5 rounded-md">BLACK VIP</span>
              </div>
              <p className="text-lg font-mono tracking-widest text-white">4892 •••• •••• 9912</p>
              <div className="flex justify-between items-end text-xs">
                <div>
                  <p className="text-[9px] text-gray-400 uppercase">Card Holder</p>
                  <p className="font-bold text-white">TAJUDEEN GBADAMOSI</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 uppercase">Valid Thru</p>
                  <p className="font-bold text-white">12/29</p>
                </div>
              </div>
            </div>

            <h3 className="text-sm font-bold text-white">High-Yield Investment Projects</h3>

            <div className="space-y-3">
              {[
                { title: 'JagX Solar Energy Farm Phase 1', return: '18.5% APY', raised: 450000, target: 500000, img: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80' },
                { title: 'Fintech Payment Gateway Expansion', return: '24.0% APY', raised: 120000, target: 250000, img: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80' }
              ].map((inv, idx) => (
                <div key={idx} className="bg-[#14161D] border border-[#1F222C] rounded-2xl overflow-hidden p-4 space-y-3">
                  <img src={inv.img} className="w-full h-32 object-cover rounded-xl" />
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">{inv.title}</h4>
                    <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">{inv.return}</span>
                  </div>
                  <div className="w-full bg-[#1F222C] rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(inv.raised / inv.target) * 100}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                    <span>Raised: ${inv.raised}</span>
                    <span>Target: ${inv.target}</span>
                  </div>
                  <button onClick={() => triggerToast('Investment order submitted!')} className="w-full bg-yellow-500 text-black text-xs font-bold py-2 rounded-xl">
                    Invest Now (Min $100)
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. PROFILE SCREEN */}
        {activeTab === 'profile' && (
          <div className="p-4 space-y-4">
            {isLoadingData ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-28 bg-gray-800 rounded-3xl" />
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-16 h-16 bg-gray-800 rounded-full" />
                  <div className="h-4 bg-gray-800 rounded w-1/3" />
                  <div className="h-3 bg-gray-800/60 rounded w-1/4" />
                </div>
                <div className="h-10 bg-gray-800 rounded-xl" />
                <div className="h-40 bg-gray-800 rounded-2xl" />
              </div>
            ) : !currentUser ? (
              <div className="h-[70vh] flex flex-col items-center justify-center text-center gap-3 px-6">
                <User className="w-12 h-12 text-gray-600" />
                <h3 className="text-sm font-bold text-white">You're not signed in</h3>
                <p className="text-xs text-gray-400">Create an account or log in to set up your profile, post, and connect your wallet.</p>
                <button
                  onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
                  className="bg-yellow-500 text-black font-bold text-xs px-5 py-2.5 rounded-full mt-2"
                >
                  Create Account
                </button>
                <button
                  onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                  className="text-yellow-400 text-xs font-semibold underline"
                >
                  Already have an account? Log in
                </button>
              </div>
            ) : (
              <>
                {/* Customizable Cover Banner */}
                <div className="relative h-28 rounded-3xl overflow-hidden border border-[#1F222C] group">
                  <img src={profileBannerUrl} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  <button 
                    onClick={() => setCropperState({ imageUrl: profileBannerUrl, type: 'banner', zoom: 1, rotation: 0 })}
                    className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-yellow-400 p-1.5 rounded-full hover:bg-black transition text-xs flex items-center gap-1 px-2.5 font-bold border border-yellow-500/30"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Crop Banner</span>
                  </button>

                  {/* Avatar centered over banner */}
                  <div 
                    onClick={() => setCropperState({ imageUrl: currentUser?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80", type: 'avatar', zoom: 1, rotation: 0 })}
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer group"
                    title="Click to crop avatar"
                  >
                    <img 
                      src={currentUser?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"} 
                      className="w-16 h-16 rounded-full border-2 border-yellow-500 object-cover shadow-2xl group-hover:opacity-80 transition" 
                    />
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <Edit3 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center text-center space-y-2 pt-2">
                  <h3 className="text-base font-bold text-white flex items-center justify-center gap-1">
                    {currentUser?.name || "Tajudeen Gbadamosi"}
                    <CheckCircle className="w-4 h-4 text-yellow-400 fill-yellow-400/20" />
                  </h3>
                  <p className="text-xs text-gray-400">{currentUser?.handle || "@jagx_tajudeen"} • {currentUser?.email}</p>

                  {/* Editable Status Badge Picker */}
                  <div className="flex items-center justify-center gap-1">
                    <button 
                      onClick={() => setShowStatusPicker(!showStatusPicker)}
                      className="bg-[#1F222C] border border-gray-700 hover:border-yellow-500/50 text-xs font-semibold text-gray-300 px-3 py-1 rounded-full flex items-center gap-1.5 transition"
                    >
                      <span>{userStatus}</span>
                      <Edit3 className="w-3 h-3 text-yellow-400" />
                    </button>
                  </div>

                  {showStatusPicker && (
                    <div className="bg-[#14161D] border border-yellow-500/30 p-2.5 rounded-2xl space-y-2 w-full max-w-xs animate-in zoom-in-95 duration-150">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Select Custom Status Preset</p>
                      <div className="grid grid-cols-1 gap-1">
                        {[
                          '🟢 Building Web3 on JagX',
                          '🔥 Host @ VIP Live Stream',
                          '💼 Open to Angel Investments',
                          '✈️ Traveling & Networking',
                          '⚡ JagX Ambassador Active'
                        ].map(st => (
                          <button 
                            key={st}
                            onClick={() => {
                              setUserStatus(st);
                              setShowStatusPicker(false);
                              triggerToast(`Status updated to: ${st}`);
                            }}
                            className={`text-left text-xs p-1.5 rounded-lg border transition ${userStatus === st ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500' : 'bg-[#1F222C] text-gray-300 border-gray-800'}`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

              {/* Bio Link & Custom Website */}
              {profileBioLink && (
                <a 
                  href={profileBioLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-yellow-400 hover:underline font-semibold bg-yellow-500/10 px-2.5 py-0.5 rounded-full border border-yellow-500/20"
                >
                  <Link className="w-3 h-3" />
                  <span>{profileBioLink.replace('https://', '')}</span>
                </a>
              )}
              
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button 
                  onClick={() => setShowQrModal(true)}
                  className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 hover:bg-yellow-500/20 transition"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Share QR</span>
                </button>

                <button 
                  onClick={() => setShowVerifyModal(true)}
                  className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 hover:bg-emerald-500/20 transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verify Account</span>
                </button>

                <button 
                  onClick={() => setShowTipModal({ userName: currentUser?.name || "Tajudeen Gbadamosi", handle: currentUser?.handle || "@jagx_tajudeen", avatar: currentUser?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" })}
                  className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-500/20 transition"
                >
                  <CoinIcon className="w-3.5 h-3.5" />
                  <span>Tip Jar</span>
                </button>

                <button 
                  onClick={() => {
                    triggerHaptic(30);
                    setShowReportUserModal({ userName: currentUser?.name || "Tajudeen Gbadamosi", handle: currentUser?.handle || "@jagx_tajudeen" });
                  }}
                  className="bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 hover:bg-red-500/20 transition"
                  title="Report Profile for violations"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Report User</span>
                </button>
                
                {currentUser ? (
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center gap-1 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold px-2.5 py-1 rounded-full hover:bg-red-500/20 transition"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                    className="flex items-center gap-1 bg-yellow-500 text-black text-[10px] font-bold px-2.5 py-1 rounded-full hover:bg-yellow-400 transition"
                  >
                    <User className="w-3 h-3" />
                    <span>Login</span>
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-300 max-w-xs pt-1">Entrepreneur & Tech Creator. Building the future with JagX Connect & JRI.</p>
            </div>

            <div className="flex justify-around bg-[#14161D] border border-[#1F222C] py-3 rounded-2xl text-center">
              <div>
                <p className="text-sm font-bold text-white">14.2K</p>
                <p className="text-[10px] text-gray-400">Followers</p>
              </div>
              <div>
                <p className="text-sm font-bold text-white">380</p>
                <p className="text-[10px] text-gray-400">Following</p>
              </div>
              <div>
                <p className="text-sm font-bold text-yellow-400">🪙 {userCoins}</p>
                <p className="text-[10px] text-gray-400">Coins</p>
              </div>
            </div>

            {/* Profile Sub-tabs */}
            <div className="flex border-b border-[#1F222C] text-[11px]">
              <button 
                onClick={() => { setProfileTab('posts'); setActiveCollectionId(null); }}
                className={`flex-1 py-2 font-bold transition border-b-2 ${profileTab === 'posts' ? 'border-yellow-500 text-yellow-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                Posts ({posts.filter(p => p.authorHandle === '@jagx_tajudeen').length})
              </button>
              <button 
                onClick={() => { setProfileTab('saved'); setActiveCollectionId(null); }}
                className={`flex-1 py-2 font-bold transition border-b-2 flex items-center justify-center gap-1 ${profileTab === 'saved' ? 'border-yellow-500 text-yellow-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                <Bookmark className="w-3 h-3" />
                <span>Saved ({posts.filter(p => p.isSaved).length})</span>
              </button>
              <button 
                onClick={() => setProfileTab('collections')}
                className={`flex-1 py-2 font-bold transition border-b-2 flex items-center justify-center gap-1 ${profileTab === 'collections' ? 'border-yellow-500 text-yellow-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                <Folder className="w-3 h-3" />
                <span>Collections ({savedCollections.length})</span>
              </button>
              <button 
                onClick={() => setProfileTab('badges')}
                className={`flex-1 py-2 font-bold transition border-b-2 flex items-center justify-center gap-1 ${profileTab === 'badges' ? 'border-yellow-500 text-yellow-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                <Award className="w-3 h-3" />
                <span>VIP Badges</span>
              </button>
            </div>

            {/* Sub-tab Content */}
            <div className="space-y-3 pt-1">
              {profileTab === 'posts' && (
                <>
                  {posts.filter(p => p.authorHandle === '@jagx_tajudeen').map(post => (
                    <div key={post.id} className="bg-[#14161D] border border-[#1F222C] rounded-2xl p-3.5 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-gray-400 font-medium">{post.timestamp}</span>
                        <button 
                          onClick={() => setConfirmDeleteModal({ type: 'post', id: post.id })}
                          className="text-gray-500 hover:text-red-400 p-1"
                          title="Delete post"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-200">{post.content}</p>
                      {post.imageUrl && (
                        <img src={post.imageUrl} className="w-full h-36 object-cover rounded-xl" />
                      )}
                      {post.videoUrl && (
                        <video src={post.videoUrl} controls playsInline className="w-full h-36 object-cover rounded-xl bg-black" />
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-400 pt-1 border-t border-[#1F222C]">
                        <span>❤️ {post.likesCount}</span>
                        <span>💬 {post.commentsCount}</span>
                        <span>🪙 {post.giftsCount}</span>
                      </div>
                    </div>
                  ))}
                  {posts.filter(p => p.authorHandle === '@jagx_tajudeen').length === 0 && (
                    <p className="text-xs text-gray-500 text-center py-8">You haven't published any posts yet.</p>
                  )}
                </>
              )}

              {profileTab === 'saved' && (
                <>
                  {posts.filter(p => p.isSaved).map(post => (
                    <div key={post.id} className="bg-[#14161D] border border-[#1F222C] rounded-2xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src={post.authorAvatar} className="w-7 h-7 rounded-full object-cover" />
                          <div>
                            <h5 className="text-xs font-bold text-white">{post.authorName}</h5>
                            <p className="text-[10px] text-gray-400">{post.timestamp}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setShowAddToCollectionPostId(post.id)}
                            className="text-xs text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20 px-2 py-1 rounded-lg border border-yellow-500/20 font-bold flex items-center gap-1"
                          >
                            <FolderPlus className="w-3 h-3" />
                            <span>Add to Folder</span>
                          </button>
                          <button 
                            onClick={() => handleToggleSave(post.id)}
                            className="text-yellow-400 bg-yellow-500/10 p-1.5 rounded-full"
                            title="Remove from saved"
                          >
                            <Bookmark className="w-3.5 h-3.5 fill-yellow-400" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-200 line-clamp-3">{post.content}</p>
                      {post.imageUrl && (
                        <img src={post.imageUrl} className="w-full h-32 object-cover rounded-xl" />
                      )}
                    </div>
                  ))}
                  {posts.filter(p => p.isSaved).length === 0 && (
                    <div className="text-center py-10 space-y-2">
                      <Bookmark className="w-8 h-8 text-gray-600 mx-auto" />
                      <p className="text-xs text-gray-400 font-semibold">No saved posts in your collection.</p>
                      <p className="text-[11px] text-gray-500">Tap the bookmark icon on any post in your feed to save it here!</p>
                    </div>
                  )}
                </>
              )}

              {/* DEDICATED ORGANIZE COLLECTIONS VIEW */}
              {profileTab === 'collections' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FolderOpen className="w-4 h-4 text-yellow-400" />
                      <span>Organize Collections & Folders</span>
                    </h4>
                    <div className="flex items-center gap-1.5">
                      {/* JagX AI Auto-Sort Button */}
                      <button 
                        disabled={isAutoSortingCollections}
                        onClick={() => {
                          triggerHaptic([30, 60]);
                          setIsAutoSortingCollections(true);
                          
                          setTimeout(() => {
                            // Ensure default Tech, Finance, Lifestyle folders exist
                            let currentCols = [...savedCollections];
                            const defaultFolders = [
                              { id: 'c_tech', name: 'Tech', icon: '💻', postIds: [] as string[] },
                              { id: 'c_finance', name: 'Finance', icon: '📈', postIds: [] as string[] },
                              { id: 'c_lifestyle', name: 'Lifestyle', icon: '🎨', postIds: [] as string[] }
                            ];

                            defaultFolders.forEach(df => {
                              if (!currentCols.some(c => c.name.toLowerCase() === df.name.toLowerCase())) {
                                currentCols.push(df);
                              }
                            });

                            // Analyze and categorize saved posts content using JagX AI rule engine
                            const savedPostsList = posts.filter(p => p.isSaved);
                            const updatedCols = currentCols.map(col => {
                              const folderName = col.name.toLowerCase();
                              const matchedPostIds = savedPostsList.filter(p => {
                                const text = (p.content + ' ' + p.authorName).toLowerCase();
                                if (folderName.includes('tech') || folderName.includes('dev')) {
                                  return text.includes('tech') || text.includes('ai') || text.includes('web3') || text.includes('node') || text.includes('code') || text.includes('dapp') || text.includes('cloud');
                                }
                                if (folderName.includes('finance') || folderName.includes('crypto')) {
                                  return text.includes('coin') || text.includes('credit') || text.includes('usd') || text.includes('invest') || text.includes('market') || text.includes('money');
                                }
                                if (folderName.includes('lifestyle') || folderName.includes('art') || folderName.includes('music')) {
                                  return text.includes('music') || text.includes('event') || text.includes('launch') || text.includes('community') || text.includes('afro') || text.includes('party');
                                }
                                return false;
                              }).map(p => p.id);

                              return {
                                ...col,
                                postIds: Array.from(new Set([...col.postIds, ...matchedPostIds]))
                              };
                            });

                            setSavedCollections(updatedCols);
                            setIsAutoSortingCollections(false);
                            triggerHaptic([50, 100, 50]);
                            triggerToast('✨ JagX AI analyzed post contents and auto-grouped them into Tech, Finance & Lifestyle folders!');
                          }, 1200);
                        }}
                        className="bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-[10px] font-black px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-md hover:brightness-110 transition disabled:opacity-50"
                      >
                        <Sparkles className={`w-3 h-3 ${isAutoSortingCollections ? 'animate-spin' : 'animate-pulse'}`} />
                        <span>{isAutoSortingCollections ? 'AI Analyzing...' : 'AI Auto-Sort'}</span>
                      </button>

                      <button 
                        onClick={() => setShowCreateCollectionModal(true)}
                        className="bg-[#1F222C] border border-gray-700 text-white text-[10px] font-bold px-2 py-1 rounded-xl flex items-center gap-1 hover:bg-gray-800 transition"
                      >
                        <Plus className="w-3 h-3" />
                        <span>New Folder</span>
                      </button>
                    </div>
                  </div>

                  {/* Drag and Drop Guide Banner */}
                  <div className="bg-[#14161D] border border-yellow-500/30 p-2.5 rounded-2xl flex items-center gap-2 text-xs text-yellow-400 font-medium">
                    <Move className="w-4 h-4 shrink-0 text-yellow-400 animate-pulse" />
                    <p className="text-[10px] leading-tight text-gray-300">
                      <strong className="text-yellow-400">Drag & Drop Ready:</strong> Drag saved posts onto folder cards below, or tap the quick selector to assign posts to custom categories!
                    </p>
                  </div>

                  {/* Active Folder Filter Header */}
                  {activeCollectionId && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 p-2.5 rounded-xl flex items-center justify-between">
                      <span className="text-xs text-yellow-400 font-bold flex items-center gap-1.5">
                        <span>📁 Viewing Folder:</span>
                        <u>{savedCollections.find(c => c.id === activeCollectionId)?.name}</u>
                      </span>
                      <button 
                        onClick={() => setActiveCollectionId(null)}
                        className="text-[10px] text-yellow-400 hover:underline font-bold"
                      >
                        Show All Folders
                      </button>
                    </div>
                  )}

                  {/* Drop-Target Folders Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {savedCollections.map(col => (
                      <div 
                        key={col.id}
                        onClick={() => setActiveCollectionId(col.id === activeCollectionId ? null : col.id)}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const postId = e.dataTransfer.getData('text/plain');
                          if (postId) {
                            setSavedCollections(prev => prev.map(c => c.id === col.id ? { ...c, postIds: Array.from(new Set([...c.postIds, postId])) } : c));
                            triggerHaptic([30, 60]);
                            triggerToast(`📁 Moved post into "${col.name}" collection!`);
                          }
                        }}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-2 relative group ${
                          activeCollectionId === col.id 
                            ? 'bg-yellow-500/15 border-yellow-500 text-white ring-2 ring-yellow-500/40' 
                            : 'bg-[#14161D] border-[#1F222C] text-gray-300 hover:border-yellow-500/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xl">{col.icon}</span>
                          <span className="text-[10px] text-gray-400 font-mono font-bold bg-[#1F222C] px-2 py-0.5 rounded-full">
                            {col.postIds.length} items
                          </span>
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-white leading-tight">{col.name}</h5>
                          <p className="text-[9px] text-gray-400 pt-0.5">Drop saved posts here</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Drag-and-Drop Saved Items Section */}
                  <div className="pt-2 space-y-2 border-t border-[#1F222C]">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-gray-300">
                        {activeCollectionId 
                          ? `Items in "${savedCollections.find(c => c.id === activeCollectionId)?.name}":` 
                          : 'All Saved Posts (Drag to Organize):'}
                      </h5>
                    </div>

                    <div className="space-y-2">
                      {posts
                        .filter(p => p.isSaved)
                        .filter(p => !activeCollectionId || savedCollections.find(c => c.id === activeCollectionId)?.postIds.includes(p.id))
                        .map(post => (
                          <div 
                            key={post.id}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData('text/plain', post.id)}
                            className="bg-[#14161D] border border-[#1F222C] hover:border-yellow-500/40 rounded-2xl p-3 space-y-2 cursor-grab active:cursor-grabbing transition"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Move className="w-3.5 h-3.5 text-gray-500" />
                                <img src={post.authorAvatar} className="w-6 h-6 rounded-full object-cover" />
                                <span className="text-xs font-bold text-white">{post.authorName}</span>
                              </div>

                              {/* Quick Move Selector */}
                              <select 
                                value=""
                                onChange={(e) => {
                                  const targetColId = e.target.value;
                                  if (targetColId) {
                                    setSavedCollections(prev => prev.map(c => c.id === targetColId ? { ...c, postIds: Array.from(new Set([...c.postIds, post.id])) } : c));
                                    triggerHaptic(25);
                                    triggerToast(`📁 Moved post to ${savedCollections.find(c => c.id === targetColId)?.name}`);
                                  }
                                }}
                                className="bg-[#1F222C] text-yellow-400 text-[10px] font-bold px-2 py-1 rounded-lg border border-yellow-500/30 focus:outline-none"
                              >
                                <option value="">Assign Folder...</option>
                                {savedCollections.map(c => (
                                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                                ))}
                              </select>
                            </div>

                            <p className="text-xs text-gray-200 line-clamp-2">{post.content}</p>

                            {/* Assigned Category Badges */}
                            <div className="flex items-center gap-1.5 flex-wrap pt-1">
                              {savedCollections.filter(c => c.postIds.includes(post.id)).map(c => (
                                <span key={c.id} className="text-[9px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                  <span>{c.icon}</span>
                                  <span>{c.name}</span>
                                  <button 
                                    onClick={() => {
                                      setSavedCollections(prev => prev.map(col => col.id === c.id ? { ...col, postIds: col.postIds.filter(id => id !== post.id) } : col));
                                      triggerHaptic(20);
                                      triggerToast(`Removed from ${c.name}`);
                                    }}
                                    className="ml-1 hover:text-red-400 font-bold"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}

                      {posts.filter(p => p.isSaved).length === 0 && (
                        <p className="text-xs text-gray-500 text-center py-6">No saved posts to organize.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* VIP BADGES TAB */}
              {profileTab === 'badges' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-yellow-400" />
                      <span>Your Community VIP Status & Badges</span>
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {userBadges.map((badge, i) => (
                      <div key={i} className="bg-[#14161D] border border-[#1F222C] p-3 rounded-2xl flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-yellow-500/10 text-yellow-400 flex items-center justify-center font-bold text-xs shrink-0">
                          💎
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-white">{badge}</h5>
                          <span className="text-[9px] text-emerald-400 font-bold">Active VIP Tier</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    )}
      </main>

      {/* COMMENTS MODAL */}
      {activeCommentsPostId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center">
          <div className="bg-[#14161D] border-t border-[#1F222C] rounded-t-3xl max-w-md w-full max-h-[80vh] flex flex-col p-4 space-y-3 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#1F222C]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-yellow-400" /> Comments
              </h3>
              <button onClick={() => setActiveCommentsPostId(null)}>
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>

            {/* Existing Comments List */}
            <div className="flex-1 overflow-y-auto space-y-3 py-2 max-h-64">
              {(!postComments[activeCommentsPostId] || postComments[activeCommentsPostId].length === 0) ? (
                <p className="text-xs text-gray-500 text-center py-6">No comments yet. Be the first to share your thoughts!</p>
              ) : (
                postComments[activeCommentsPostId].map(comm => (
                  <div key={comm.id} className="flex gap-2.5 bg-[#1F222C]/60 p-2.5 rounded-xl border border-gray-800">
                    <img src={comm.authorAvatar} className="w-7 h-7 rounded-full object-cover" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{comm.authorName}</span>
                        <span className="text-[10px] text-gray-500">{comm.timestamp}</span>
                      </div>
                      <p className="text-xs text-gray-300 mt-0.5">{comm.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#1F222C]">
              <input 
                type="text" 
                value={newCommentInput}
                onChange={e => setNewCommentInput(e.target.value)}
                placeholder="Write a comment..."
                onKeyDown={e => e.key === 'Enter' && handleAddComment(activeCommentsPostId)}
                className="flex-1 bg-[#1F222C] border border-gray-700 rounded-full px-4 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
              />
              <button 
                onClick={() => handleAddComment(activeCommentsPostId)}
                className="bg-yellow-500 text-black p-2 rounded-full font-bold hover:bg-yellow-400 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE CALL MODAL OVERLAY */}
      {showCall && (
        <div className="fixed inset-0 z-50 bg-[#0B0C10] flex flex-col justify-between p-8 text-center max-w-md mx-auto">
          <div className="pt-12 space-y-3">
            <h3 className="text-xl font-bold text-white">{showCall.partner}</h3>
            <p className="text-xs text-yellow-400 font-semibold">{showCall.isVideo ? 'JagX HD Video Call...' : 'JagX Encrypted Audio Call...'}</p>
            <p className="text-xs text-gray-500 font-mono">00:42</p>
          </div>

          <div className="flex justify-center gap-6 pb-12">
            <button className="w-14 h-14 rounded-full bg-[#1F222C] flex items-center justify-center text-white">
              <MicOff className="w-6 h-6" />
            </button>
            <button onClick={() => setShowCall(null)} className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white shadow-xl">
              <PhoneOff className="w-7 h-7" />
            </button>
            {showCall.isVideo && (
              <button className="w-14 h-14 rounded-full bg-[#1F222C] flex items-center justify-center text-white">
                <VideoOff className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* COIN GIFT MODAL */}
      {showGiftModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14161D] border border-[#1F222C] rounded-3xl p-5 max-w-xs w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>🪙</span> Send JagX Coin Gift
              </h3>
              <button onClick={() => setShowGiftModal(null)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <p className="text-xs text-gray-400">Balance: <span className="text-yellow-400 font-bold">{userCoins} Coins</span></p>

            <div className="grid grid-cols-3 gap-2">
              {[10, 50, 100, 500, 1000].map(amt => (
                <button 
                  key={amt}
                  onClick={() => handleGiftCoins(amt)}
                  className="bg-[#1F222C] border border-gray-700 hover:border-yellow-500 text-yellow-400 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1"
                >
                  <span>🪙</span> {amt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {confirmDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14161D] border border-red-500/30 rounded-3xl p-5 max-w-xs w-full space-y-4 text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 mx-auto flex items-center justify-center border border-red-500/20">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">
                {confirmDeleteModal.type === 'post' ? 'Delete Post?' : 'Remove Marketplace Listing?'}
              </h3>
              <p className="text-xs text-gray-400">
                Are you sure you want to delete this {confirmDeleteModal.type === 'post' ? 'post' : `listing "${confirmDeleteModal.title || ''}"`}? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button 
                onClick={() => setConfirmDeleteModal(null)}
                className="flex-1 bg-[#1F222C] hover:bg-gray-800 text-gray-300 font-bold text-xs py-2.5 rounded-xl border border-gray-700 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-lg shadow-red-600/20"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE POST MODAL WITH IMAGE PICKER TOGGLE */}
      {showCreatePost && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14161D] border border-[#1F222C] rounded-3xl p-5 max-w-xs w-full space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Create New Post</h3>
              <button onClick={() => { setShowCreatePost(false); setSelectedImageForPost(null); setShowImagePicker(false); }}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <textarea 
              id="post-text-input"
              rows={4} 
              placeholder="What's on your mind? Share updates..." 
              className="w-full bg-[#1F222C] border border-gray-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-yellow-500"
            />

            {/* Real device media picker: photo, video, or AI-generated */}
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <label className="flex flex-col items-center gap-1 text-[10px] text-yellow-400 font-semibold bg-yellow-500/10 py-2 rounded-xl border border-yellow-500/20 hover:bg-yellow-500/20 cursor-pointer">
                  <ImageIcon className="w-4 h-4" />
                  <span>Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setSelectedPostMediaFile(file);
                      setSelectedVideoForPost(null);
                      const reader = new FileReader();
                      reader.onload = () => setSelectedImageForPost(reader.result as string);
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
                <label className="flex flex-col items-center gap-1 text-[10px] text-blue-400 font-semibold bg-blue-500/10 py-2 rounded-xl border border-blue-500/20 hover:bg-blue-500/20 cursor-pointer">
                  <Video className="w-4 h-4" />
                  <span>Video</span>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setSelectedPostMediaFile(file);
                      setSelectedImageForPost(null);
                      const reader = new FileReader();
                      reader.onload = () => setSelectedVideoForPost(reader.result as string);
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreatePost(false);
                    setShowAiImageStudioModal(true);
                  }}
                  className="flex flex-col items-center gap-1 text-[10px] text-purple-400 font-semibold bg-purple-500/10 py-2 rounded-xl border border-purple-500/20 hover:bg-purple-500/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI Image</span>
                </button>
              </div>

              {selectedImageForPost && (
                <div className="relative rounded-xl overflow-hidden h-32 border border-yellow-500">
                  <img src={selectedImageForPost} className="w-full h-full object-cover" />
                  <button
                    onClick={() => { setSelectedImageForPost(null); setSelectedPostMediaFile(null); }}
                    className="absolute top-1 right-1 bg-black/70 rounded-full p-1 text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {selectedVideoForPost && (
                <div className="relative rounded-xl overflow-hidden h-40 border border-blue-500 bg-black">
                  <video src={selectedVideoForPost} controls className="w-full h-full object-contain" />
                  <button
                    onClick={() => { setSelectedVideoForPost(null); setSelectedPostMediaFile(null); }}
                    className="absolute top-1 right-1 bg-black/70 rounded-full p-1 text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <button 
              disabled={isPublishingPost}
              onClick={() => {
                const el = document.getElementById('post-text-input') as HTMLTextAreaElement;
                handleCreatePostSubmit(el?.value || '');
              }}
              className="w-full bg-yellow-500 text-black font-bold text-xs py-2.5 rounded-xl hover:bg-yellow-400 transition disabled:opacity-50"
            >
              {isPublishingPost ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </div>
      )}

      {/* AUTHENTICATION MODAL (LOGIN & SIGNUP) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14161D] border border-yellow-500/30 rounded-3xl p-6 max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-yellow-500/10 text-yellow-400 flex items-center justify-center border border-yellow-500/30 font-bold">
                  {authMode === 'login' ? <Lock className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                </div>
                <h3 className="text-base font-bold text-white">
                  {authMode === 'login' ? 'Login to JagX' : 'Create Account'}
                </h3>
              </div>
              <button onClick={() => setShowAuthModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {authError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-2.5 rounded-xl text-xs flex items-center gap-2">
                <X className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={authMode === 'login' ? handleLogin : handleSignUp} className="space-y-3">
              {authMode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-[11px] text-gray-400 font-bold">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="text" 
                      required
                      value={authName}
                      onChange={e => setAuthName(e.target.value)}
                      placeholder="e.g. Tajudeen Gbadamosi"
                      className="w-full bg-[#1F222C] border border-gray-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] text-gray-400 font-bold">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="email" 
                    required
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#1F222C] border border-gray-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-gray-400 font-bold">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="password" 
                    required
                    value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#1F222C] border border-gray-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={authLoading}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs py-2.5 rounded-xl transition shadow-lg shadow-yellow-500/20 mt-2 flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <span>{authMode === 'login' ? 'Sign In' : 'Register Now'}</span>
                )}
              </button>
            </form>

            {/* Social SSO Buttons */}
            <div className="space-y-2 pt-1">
              <div className="relative flex items-center justify-center my-1">
                <div className="border-t border-[#1F222C] w-full" />
                <span className="bg-[#14161D] px-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider absolute">OR CONNECT WITH</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="bg-[#1F222C] hover:bg-gray-800 text-white border border-gray-700 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={handleXAuth}
                  className="bg-[#1F222C] hover:bg-gray-800 text-white border border-gray-700 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <span className="font-mono text-yellow-400">𝕏</span>
                  <span>X / Twitter</span>
                </button>
              </div>
            </div>

            <div className="text-center pt-2 border-t border-[#1F222C]">
              {authMode === 'login' ? (
                <p className="text-xs text-gray-400">
                  Don't have an account?{' '}
                  <button onClick={() => { setAuthMode('signup'); setAuthError(null); }} className="text-yellow-400 font-bold underline">
                    Sign Up
                  </button>
                </p>
              ) : (
                <p className="text-xs text-gray-400">
                  Already registered?{' '}
                  <button onClick={() => { setAuthMode('login'); setAuthError(null); }} className="text-yellow-400 font-bold underline">
                    Login
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONNECTION INFO MODAL */}
      {showSupabaseConfigInfo && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14161D] border border-emerald-500/30 rounded-3xl p-5 max-w-sm w-full space-y-3 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Wifi className="w-4 h-4" />
                <span>Connection Status</span>
              </div>
              <button onClick={() => setShowSupabaseConfigInfo(false)}>
                <X className="w-4 h-4 text-gray-400 hover:text-white" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-gray-300">
              <p className="leading-relaxed">
                {isSupabaseConfigured()
                  ? <>You're <strong className="text-emerald-400">connected</strong>. Posts, chat, and your profile sync live across devices.</>
                  : <>You're in <strong className="text-yellow-400">offline mode</strong> — everything still works, but it's saved only on this device.</>
                }
              </p>

              <div className="bg-[#1F222C] p-2.5 rounded-xl border border-gray-800 space-y-1">
                <p className="font-bold text-white flex items-center gap-1">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" /> Offline Caching
                </p>
                <p className="text-[11px] text-gray-400 leading-normal">
                  If your connection drops, JagX Connect automatically saves your posts, messages, and session locally so nothing is lost.
                </p>
              </div>
            </div>

            <button 
              onClick={() => setShowSupabaseConfigInfo(false)}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs py-2 rounded-xl transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE CHAT / DM OVERLAY */}
      {activeChat && (
        <div className="fixed inset-0 z-50 bg-[#0B0C10] flex flex-col max-w-md mx-auto">
          {/* Chat Header */}
          <div className="bg-[#14161D] border-b border-[#1F222C] p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveChat(null)} className="p-1 text-gray-400 hover:text-white">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="relative">
                <img src={activeChat.partnerAvatar} className="w-9 h-9 rounded-full object-cover border border-[#1F222C]" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#14161D] absolute bottom-0 right-0 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1">
                  <span>{activeChat.partnerName}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </h4>
                <p className="text-[10px] text-emerald-400 font-medium">Online • Encrypted End-to-End</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setShowCall({ partner: activeChat.partnerName, isVideo: false })} className="p-2 text-yellow-400 bg-yellow-500/10 rounded-full hover:bg-yellow-500/20">
                <Phone className="w-4 h-4" />
              </button>
              <button onClick={() => setShowCall({ partner: activeChat.partnerName, isVideo: true })} className="p-2 text-yellow-400 bg-yellow-500/10 rounded-full hover:bg-yellow-500/20">
                <Video className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0B0C10]">
            {(messages[activeChat.id] || []).map(msg => {
              const isMe = msg.sender === 'me';
              const isEncrypted = msg.isEncrypted && !msg.isRevealed;

              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}>
                  <div
                    onClick={() => {
                      if (msg.isEncrypted && !msg.isRevealed) {
                        const currentTaps = (msg.tapCount || 0) + 1;
                        setMessages(prev => ({
                          ...prev,
                          [activeChat.id]: prev[activeChat.id].map(m => m.id === msg.id ? { ...m, tapCount: currentTaps } : m)
                        }));

                        if (currentTaps >= 3) {
                          setShowPinPromptModal({
                            conversationId: activeChat.id,
                            messageId: msg.id,
                            correctPin: msg.pinCode || '1234'
                          });
                        } else {
                          triggerToast(`🔒 Tap ${3 - currentTaps} more times to enter decryption PIN!`);
                        }
                      }
                    }}
                    className={`max-w-[80%] p-3 rounded-2xl relative transition cursor-pointer select-none ${
                      isMe 
                        ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-black rounded-tr-none font-medium shadow-md' 
                        : 'bg-[#14161D] border border-[#1F222C] text-white rounded-tl-none'
                    } ${isEncrypted ? 'border-2 border-dashed border-red-500/50 bg-red-950/20' : ''}`}
                  >
                    {/* Encrypted Glitch Text */}
                    {isEncrypted ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-red-400 font-mono text-[10px] font-bold">
                          <Lock className="w-3.5 h-3.5 animate-bounce" />
                          <span>Confidential PIN Cipher (Tap 3x)</span>
                        </div>
                        <p className="font-mono tracking-widest text-xs text-red-300/80 bg-black/40 p-2 rounded-lg break-all">
                          {toGlitchCipher(msg.content)}
                        </p>
                        <p className="text-[9px] text-gray-400 italic text-right">Taps: {msg.tapCount || 0}/3</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {msg.isRevealed && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 pb-0.5">
                            <Key className="w-3 h-3" />
                            <span>Decrypted with PIN</span>
                          </div>
                        )}
                        <p className="text-xs leading-relaxed">{msg.content}</p>
                      </div>
                    )}

                    {/* Audio Voice Note rendering */}
                    {msg.audioUrl && (
                      <div className="flex items-center gap-2 bg-black/30 p-2 rounded-xl mt-1">
                        <button className="w-7 h-7 rounded-full bg-yellow-500 text-black flex items-center justify-center font-bold text-xs">
                          ▶
                        </button>
                        <div className="flex items-center gap-1 flex-1 h-3">
                          {[40, 70, 30, 90, 50, 80, 40, 60, 30, 90, 50].map((h, i) => (
                            <div key={i} className="flex-1 bg-yellow-400 rounded-full" style={{ height: `${h}%` }} />
                          ))}
                        </div>
                        <span className="text-[9px] font-mono font-bold text-gray-300">0:14</span>
                      </div>
                    )}

                    {/* Image Attachment */}
                    {msg.imageUrl && (
                      <img src={msg.imageUrl} className="w-full h-32 object-cover rounded-xl mt-2 border border-black/20" />
                    )}

                    {/* Auto-destroy countdown badge */}
                    {msg.expiresAt && (
                      <div className="mt-1 flex items-center gap-1 text-[9px] font-mono font-bold text-orange-400 bg-orange-950/40 px-2 py-0.5 rounded-full border border-orange-500/30">
                        <Flame className="w-3 h-3 animate-pulse" />
                        <span>Self-destructs in {Math.max(0, Math.ceil((msg.expiresAt - Date.now()) / 1000))}s</span>
                      </div>
                    )}

                    <div className={`flex items-center justify-end gap-1.5 mt-1 font-mono text-[9px] ${isMe ? 'text-black/70 font-semibold' : 'text-gray-400'}`}>
                      <span>{msg.timestamp}</span>
                      {isMe && (
                        <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-950 bg-emerald-400/30 px-1.5 py-0.2 rounded" title="Read Receipt: Message read">
                          <span>✓✓</span>
                          <span>Read</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Composer Control Bar */}
          <div className="bg-[#14161D] border-t border-[#1F222C] p-3 space-y-2">
            {/* Options Bar: Cipher & Auto-destroy */}
            <div className="flex items-center justify-between text-[11px] bg-[#1F222C] p-2 rounded-xl border border-gray-800">
              <label className="flex items-center gap-1.5 cursor-pointer text-gray-300 font-semibold">
                <input 
                  type="checkbox" 
                  checked={isEncryptNextMessage}
                  onChange={e => setIsEncryptNextMessage(e.target.checked)}
                  className="rounded accent-yellow-500"
                />
                <Lock className="w-3.5 h-3.5 text-yellow-400" />
                <span>PIN Encrypt</span>
              </label>

              {isEncryptNextMessage && (
                <input 
                  type="text" 
                  maxLength={4}
                  value={nextMessagePin}
                  onChange={e => setNextMessagePin(e.target.value)}
                  placeholder="PIN"
                  className="w-16 bg-[#0B0C10] border border-yellow-500 text-yellow-400 text-center rounded-lg px-1.5 py-0.5 text-xs font-mono font-bold"
                />
              )}

              <div className="flex items-center gap-1 text-gray-400">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>Timer:</span>
                <select 
                  value={autoDestroySeconds}
                  onChange={e => setAutoDestroySeconds(Number(e.target.value))}
                  className="bg-[#0B0C10] text-yellow-400 border border-gray-700 rounded-lg text-[10px] px-1 py-0.5 font-bold focus:outline-none"
                >
                  <option value={0}>Off</option>
                  <option value={5}>5 sec</option>
                  <option value={30}>30 sec</option>
                  <option value={60}>1 min</option>
                </select>
              </div>
            </div>

            {/* Main Input Row */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleSendVoiceNote(activeChat.id)} 
                className="p-2.5 text-yellow-400 bg-[#1F222C] hover:bg-gray-800 border border-gray-700 rounded-full transition"
                title="Send Voice Note"
              >
                <Mic className="w-4 h-4" />
              </button>

              <input 
                type="text" 
                value={chatInputText}
                onChange={e => setChatInputText(e.target.value)}
                placeholder={isEncryptNextMessage ? "Type confidential message..." : "Type a message..."}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage(activeChat.id)}
                className="flex-1 bg-[#1F222C] border border-gray-700 rounded-full px-4 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
              />

              <button 
                onClick={() => handleSendMessage(activeChat.id)}
                className="bg-yellow-500 text-black p-2.5 rounded-full font-bold hover:bg-yellow-400 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIN PROMPT DECRYPTION MODAL */}
      {showPinPromptModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14161D] border border-yellow-500/50 rounded-3xl p-6 max-w-xs w-full space-y-4 text-center animate-in zoom-in-95 duration-150 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-yellow-500/10 text-yellow-400 mx-auto flex items-center justify-center border border-yellow-500/30">
              <Key className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Enter Decryption PIN</h3>
              <p className="text-xs text-gray-400">Input 4-digit security code to reveal the secret message content.</p>
            </div>

            <input 
              type="password"
              maxLength={4}
              value={enteredPin}
              onChange={e => setEnteredPin(e.target.value)}
              placeholder="••••"
              className="w-36 mx-auto bg-[#1F222C] border-2 border-yellow-500 rounded-2xl py-2.5 text-center text-lg tracking-[0.5em] font-mono text-yellow-400 font-black focus:outline-none"
            />

            <div className="flex items-center gap-2 pt-2">
              <button 
                onClick={() => { setShowPinPromptModal(null); setEnteredPin(''); }}
                className="flex-1 bg-[#1F222C] text-gray-300 font-bold text-xs py-2.5 rounded-xl border border-gray-700"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (enteredPin === showPinPromptModal.correctPin || enteredPin === '1234') {
                    setMessages(prev => ({
                      ...prev,
                      [showPinPromptModal.conversationId]: prev[showPinPromptModal.conversationId].map(m => 
                        m.id === showPinPromptModal.messageId ? { ...m, isRevealed: true } : m
                      )
                    }));
                    setShowPinPromptModal(null);
                    setEnteredPin('');
                    triggerToast('🔓 Message successfully decrypted!');
                  } else {
                    triggerToast('❌ Incorrect Security PIN! Try "1234"');
                  }
                }}
                className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs py-2.5 rounded-xl transition"
              >
                Decrypt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION DRAWER MODAL */}
      {showNotificationsDrawer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center">
          <div className="bg-[#14161D] border-t border-[#1F222C] rounded-t-3xl max-w-md w-full p-5 space-y-4 max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#1F222C]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-yellow-400" /> Notifications & Activity
              </h3>
              <button onClick={() => setShowNotificationsDrawer(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {notifications.length === 0 && (
                <div className="text-center py-14 space-y-2">
                  <Bell className="w-8 h-8 text-gray-600 mx-auto" />
                  <p className="text-xs text-gray-400 font-semibold">You're all caught up</p>
                  <p className="text-[11px] text-gray-500">New likes, comments and gifts will show up here.</p>
                </div>
              )}
              {notifications.map(n => (
                <div
                  key={n.id}
                  onClick={async () => {
                    if (n.read) return;
                    setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
                    if (isSupabaseConfigured() && currentUser?.id) {
                      const { error } = await supabase.from('notifications').update({ read: true }).eq('id', n.id);
                      if (error) console.warn('Mark-as-read sync failed:', error.message);
                    }
                  }}
                  className={`p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition ${n.read ? 'bg-[#1F222C]/50 border-gray-800/50' : 'bg-[#1F222C] border-yellow-500/30'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-yellow-500/10 text-yellow-400 flex items-center justify-center font-bold shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <h5 className={`text-xs font-bold ${n.read ? 'text-gray-400' : 'text-white'}`}>{n.title}</h5>
                    <p className="text-[11px] text-gray-300">{n.desc}</p>
                    <span className="text-[9px] text-gray-500 font-mono">{n.timestamp}</span>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0 mt-1" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* POST ANALYTICS MODAL */}
      {activeAnalyticsPost && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14161D] border border-yellow-500/30 rounded-3xl p-5 max-w-xs w-full space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F222C] pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-yellow-400" /> Post Analytics
              </h3>
              <button onClick={() => setActiveAnalyticsPost(null)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#1F222C] p-3 rounded-2xl border border-gray-800">
                <span className="text-base font-black text-yellow-400">{activeAnalyticsPost.analytics?.impressions || 1200}</span>
                <span className="text-[9px] text-gray-400 block font-bold">Impressions</span>
              </div>

              <div className="bg-[#1F222C] p-3 rounded-2xl border border-gray-800">
                <span className="text-base font-black text-emerald-400">{activeAnalyticsPost.analytics?.engagementRate || '18.2%'}</span>
                <span className="text-[9px] text-gray-400 block font-bold">Engagement</span>
              </div>

              <div className="bg-[#1F222C] p-3 rounded-2xl border border-gray-800">
                <span className="text-base font-black text-blue-400">{activeAnalyticsPost.analytics?.shares || 34}</span>
                <span className="text-[9px] text-gray-400 block font-bold">Shares</span>
              </div>
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed bg-[#1F222C] p-3 rounded-xl border border-gray-800">
              📈 Your post is performing <strong className="text-yellow-400">45% better</strong> than average community posts on JagX Connect!
            </p>
          </div>
        </div>
      )}

      {/* CREATE COLLECTION FOLDER MODAL */}
      {showCreateCollectionModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14161D] border border-yellow-500/40 rounded-3xl p-5 max-w-xs w-full space-y-3 animate-in zoom-in-95 duration-150 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-yellow-400" />
                <h3 className="text-sm font-bold text-white">Create New Collection</h3>
              </div>
              <button onClick={() => setShowCreateCollectionModal(false)}>
                <X className="w-4 h-4 text-gray-400 hover:text-white" />
              </button>
            </div>

            <p className="text-xs text-gray-400">Organize saved posts into custom folders (e.g. Web3, Tech, Marketing).</p>

            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase">Folder Icon Emoji</label>
                <div className="flex items-center gap-2 pt-1">
                  {['📁', '⚡', '🪙', '💎', '🔥', '🚀', '🎨', '📚'].map(emoji => (
                    <button 
                      key={emoji}
                      onClick={() => setNewCollectionIcon(emoji)}
                      className={`text-lg p-1.5 rounded-xl border transition ${newCollectionIcon === emoji ? 'border-yellow-500 bg-yellow-500/20' : 'border-gray-800 bg-[#1F222C]'}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase">Collection Name</label>
                <input 
                  type="text"
                  value={newCollectionName}
                  onChange={e => setNewCollectionName(e.target.value)}
                  placeholder="e.g. AI Innovations 2026"
                  className="w-full bg-[#1F222C] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 mt-1"
                />
              </div>
            </div>

            <button 
              onClick={() => handleCreateCollection(newCollectionName, newCollectionIcon)}
              className="w-full bg-yellow-500 text-black font-bold text-xs py-2.5 rounded-xl hover:bg-yellow-400 transition"
            >
              Create Folder
            </button>
          </div>
        </div>
      )}

      {/* ADD POST TO COLLECTION MODAL */}
      {showAddToCollectionPostId && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14161D] border border-yellow-500/40 rounded-3xl p-5 max-w-xs w-full space-y-3 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-yellow-400" />
                <span>Save to Collection Folder</span>
              </h3>
              <button onClick={() => setShowAddToCollectionPostId(null)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <p className="text-xs text-gray-400">Choose a folder to categorize this post:</p>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {savedCollections.map(col => (
                <button 
                  key={col.id}
                  onClick={() => handleAddPostToCollection(showAddToCollectionPostId, col.id)}
                  className="w-full bg-[#1F222C] border border-gray-800 hover:border-yellow-500 p-2.5 rounded-xl flex items-center justify-between text-xs transition"
                >
                  <span className="flex items-center gap-2 text-white font-semibold">
                    <span>{col.icon}</span>
                    <span>{col.name}</span>
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">{col.postIds.length} posts</span>
                </button>
              ))}
            </div>

            <button 
              onClick={() => {
                setShowAddToCollectionPostId(null);
                setShowCreateCollectionModal(true);
              }}
              className="w-full bg-[#1F222C] border border-dashed border-gray-700 text-yellow-400 font-bold text-xs py-2 rounded-xl hover:border-yellow-500 transition flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Folder</span>
            </button>
          </div>
        </div>
      )}

      {/* SHARE PROFILE QR CODE MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14161D] border border-yellow-500/40 rounded-3xl p-6 max-w-xs w-full space-y-4 text-center animate-in zoom-in-95 duration-150 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Profile QR Code</h3>
              <button onClick={() => setShowQrModal(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>

            {/* Generated QR Graphic */}
            <div className="bg-white p-4 rounded-2xl mx-auto w-44 h-44 flex flex-col items-center justify-center shadow-inner relative">
              <div className="grid grid-cols-6 gap-1.5 w-full h-full p-2 bg-black rounded-xl">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`rounded-sm ${i % 2 === 0 || i % 5 === 0 ? 'bg-yellow-400' : 'bg-white/20'}`} 
                  />
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-yellow-500 text-black font-black flex items-center justify-center border-2 border-white shadow-lg text-xs">
                  ⚡
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white">{currentUser?.name || "Tajudeen Gbadamosi"}</h4>
              <p className="text-xs text-yellow-400 font-mono font-semibold">{currentUser?.handle || "@jagx_tajudeen"}</p>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`https://jri.network/user/${currentUser?.handle || 'jagx_tajudeen'}`);
                  triggerToast('📋 Profile link copied to clipboard!');
                }}
                className="flex-1 bg-yellow-500 text-black font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </button>
              <button 
                onClick={() => {
                  triggerToast('📲 QR Code saved to photo gallery!');
                  setShowQrModal(false);
                }}
                className="bg-[#1F222C] text-white font-bold text-xs px-3 py-2 rounded-xl border border-gray-700"
              >
                Save Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TIP JAR MODAL */}
      {showTipModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14161D] border border-blue-500/40 rounded-3xl p-5 max-w-xs w-full space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>🪙</span> Creator Tip Jar
              </h3>
              <button onClick={() => setShowTipModal(null)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>

            <div className="flex items-center gap-3 bg-[#1F222C] p-3 rounded-2xl border border-gray-800">
              <img src={showTipModal.avatar} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <h4 className="text-xs font-bold text-white">{showTipModal.userName}</h4>
                <p className="text-[10px] text-gray-400">{showTipModal.handle}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-2">Select Tip Amount (Coins):</p>
              <div className="grid grid-cols-3 gap-2">
                {[20, 50, 100, 250, 500].map(amt => (
                  <button 
                    key={amt}
                    onClick={() => setTipAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${tipAmount === amt ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-[#1F222C] text-yellow-400 border-gray-800'}`}
                  >
                    🪙 {amt}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => {
                if (userCoins < tipAmount) {
                  triggerToast('⚠️ Insufficient coin balance! Please top up.');
                  return;
                }
                setUserCoins(userCoins - tipAmount);
                triggerToast(`🪙 Tipped ${tipAmount} coins to ${showTipModal.userName}! Thank you!`);
                setShowTipModal(null);
              }}
              className="w-full bg-blue-500 text-white font-bold text-xs py-2.5 rounded-xl hover:bg-blue-400 transition"
            >
              Send {tipAmount} Coins Tip
            </button>
          </div>
        </div>
      )}

      {/* REQUEST VERIFICATION BADGE MODAL */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14161D] border border-emerald-500/40 rounded-3xl p-5 max-w-xs w-full space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>Verification Badge</span>
              </div>
              <button onClick={() => setShowVerifyModal(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Apply for a gold/emerald verified checkmark on your JagX profile to establish trust and unlock priority feed exposure.
            </p>

            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase">Reason or Social Reference</label>
              <textarea 
                rows={3}
                value={verifyReasonInput}
                onChange={e => setVerifyReasonInput(e.target.value)}
                placeholder="Link your portfolio, business website, or Twitter handle..."
                className="w-full bg-[#1F222C] border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button 
              onClick={() => {
                triggerToast('✅ Verification request submitted for admin review!');
                setShowVerifyModal(false);
              }}
              className="w-full bg-emerald-500 text-black font-bold text-xs py-2.5 rounded-xl hover:bg-emerald-400 transition"
            >
              Submit Application
            </button>
          </div>
        </div>
      )}

      {/* BLOCKED USERS MANAGEMENT MODAL */}
      {showBlockedUsersModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14161D] border border-red-500/30 rounded-3xl p-5 max-w-xs w-full space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <UserX className="w-5 h-5" />
                <span>Blocked Accounts</span>
              </div>
              <button onClick={() => setShowBlockedUsersModal(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto">
              {blockedUsers.map(handle => (
                <div key={handle} className="bg-[#1F222C] p-2.5 rounded-xl flex items-center justify-between border border-gray-800 text-xs">
                  <span className="font-bold text-white">{handle}</span>
                  <button 
                    onClick={() => handleUnblockUser(handle)}
                    className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-bold hover:bg-emerald-500/30 transition"
                  >
                    Unblock
                  </button>
                </div>
              ))}
              {blockedUsers.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-6">No blocked accounts.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ENHANCED SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14161D] border border-[#1F222C] rounded-3xl p-5 max-w-xs w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-yellow-400" />
                <span>App Settings & Controls</span>
              </h3>
              <button onClick={() => setShowSettings(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            
            <div className="space-y-3 text-xs">
              {/* Focus Mode Toggle */}
              <div className="bg-[#1F222C] p-2.5 rounded-xl border border-gray-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-white font-bold">
                    <Target className="w-4 h-4 text-yellow-400" />
                    <span>Focus Mode</span>
                  </span>
                  <button 
                    onClick={() => {
                      const nextFocus = !isFocusMode;
                      setIsFocusMode(nextFocus);
                      triggerHaptic(40);
                      triggerToast(nextFocus ? '🎯 Focus Mode ON: Close Friends feed only. Ads hidden!' : '🌐 Focus Mode OFF: Feed restored.');
                    }}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition ${isFocusMode ? 'bg-yellow-500 text-black shadow-md font-black' : 'bg-gray-800 text-gray-400'}`}
                  >
                    {isFocusMode ? 'ACTIVE' : 'OFF'}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400">Filters feed to show only Close Friends. Hides ads & general recommendations.</p>
              </div>

              {/* JagX Light vs Deep Space Dark Mode Toggle */}
              <div className="bg-[#1F222C] p-2.5 rounded-xl border border-gray-800 flex items-center justify-between">
                <span className="flex items-center gap-2 text-white font-bold">
                  {isLightMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-yellow-400" />}
                  <span>Display Theme</span>
                </span>
                <button 
                  onClick={() => {
                    const nextMode = !isLightMode;
                    setIsLightMode(nextMode);
                    triggerHaptic(50);
                    triggerToast(nextMode ? '☀️ Switched to JagX Light Mode' : '🌙 Switched to Deep Space Dark Mode');
                  }}
                  className={`text-[10px] font-bold px-3 py-1 rounded-full transition ${isLightMode ? 'bg-amber-400 text-black' : 'bg-gray-800 text-yellow-400 border border-yellow-500/30'}`}
                >
                  {isLightMode ? 'JagX Light ☀️' : 'Deep Space 🌙'}
                </button>
              </div>

              {/* Capacitor Haptics Control */}
              <div className="bg-[#1F222C] p-2.5 rounded-xl border border-gray-800 flex items-center justify-between">
                <span className="flex items-center gap-2 text-white font-bold">
                  <Vibrate className="w-4 h-4 text-yellow-400" />
                  <span>Capacitor Haptics</span>
                </span>
                <button 
                  onClick={() => {
                    const nextHaptics = !hapticsEnabled;
                    setHapticsEnabled(nextHaptics);
                    if (nextHaptics) triggerHaptic([40, 60, 40]);
                    triggerToast(nextHaptics ? '📳 Haptic vibration enabled' : '🔕 Haptic vibration disabled');
                  }}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition ${hapticsEnabled ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400'}`}
                >
                  {hapticsEnabled ? 'ACTIVE' : 'OFF'}
                </button>
              </div>

              <div>
                <p className="text-gray-400 font-bold mb-1">Theme Accent</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['gold', 'cyan', 'emerald', 'purple'] as const).map(acc => (
                    <button 
                      key={acc}
                      onClick={() => setAccentTheme(acc)}
                      className={`py-2 rounded-xl font-bold capitalize border transition ${accentTheme === acc ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400' : 'border-gray-800 text-gray-400'}`}
                    >
                      {acc}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#1F222C] space-y-2">
                {/* Capacitor Push Notifications Control */}
                <div className="bg-[#1F222C] p-2.5 rounded-xl border border-gray-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-white font-bold">
                      <Bell className="w-4 h-4 text-yellow-400" />
                      <span>Push Notifications</span>
                    </span>
                    <button 
                      onClick={() => {
                        setPushEnabled(!pushEnabled);
                        triggerToast(pushEnabled ? '🔕 Push notifications disabled' : '🔔 Push notifications enabled');
                      }}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition ${pushEnabled ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400'}`}
                    >
                      {pushEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  {pushEnabled && (
                    <button 
                      onClick={() => {
                        triggerPushNotification('💬 New Direct Message', 'Aisha Bello: "Hey Tajudeen! Check out the new Web3 protocol!"');
                        triggerToast('📲 Test Push Notification sent!');
                      }}
                      className="w-full bg-[#14161D] text-yellow-400 border border-yellow-500/30 text-[10px] font-bold py-1.5 rounded-lg hover:border-yellow-400 transition"
                    >
                      Send Test Push Alert
                    </button>
                  )}
                </div>

                {/* Data Saver Mode Toggle */}
                <div className="bg-[#1F222C] p-2.5 rounded-xl border border-gray-800 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-white font-bold">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span>Data Saver Mode</span>
                  </span>
                  <button 
                    onClick={() => {
                      setIsDataSaverMode(!isDataSaverMode);
                      triggerToast(isDataSaverMode ? '⚡ Data Saver disabled' : '📶 Data Saver enabled (Optimized media loading)');
                    }}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition ${isDataSaverMode ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400'}`}
                  >
                    {isDataSaverMode ? 'ACTIVE' : 'OFF'}
                  </button>
                </div>

                {/* Capacitor Deep Linking Simulator */}
                <button 
                  onClick={() => {
                    setShowSettings(false);
                    const samplePost = posts[0];
                    if (samplePost) setDeepSharePostModal(samplePost);
                  }}
                  className="w-full bg-[#1F222C] text-gray-300 font-bold py-2 rounded-xl flex items-center justify-between px-3 border border-gray-800 hover:border-yellow-500/50 transition"
                >
                  <span className="flex items-center gap-2">
                    <Link className="w-4 h-4 text-yellow-400" />
                    <span>Capacitor Deep Link Simulator</span>
                  </span>
                  <span className="text-[10px] text-yellow-400 font-mono">jagx://</span>
                </button>

                <button 
                  onClick={() => {
                    setShowSettings(false);
                    setShowBlockedUsersModal(true);
                  }}
                  className="w-full bg-[#1F222C] text-gray-300 font-bold py-2 rounded-xl flex items-center justify-between px-3 border border-gray-800"
                >
                  <span className="flex items-center gap-2">
                    <UserX className="w-4 h-4 text-red-400" />
                    <span>Manage Blocked Users</span>
                  </span>
                  <span className="text-[10px] text-gray-500">{blockedUsers.length}</span>
                </button>

                <button 
                  onClick={() => {
                    setShowSettings(false);
                    setShowSupabaseConfigInfo(true);
                  }}
                  className="w-full bg-[#1F222C] text-gray-300 font-bold py-2 rounded-xl flex items-center justify-between px-3 border border-gray-800"
                >
                  <span className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-emerald-400" />
                    <span>Sync & Connection</span>
                  </span>
                  <span className="text-[10px] text-emerald-400">{isSupabaseConfigured() ? 'Connected' : 'Offline'}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1F222C] text-center text-[11px] text-gray-500">
              JagX Connect v1.0 • Built by JRI
            </div>
          </div>
        </div>
      )}

      {/* LIGHTWEIGHT IMAGE CROPPER MODAL */}
      {cropperState && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14161D] border border-yellow-500/50 rounded-3xl p-5 max-w-xs w-full space-y-4 animate-in zoom-in-95 duration-150 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm">
                <Crop className="w-5 h-5" />
                <span className="capitalize">Crop & Adjust {cropperState.type}</span>
              </div>
              <button onClick={() => setCropperState(null)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>

            {/* Cropper Frame Viewport */}
            <div className="relative overflow-hidden bg-black/60 rounded-2xl border border-gray-800 flex items-center justify-center h-48">
              <div 
                className="transition-transform duration-100 flex items-center justify-center"
                style={{
                  transform: `scale(${cropperState.zoom}) rotate(${cropperState.rotation}deg)`
                }}
              >
                <img 
                  src={cropperState.imageUrl} 
                  className={`object-cover ${cropperState.type === 'avatar' ? 'w-32 h-32 rounded-full border-2 border-yellow-500' : 'w-64 h-32 rounded-xl border-2 border-yellow-500'}`} 
                />
              </div>

              {/* Grid overlay */}
              <div className="absolute inset-0 border border-dashed border-yellow-500/40 pointer-events-none rounded-2xl" />
            </div>

            {/* Controls */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="font-bold flex items-center gap-1"><ZoomIn className="w-3.5 h-3.5 text-yellow-400" /> Zoom ({cropperState.zoom.toFixed(1)}x)</span>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2.5" 
                  step="0.1" 
                  value={cropperState.zoom}
                  onChange={e => setCropperState({ ...cropperState, zoom: parseFloat(e.target.value) })}
                  className="w-32 accent-yellow-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setCropperState({ ...cropperState, rotation: (cropperState.rotation + 90) % 360 })}
                  className="bg-[#1F222C] text-gray-300 font-bold text-xs px-3 py-1.5 rounded-xl border border-gray-700 flex items-center gap-1.5 hover:border-yellow-500 transition"
                >
                  <RotateCw className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Rotate ({cropperState.rotation}°)</span>
                </button>

                <button 
                  onClick={() => setCropperState({ ...cropperState, zoom: 1, rotation: 0 })}
                  className="bg-[#1F222C] text-gray-400 font-bold text-xs px-2.5 py-1.5 rounded-xl border border-gray-800 hover:text-white"
                >
                  Reset
                </button>
              </div>
            </div>

            <button 
              onClick={() => {
                if (cropperState.type === 'avatar') {
                  setCurrentUser(prev => prev ? { ...prev, avatar: cropperState.imageUrl } : prev);
                  triggerToast('✨ Avatar image cropped and updated!');
                } else {
                  setProfileBannerUrl(cropperState.imageUrl);
                  triggerToast('🖼️ Profile cover banner cropped and updated!');
                }
                setCropperState(null);
              }}
              className="w-full bg-yellow-500 text-black font-bold text-xs py-2.5 rounded-xl hover:bg-yellow-400 transition"
            >
              Apply Cropped Image
            </button>
          </div>
        </div>
      )}

      {/* FULL-SCREEN TIKTOK GIFT ANIMATION FX OVERLAY */}
      {activeGiftFx && (
        <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-center p-4 overflow-hidden animate-in fade-in duration-150">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

          {/* Dynamic FX Graphic Renderers based on fxType */}
          <div className="relative z-10 flex flex-col items-center text-center space-y-4 animate-in zoom-in-75 duration-300">
            {/* Animated Icon Emblem with Pulsing Golden Glow */}
            <div className="relative">
              <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-yellow-500/30 via-amber-400/50 to-orange-500/30 border-4 border-yellow-400 flex items-center justify-center text-7xl shadow-[0_0_80px_rgba(234,179,8,0.8)] animate-bounce">
                {activeGiftFx.giftIcon}
              </div>
              <div className="absolute -top-3 -right-3 bg-red-600 text-white font-black text-sm px-3 py-1 rounded-full border-2 border-white shadow-xl animate-pulse">
                {activeGiftFx.multiplier > 1 ? `x${activeGiftFx.multiplier}` : 'GIFT!'}
              </div>
            </div>

            {/* Banner details */}
            <div className="bg-gradient-to-r from-black/90 via-[#14161D] to-black/90 border-2 border-yellow-500/80 px-8 py-3.5 rounded-3xl shadow-2xl space-y-1">
              <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 uppercase tracking-widest flex items-center justify-center gap-2">
                <span>⚡ {activeGiftFx.senderName} SENT {activeGiftFx.giftName}!</span>
              </h2>
              <p className="text-xs text-gray-300 font-bold flex items-center justify-center gap-1.5">
                <span>Total Value:</span>
                <span className="text-yellow-400 font-mono font-black text-sm">🪙 {activeGiftFx.giftCoins.toLocaleString()} JagX Coins</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* COIN TOSS ANIMATION OVERLAY */}
      {activeCoinToss && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
          <div className="relative animate-in zoom-in-50 fade-in duration-300 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 border-4 border-yellow-200 flex items-center justify-center text-4xl shadow-[0_0_50px_rgba(234,179,8,1)] animate-bounce">
              🪙
            </div>
            <div className="bg-black/80 backdrop-blur-md border border-yellow-500/80 px-4 py-1.5 rounded-full text-xs font-black text-yellow-400 shadow-xl mt-2 animate-pulse">
              🪙 Tossed {activeCoinToss.amount} Coins!
            </div>
          </div>
        </div>
      )}

      {/* DAILY MISSIONS CHECKLIST MODAL */}
      {showMissionsModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14161D] border-2 border-yellow-500/50 rounded-3xl p-5 max-w-xs w-full space-y-4 animate-in zoom-in-95 duration-150 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1F222C] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎯</span>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Daily Missions</h3>
                  <p className="text-[10px] text-gray-400">Complete daily tasks to earn JagX Coins!</p>
                </div>
              </div>
              <button onClick={() => setShowMissionsModal(false)}>
                <X className="w-4 h-4 text-gray-400 hover:text-white" />
              </button>
            </div>

            <div className="space-y-2.5">
              {dailyMissions.map(m => (
                <div key={m.id} className="bg-[#1F222C] p-3 rounded-2xl border border-gray-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{m.icon}</span>
                      <div>
                        <h4 className="text-xs font-bold text-white">{m.title}</h4>
                        <span className="text-[10px] font-mono text-yellow-400 font-bold">+🪙 {m.reward} Reward</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-gray-400">
                      {m.current}/{m.target}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-yellow-500 h-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (m.current / m.target) * 100)}%` }}
                    />
                  </div>

                  {/* Claim reward button if completed but not claimed */}
                  {m.completed && !m.claimed && (
                    <button
                      onClick={() => {
                        setUserCoins(prev => prev + m.reward);
                        setDailyMissions(prev => prev.map(item => item.id === m.id ? { ...item, claimed: true } : item));
                        triggerHaptic([30, 80, 40]);
                        triggerToast(`🎉 Claimed +🪙${m.reward} JagX Coins reward!`);
                      }}
                      className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-extrabold text-xs py-1.5 rounded-xl shadow-md hover:brightness-110 transition animate-pulse"
                    >
                      Claim +🪙{m.reward} Reward!
                    </button>
                  )}
                  {m.claimed && (
                    <div className="text-center py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-xl">
                      ✓ Reward Claimed
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowMissionsModal(false)}
              className="w-full bg-[#1F222C] border border-gray-700 text-white font-bold text-xs py-2 rounded-xl"
            >
              Close Checklist
            </button>
          </div>
        </div>
      )}

      {/* RICH TIKTOK-STYLE 100-VIRTUAL GIFTS MODAL */}
      {showGiftModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-end justify-center animate-in slide-in-from-bottom duration-200">
          <div className="bg-[#14161D] border-t-2 border-yellow-500/50 rounded-t-3xl max-w-md w-full p-4 space-y-3.5 max-h-[85vh] flex flex-col shadow-[0_-10px_50px_rgba(234,179,8,0.2)]">
            {/* Header: Creator & Coin Balance */}
            <div className="flex items-center justify-between border-b border-[#1F222C] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-black border border-yellow-500/40 text-sm">
                  🎁
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Send Virtual Gift</h3>
                  <p className="text-[10px] text-gray-400 font-mono">100+ Live Gifts Catalog</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setUserCoins(prev => prev + 1000);
                    triggerHaptic([30, 60]);
                    triggerToast('🪙 Recharged +1,000 JagX Coins!');
                  }}
                  className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-yellow-500/30 transition"
                >
                  <span>🪙 {userCoins.toLocaleString()}</span>
                  <span className="text-white bg-yellow-500 text-black px-1.5 py-0.2 rounded-full text-[8px] font-black">+ Topup</span>
                </button>
                <button onClick={() => setShowGiftModal(null)} className="text-gray-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Category Tabs Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] font-extrabold">
              {(['Popular', 'Luxury', 'Beasts', 'Universe', 'Imperial'] as const).map(cat => (
                <button 
                  key={cat}
                  onClick={() => {
                    setGiftCategoryTab(cat);
                    triggerHaptic(20);
                  }}
                  className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition ${giftCategoryTab === cat ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black border-yellow-400 font-black shadow-md' : 'bg-[#1F222C] text-gray-400 border-gray-800 hover:text-white'}`}
                >
                  {cat === 'Popular' && '🔥 Popular'}
                  {cat === 'Luxury' && '💎 Luxury'}
                  {cat === 'Beasts' && '🦁 Beasts'}
                  {cat === 'Universe' && '🚀 Universe'}
                  {cat === 'Imperial' && '👑 Imperial'}
                </button>
              ))}
            </div>

            {/* Search Input for Gifts */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
              <input 
                type="text"
                value={giftSearchQuery}
                onChange={e => setGiftSearchQuery(e.target.value)}
                placeholder="Search 100+ virtual gifts (e.g. Lion, Rose, Car, Rocket)..."
                className="w-full bg-[#1F222C] border border-gray-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
              />
            </div>

            {/* 100-Gift Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-4 gap-2 pr-1 scrollbar-thin">
              {GENERATED_TIKTOK_GIFTS
                .filter(g => giftSearchQuery ? g.name.toLowerCase().includes(giftSearchQuery.toLowerCase()) : g.category === giftCategoryTab)
                .map(gift => (
                  <button 
                    key={gift.id}
                    onClick={() => handleSendTikTokGift(gift)}
                    className="bg-[#1F222C] hover:bg-yellow-500/10 hover:border-yellow-500/80 p-2.5 rounded-2xl border border-gray-800 flex flex-col items-center text-center space-y-1 transition group active:scale-95"
                  >
                    <span className="text-2xl group-hover:scale-125 transition-transform">{gift.icon}</span>
                    <span className="text-[10px] font-bold text-gray-200 truncate w-full">{gift.name}</span>
                    <span className="text-[9px] bg-black/60 text-yellow-400 px-1.5 py-0.5 rounded-full font-mono font-black border border-yellow-500/30">
                      🪙 {gift.coins >= 1000 ? `${(gift.coins / 1000).toFixed(1)}k` : gift.coins}
                    </span>
                  </button>
                ))}
            </div>

            {/* Bottom Multiplier Controls & Send Action Bar */}
            <div className="pt-2 border-t border-[#1F222C] flex items-center justify-between gap-3">
              <div className="flex items-center gap-1 bg-[#1F222C] p-1 rounded-xl border border-gray-800">
                {[1, 5, 10, 99, 999].map(m => (
                  <button 
                    key={m}
                    onClick={() => {
                      setGiftMultiplier(m);
                      triggerHaptic(20);
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-black transition ${giftMultiplier === m ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    x{m}
                  </button>
                ))}
              </div>

              <div className="text-[10px] text-gray-400 font-medium text-right">
                <span>Tap any gift above to send instantly!</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {storyViewersModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14161D] border border-yellow-500/40 rounded-3xl p-5 max-w-xs w-full space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-yellow-400" />
                  <span>Story Viewers ({storyViewersModal.viewers.length})</span>
                </h3>
                <p className="text-[10px] text-gray-400">{storyViewersModal.storyName}</p>
              </div>
              <button onClick={() => setStoryViewersModal(null)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto">
              {storyViewersModal.viewers.map((viewer, idx) => (
                <div key={idx} className="bg-[#1F222C] p-2.5 rounded-xl flex items-center justify-between border border-gray-800 text-xs">
                  <div className="flex items-center gap-2.5">
                    <img src={viewer.avatar} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <h5 className="font-bold text-white text-xs">{viewer.name}</h5>
                      <span className="text-[10px] text-gray-400">{viewer.time}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      triggerToast(`👋 Wave sent to ${viewer.name}!`);
                    }}
                    className="text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 px-2 py-1 rounded-lg font-bold hover:bg-yellow-500/20"
                  >
                    👋 Wave
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATOR VIP SUBSCRIPTION TIERS MODAL */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14161D] border-2 border-emerald-500/40 rounded-3xl p-5 max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-150 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1F222C] pb-2">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-black text-white">VIP Creator Membership</h3>
              </div>
              <button onClick={() => setShowSubscriptionModal(null)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>

            <div className="flex items-center gap-3 bg-[#1F222C] p-3 rounded-2xl border border-gray-800">
              <img src={showSubscriptionModal.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400" />
              <div>
                <h4 className="text-xs font-bold text-white">{showSubscriptionModal.creatorName}</h4>
                <p className="text-[10px] text-gray-400">{showSubscriptionModal.handle}</p>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30 inline-block mt-1">
                  Exclusive Posts & Live Audio Access
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { name: 'Bronze VIP Pass', coins: 100, perks: ['Exclusive VIP Badge in Chat', 'Private Subscribers-Only Posts'] },
                { name: 'Gold Imperial VIP', coins: 500, perks: ['Direct DM Priority Pass', 'Custom Emoji Reaction Unlocks', 'Free Monthly Rose Gift'] }
              ].map(tier => (
                <div key={tier.name} className="bg-[#1F222C] p-3 rounded-2xl border border-gray-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-white">{tier.name}</span>
                    <span className="text-xs font-mono font-black text-yellow-400">🪙 {tier.coins}/mo</span>
                  </div>
                  <ul className="text-[10px] text-gray-400 space-y-1 pl-3 list-disc">
                    {tier.perks.map((p, idx) => <li key={idx}>{p}</li>)}
                  </ul>
                  <button 
                    onClick={() => {
                      if (userCoins < tier.coins) {
                        triggerToast('⚠️ Insufficient coin balance!');
                        return;
                      }
                      setUserCoins(prev => prev - tier.coins);
                      setUserSubscribedCreators(prev => [...prev, showSubscriptionModal.handle]);
                      triggerHaptic([40, 80]);
                      triggerToast(`👑 VIP Subscribed to ${showSubscriptionModal.creatorName}!`);
                      setShowSubscriptionModal(null);
                    }}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs py-2 rounded-xl transition"
                  >
                    Subscribe ({tier.coins} Coins)
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* JAGX YIELD VAULT & STAKING POOLS MODAL */}
      {showVaultModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14161D] border-2 border-yellow-500/50 rounded-3xl p-5 max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-150 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1F222C] pb-2">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-yellow-400" />
                <h3 className="text-sm font-black text-white">JagX Yield Vault Staking</h3>
              </div>
              <button onClick={() => setShowVaultModal(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>

            <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent p-4 rounded-2xl border border-yellow-500/40 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-300 font-bold">Staking Yield APY</span>
                <span className="text-base font-black text-yellow-400 font-mono">12.4% APY</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Total Coins Staked</span>
                <span className="text-white font-mono font-bold">🪙 {stakedCoins.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Yield Earned</span>
                <span className="text-emerald-400 font-mono font-bold">+🪙 {stakedYieldEarned.toFixed(1)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => {
                  if (userCoins < 100) {
                    triggerToast('⚠️ Need at least 100 coins to stake!');
                    return;
                  }
                  setUserCoins(prev => prev - 100);
                  setStakedCoins(prev => prev + 100);
                  triggerHaptic(40);
                  triggerToast('🪙 Staked +100 JagX Coins in 12.4% Yield Vault!');
                }}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs py-2.5 rounded-xl transition"
              >
                Stake +100 Coins
              </button>

              <button 
                onClick={() => {
                  if (stakedCoins <= 0) return;
                  setUserCoins(prev => prev + stakedCoins + Math.floor(stakedYieldEarned));
                  setStakedCoins(0);
                  setStakedYieldEarned(0);
                  triggerHaptic(50);
                  triggerToast('💸 Unstaked all coins + yield earned to wallet!');
                }}
                className="bg-[#1F222C] border border-gray-700 hover:border-yellow-500 text-white font-extrabold text-xs py-2.5 rounded-xl transition"
              >
                Claim & Unstake
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMMUNITY DAO GOVERNANCE VOTING MODAL */}
      {showDaoVotingModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14161D] border-2 border-purple-500/50 rounded-3xl p-5 max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-150 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1F222C] pb-2">
              <div className="flex items-center gap-2">
                <Vote className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-black text-white">Community DAO Governance</h3>
              </div>
              <button onClick={() => setShowDaoVotingModal(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto">
              {daoProposals.map(prop => (
                <div key={prop.id} className="bg-[#1F222C] p-3 rounded-2xl border border-gray-800 space-y-2">
                  <h4 className="text-xs font-bold text-white leading-snug">{prop.title}</h4>
                  <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                    <span className="text-emerald-400 font-bold">YES: {prop.yesVotes.toLocaleString()}</span>
                    <span className="text-red-400 font-bold">NO: {prop.noVotes.toLocaleString()}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button 
                      disabled={!!prop.userVoted}
                      onClick={() => {
                        setDaoProposals(prev => prev.map(p => p.id === prop.id ? { ...p, yesVotes: p.yesVotes + 1, userVoted: 'yes' } : p));
                        triggerHaptic(30);
                        triggerToast('🗳️ Voted YES on DAO Proposal!');
                      }}
                      className={`py-1.5 rounded-xl text-xs font-extrabold transition ${prop.userVoted === 'yes' ? 'bg-emerald-500 text-black' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'}`}
                    >
                      {prop.userVoted === 'yes' ? 'Voted YES ✓' : 'Vote YES'}
                    </button>

                    <button 
                      disabled={!!prop.userVoted}
                      onClick={() => {
                        setDaoProposals(prev => prev.map(p => p.id === prop.id ? { ...p, noVotes: p.noVotes + 1, userVoted: 'no' } : p));
                        triggerHaptic(30);
                        triggerToast('🗳️ Voted NO on DAO Proposal!');
                      }}
                      className={`py-1.5 rounded-xl text-xs font-extrabold transition ${prop.userVoted === 'no' ? 'bg-red-500 text-white' : 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'}`}
                    >
                      {prop.userVoted === 'no' ? 'Voted NO ✓' : 'Vote NO'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI IMAGE STUDIO MODAL */}
      {showAiImageStudioModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14161D] border-2 border-blue-500/50 rounded-3xl p-5 max-w-xs w-full space-y-4 animate-in zoom-in-95 duration-150 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1F222C] pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-black text-white">JagX AI Image Studio</h3>
              </div>
              <button onClick={() => setShowAiImageStudioModal(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-300 font-bold">Describe image to generate:</label>
              <textarea 
                rows={3}
                value={aiImagePrompt}
                onChange={e => setAiImagePrompt(e.target.value)}
                placeholder="e.g. Futuristic Cyberpunk Lagos skyline with flying cars and golden Web3 logos..."
                className="w-full bg-[#1F222C] border border-gray-700 rounded-2xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button 
              disabled={isGeneratingAiImage || !aiImagePrompt.trim()}
              onClick={async () => {
                setIsGeneratingAiImage(true);
                triggerHaptic(30);
                try {
                  const result = await jagxGenerateImage(aiImagePrompt.trim());
                  const dataUrl = imageResultToDataUrl(result);
                  setGeneratedAiImageUrl(dataUrl);
                  setSelectedImageForPost(dataUrl);
                  triggerToast('🎨 JagX AI image generated and attached to post!');
                  setShowAiImageStudioModal(false);
                } catch (err) {
                  console.error('JagX AI image generation failed:', err);
                  triggerToast(`⚠️ AI image generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
                } finally {
                  setIsGeneratingAiImage(false);
                }
              }}
              className="w-full bg-blue-500 hover:bg-blue-400 text-white font-extrabold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2"
            >
              {isGeneratingAiImage ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Generating AI Image...</span>
                </>
              ) : (
                <span>Generate & Attach to Post 🎨</span>
              )}
            </button>
            {!isJagxAIConfigured() && (
              <p className="text-[10px] text-yellow-400 text-center">
                ⚠️ JagX AI key not set — add VITE_JAGX_AI_API_KEY to your .env to enable this.
              </p>
            )}
          </div>
        </div>
      )}

      {/* CREATE MARKETPLACE LISTING MODAL */}
      {showCreateProduct && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14161D] border-2 border-yellow-500/40 rounded-3xl p-5 max-w-sm w-full space-y-3 animate-in zoom-in-95 duration-150 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1F222C] pb-2">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-yellow-400" />
                <h3 className="text-sm font-black text-white">List an Item</h3>
              </div>
              <button onClick={() => setShowCreateProduct(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>

            <input
              type="text"
              value={newProductTitle}
              onChange={e => setNewProductTitle(e.target.value)}
              placeholder="Item title"
              className="w-full bg-[#1F222C] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
            />
            <textarea
              value={newProductDescription}
              onChange={e => setNewProductDescription(e.target.value)}
              rows={2}
              placeholder="Describe the item..."
              className="w-full bg-[#1F222C] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={newProductPriceCoins}
                onChange={e => setNewProductPriceCoins(e.target.value)}
                placeholder="Price in Coins"
                className="w-full bg-[#1F222C] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
              />
              <input
                type="number"
                value={newProductPriceUsd}
                onChange={e => setNewProductPriceUsd(e.target.value)}
                placeholder="Price in USD"
                className="w-full bg-[#1F222C] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
              />
            </div>

            <label className="flex flex-col items-center gap-1 text-[10px] text-yellow-400 font-semibold bg-yellow-500/10 py-3 rounded-xl border border-yellow-500/20 hover:bg-yellow-500/20 cursor-pointer">
              <ImageIcon className="w-4 h-4" />
              <span>{newProductImagePreview ? 'Change Photo' : 'Add Photo'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setNewProductImageFile(file);
                  const reader = new FileReader();
                  reader.onload = () => setNewProductImagePreview(reader.result as string);
                  reader.readAsDataURL(file);
                }}
              />
            </label>
            {newProductImagePreview && (
              <img src={newProductImagePreview} className="w-full h-28 object-cover rounded-xl border border-yellow-500" />
            )}

            <button
              disabled={isPublishingProduct || !newProductTitle.trim()}
              onClick={handleCreateProductSubmit}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs py-2.5 rounded-xl transition disabled:opacity-50"
            >
              {isPublishingProduct ? 'Listing...' : 'List Item'}
            </button>
          </div>
        </div>
      )}


      {deepSharePostModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#14161D] border-2 border-yellow-500/50 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-[0_0_50px_rgba(234,179,8,0.25)] animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1F222C] pb-2">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-yellow-400" />
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Share Card Preview</h3>
              </div>
              <button 
                onClick={() => setDeepSharePostModal(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* DYNAMIC BRANDED SHARE SUMMARY CARD PREVIEW */}
            <div className="bg-gradient-to-br from-[#1C1E26] via-[#14161D] to-[#0B0C10] border-2 border-yellow-500/40 rounded-2xl p-4 space-y-3 relative overflow-hidden shadow-2xl">
              {/* Branded JagX Banner Header */}
              <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-lg bg-yellow-500 text-black font-black flex items-center justify-center text-xs shadow-md">
                    ⚡
                  </div>
                  <span className="text-xs font-black tracking-widest text-white">JAGX CONNECT</span>
                </div>
                <span className="text-[9px] bg-yellow-500/20 text-yellow-400 font-extrabold px-2 py-0.5 rounded-full border border-yellow-500/30">
                  OFFICIAL POST
                </span>
              </div>

              {/* Author Info Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img src={deepSharePostModal.authorAvatar} className="w-9 h-9 rounded-full object-cover border-2 border-yellow-500" />
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1">
                      <span>{deepSharePostModal.authorName}</span>
                      <CheckCircle className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400/20" />
                    </h4>
                    <p className="text-[10px] text-gray-400 font-mono">{deepSharePostModal.authorHandle} • {deepSharePostModal.timestamp}</p>
                  </div>
                </div>

                <span className="text-[10px] text-gray-300 font-medium bg-[#1F222C] px-2 py-0.5 rounded-full flex items-center gap-1 border border-gray-800">
                  <Clock className="w-3 h-3 text-yellow-400" />
                  <span>{calculateReadingTime(deepSharePostModal.content)}</span>
                </span>
              </div>

              {/* Content Snippet */}
              <div className="bg-[#0B0C10]/80 p-3 rounded-xl border border-gray-800/80 space-y-1.5">
                <p className="text-xs text-gray-200 leading-relaxed font-medium line-clamp-3">
                  "{deepSharePostModal.content}"
                </p>
                {deepSharePostModal.imageUrl && (
                  <div className="relative rounded-lg overflow-hidden border border-gray-800 max-h-28">
                    <img src={deepSharePostModal.imageUrl} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Post Engagement Summary Stats Bar */}
              <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold bg-[#1F222C]/60 px-3 py-1.5 rounded-xl border border-gray-800">
                <span className="text-red-400 font-bold">❤️ {deepSharePostModal.likesCount} Likes</span>
                <span className="text-blue-400 font-bold">💬 {deepSharePostModal.commentsCount} Comments</span>
                <span className="text-yellow-400 font-bold">🪙 {deepSharePostModal.giftsCount} Gifts</span>
              </div>
            </div>

            {/* Deep Links Schema Details */}
            <div className="bg-[#1F222C] p-3 rounded-2xl border border-gray-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase">
                <span>Capacitor Native Deep Link</span>
                <span className="text-yellow-400 font-mono">jagx://</span>
              </div>
              <div className="bg-black/60 p-2 rounded-xl text-yellow-400 font-mono text-[11px] break-all border border-gray-800">
                jagx://post/{deepSharePostModal.id}
              </div>

              <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase pt-1">
                <span>Web Redirect URL</span>
                <span className="text-emerald-400 font-mono">HTTPS</span>
              </div>
              <div className="bg-black/60 p-2 rounded-xl text-emerald-400 font-mono text-[10px] break-all border border-gray-800">
                https://jri.network/app#post={deepSharePostModal.id}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button 
                onClick={() => {
                  triggerHaptic([40, 80]);
                  const summaryText = `⚡ JAGX CONNECT POST BY ${deepSharePostModal.authorName} (${deepSharePostModal.authorHandle})\n\n"${deepSharePostModal.content}"\n\n🔗 Read full post: https://jri.network/app#post=${deepSharePostModal.id}`;
                  navigator.clipboard.writeText(summaryText);
                  triggerToast('📋 Rich Share Summary copied to clipboard!');
                }}
                className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-extrabold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 transition"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Rich Share Card Summary</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => {
                    triggerHaptic(30);
                    navigator.clipboard.writeText(`jagx://post/${deepSharePostModal.id}`);
                    triggerToast('📋 Native Deep Link copied!');
                  }}
                  className="bg-[#1F222C] border border-gray-700 hover:border-yellow-500 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1 transition"
                >
                  <Copy className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Copy Deep Link</span>
                </button>

                <button 
                  onClick={() => {
                    triggerHaptic([30, 60]);
                    window.location.hash = `#post=${deepSharePostModal.id}`;
                    triggerToast('🔗 Navigating via Deep Link simulation...');
                    setDeepSharePostModal(null);
                  }}
                  className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1 hover:bg-yellow-500/30 transition"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Test Link</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE LIVE STREAM ROOM WITH REAL-TIME CHAT OVERLAY */}
      {activeLiveRoom && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between max-w-md mx-auto animate-in fade-in duration-200">
          {/* Stream Background Video Simulation */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80" 
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90" />
          </div>

          {/* Floating Emoji Reactions Overlay */}
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            {liveStreamEmojis.map(item => (
              <div 
                key={item.id} 
                className="absolute bottom-24 text-3xl animate-bounce transition-all duration-1000"
                style={{ left: `${item.left}%` }}
              >
                {item.emoji}
              </div>
            ))}
          </div>

          {/* Top Host & Stream Header */}
          <div className="relative z-20 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
              <img src={activeLiveRoom.hostAvatar} className="w-8 h-8 rounded-full object-cover border border-yellow-500" />
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1">
                  <span>{activeLiveRoom.hostName}</span>
                  <span className="text-[9px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded">LIVE</span>
                </h4>
                <p className="text-[10px] text-gray-300">👁️ {activeLiveRoom.viewerCount} Viewers</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowGiftModal(activeLiveRoom.id)}
                className="bg-yellow-500 text-black font-extrabold text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1"
              >
                <span>🪙</span>
                <span>Gift</span>
              </button>
              <button 
                onClick={() => setActiveLiveRoom(null)}
                className="bg-black/60 hover:bg-black/90 text-white p-2 rounded-full backdrop-blur-md border border-white/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Middle Goal Progress Bar */}
          <div className="relative z-20 px-4">
            <div className="bg-black/60 backdrop-blur-md border border-yellow-500/30 p-2.5 rounded-2xl space-y-1">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-yellow-400">🪙 Live Stream Coin Goal</span>
                <span className="text-white">{liveStreamGoal.current} / {liveStreamGoal.target} Coins</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-amber-400 h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (liveStreamGoal.current / liveStreamGoal.target) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Gifting Streak UI Component */}
          {giftingStreak.count > 0 && (
            <div className="relative z-20 px-4 pt-2">
              <div className="bg-gradient-to-r from-orange-500/30 via-amber-500/20 to-orange-500/30 backdrop-blur-md border-2 border-orange-500/80 p-2.5 rounded-2xl flex items-center justify-between shadow-[0_0_20px_rgba(249,115,22,0.4)] animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-yellow-500 flex items-center justify-center text-lg shadow-lg border border-yellow-300 animate-bounce">
                    🔥
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-white uppercase tracking-wider">
                        x{giftingStreak.count} Gifting Streak!
                      </span>
                      {giftingStreak.multiplier > 1 && (
                        <span className="text-[9px] bg-yellow-400 text-black px-1.5 py-0.2 rounded-full font-black border border-white">
                          ⚡ {giftingStreak.multiplier}x Multiplier
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-orange-300 font-bold">
                      {giftingStreak.count < 3 ? 'Send 2 more gifts to unlock 1.2x Multiplier!' : giftingStreak.count < 5 ? 'Send gifts to reach 5x Streak bonus!' : '⚡ Max Streak Active! Bonus Coins Unlocked!'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowGiftModal(activeLiveRoom.id)}
                  className="bg-gradient-to-r from-yellow-500 to-amber-400 hover:from-yellow-400 hover:to-amber-300 text-black font-extrabold text-[11px] px-3 py-1.5 rounded-xl shadow-lg transition active:scale-95 shrink-0"
                >
                  Send Gift 🎁
                </button>
              </div>
            </div>
          )}

          {/* Bottom Live Chat Overlay & Composer */}
          <div className="relative z-20 p-4 space-y-3">
            {/* Scrolling Messages Overlay */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2 scrollbar-none flex flex-col justify-end">
              {liveStreamMessages.map(msg => (
                <div key={msg.id} className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-2xl flex items-center gap-2 max-w-[85%] self-start animate-in slide-in-from-bottom-2 duration-150">
                  <img src={msg.avatar} className="w-6 h-6 rounded-full object-cover shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-yellow-400 mr-1.5">{msg.user}:</span>
                    <span className="text-white font-medium">{msg.text}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Emoji Reaction Buttons */}
            <div className="flex items-center gap-2 pt-1">
              {['🔥', '🪙', '❤️', '👏', '🚀'].map(emoji => (
                <button 
                  key={emoji} 
                  onClick={() => {
                    handleTriggerReaction(emoji);
                    triggerHaptic(30);
                  }}
                  className="bg-black/60 hover:bg-black/90 border border-white/20 p-2 rounded-full text-base transition active:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Live Message Input */}
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={newLiveMsgText}
                onChange={e => setNewLiveMsgText(e.target.value)}
                placeholder="Send a message to host..."
                onKeyDown={e => {
                  if (e.key === 'Enter' && newLiveMsgText.trim()) {
                    sendLiveChatMessage(newLiveMsgText);
                  }
                }}
                className="flex-1 bg-black/70 border border-white/20 rounded-full px-4 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 backdrop-blur-md"
              />
              <button 
                onClick={() => sendLiveChatMessage(newLiveMsgText)}
                className="bg-yellow-500 text-black p-2.5 rounded-full font-bold hover:bg-yellow-400 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPORT USER / FLAG CONTENT MODAL */}
      {showReportUserModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14161D] border border-red-500/40 rounded-3xl p-5 max-w-xs w-full space-y-4 animate-in zoom-in-95 duration-150 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1F222C] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>Report Profile</span>
              </h3>
              <button onClick={() => setShowReportUserModal(null)}>
                <X className="w-4 h-4 text-gray-400 hover:text-white" />
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-white">{showReportUserModal.userName} <span className="text-gray-400 font-normal">({showReportUserModal.handle})</span></p>
              <p className="text-[11px] text-gray-400">Select reason for flagging this profile or content for review under community guidelines:</p>
            </div>

            <div className="space-y-1.5">
              {[
                'Hate Speech, Harassment & Bullying',
                'Spam, Scam, or Misleading Info',
                'Impersonation of Brand / Creator',
                'Inappropriate, Explicit or Illegal Media',
                'Copyright or Intellectual Property Violation'
              ].map((reason, idx) => (
                <button 
                  key={idx}
                  onClick={() => {
                    triggerHaptic([30, 50]);
                    triggerToast(`🚨 Report for ${showReportUserModal.userName} submitted! JagX Moderation notified.`);
                    setShowReportUserModal(null);
                  }}
                  className="w-full text-left bg-[#1F222C] hover:bg-red-500/20 hover:border-red-500/50 text-gray-200 p-2.5 rounded-xl border border-gray-800 text-xs font-medium transition"
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* QR CODE SCANNER CAMERA MODAL */}
      {showQrScannerModal && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between max-w-md mx-auto p-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#1F222C] pb-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <QrCode className="w-5 h-5 text-yellow-400 animate-pulse" />
              <span>JagX Camera QR Scanner</span>
            </div>
            <button 
              onClick={() => {
                setShowQrScannerModal(false);
                setScannedQrUser(null);
              }}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Live Viewfinder / Camera Frame */}
          <div className="relative flex-1 my-4 bg-gray-900 rounded-3xl overflow-hidden border-2 border-yellow-500/40 flex items-center justify-center">
            <video 
              ref={qrVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />

            {/* Viewfinder Target Reticle */}
            <div className="relative z-10 w-56 h-56 border-2 border-yellow-400 rounded-2xl flex flex-col items-center justify-between p-2 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
              <div className="w-full flex justify-between">
                <div className="w-4 h-4 border-t-2 border-l-2 border-yellow-400" />
                <div className="w-4 h-4 border-t-2 border-r-2 border-yellow-400" />
              </div>
              
              <div className="w-full h-0.5 bg-yellow-400 shadow-[0_0_15px_#eab308] animate-bounce" />

              <div className="w-full flex justify-between">
                <div className="w-4 h-4 border-b-2 border-l-2 border-yellow-400" />
                <div className="w-4 h-4 border-b-2 border-r-2 border-yellow-400" />
              </div>
            </div>

            <p className="absolute bottom-4 text-[11px] text-yellow-400 bg-black/70 px-3 py-1 rounded-full font-bold backdrop-blur-md">
              Center target QR code inside viewfinder
            </p>
          </div>

          {/* Instant Test QR Buttons & Camera Action Controls */}
          <div className="space-y-3">
            <p className="text-[10px] text-gray-400 text-center font-semibold">Instant Test QR Scans (Tap to simulate scan):</p>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => {
                  triggerHaptic([40, 80, 40]);
                  setScannedQrUser({
                    name: 'Aisha Bello',
                    handle: '@aisha_tech',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
                    bio: 'Lead AI Engineer & JagX Ambassador',
                    coins: 5400
                  });
                }}
                className="bg-[#1F222C] border border-gray-700 hover:border-yellow-500 p-2.5 rounded-2xl text-xs font-bold text-white flex items-center gap-2 transition"
              >
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" className="w-6 h-6 rounded-full object-cover" />
                <span className="truncate">Scan @aisha_tech</span>
              </button>

              <button 
                onClick={() => {
                  triggerHaptic([40, 80, 40]);
                  setScannedQrUser({
                    name: 'Davido Official',
                    handle: '@davido_official',
                    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
                    bio: 'Afrobeats Superstar & Creator',
                    coins: 18900
                  });
                }}
                className="bg-[#1F222C] border border-gray-700 hover:border-yellow-500 p-2.5 rounded-2xl text-xs font-bold text-white flex items-center gap-2 transition"
              >
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80" className="w-6 h-6 rounded-full object-cover" />
                <span className="truncate">Scan @davido</span>
              </button>
            </div>

            {/* Scanned Result Card overlay */}
            {scannedQrUser && (
              <div className="bg-[#14161D] border-2 border-yellow-500 p-4 rounded-3xl space-y-3 animate-in slide-in-from-bottom-3 duration-200 shadow-2xl">
                <div className="flex items-center gap-3">
                  <img src={scannedQrUser.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-yellow-500" />
                  <div>
                    <h4 className="text-xs font-extrabold text-white flex items-center gap-1">
                      <span>{scannedQrUser.name}</span>
                      <CheckCircle className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400/20" />
                    </h4>
                    <p className="text-[10px] text-gray-400">{scannedQrUser.handle}</p>
                    <p className="text-[10px] text-yellow-400 font-semibold">{scannedQrUser.bio}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button 
                    onClick={() => {
                      triggerHaptic(40);
                      triggerToast(`✅ Now following ${scannedQrUser.name} via QR scan!`);
                      setScannedQrUser(null);
                      setShowQrScannerModal(false);
                    }}
                    className="bg-yellow-500 text-black text-[10px] font-extrabold py-2 rounded-xl hover:bg-yellow-400 transition"
                  >
                    Follow
                  </button>
                  <button 
                    onClick={() => {
                      triggerHaptic(30);
                      setActiveTab('chat');
                      setShowQrScannerModal(false);
                      setScannedQrUser(null);
                      triggerToast(`💬 Opened direct chat thread with ${scannedQrUser.name}`);
                    }}
                    className="bg-[#1F222C] border border-gray-700 text-white text-[10px] font-bold py-2 rounded-xl hover:bg-gray-800 transition"
                  >
                    Message
                  </button>
                  <button 
                    onClick={() => {
                      triggerHaptic(30);
                      setShowTipModal({ userName: scannedQrUser.name, handle: scannedQrUser.handle });
                      setShowQrScannerModal(false);
                      setScannedQrUser(null);
                    }}
                    className="bg-orange-500/20 text-orange-400 border border-orange-500/40 text-[10px] font-bold py-2 rounded-xl hover:bg-orange-500/30 transition"
                  >
                    Tip Coins 🪙
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QUICK ACTIONS RADIAL MENU OVERLAY */}
      {radialQuickActionPost && (
        <div 
          onClick={() => setRadialQuickActionPost(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col items-center justify-center w-80 h-80 bg-[#14161D]/90 border-2 border-yellow-500/50 rounded-full p-6 shadow-[0_0_50px_rgba(234,179,8,0.25)] animate-in zoom-in-90 duration-200"
          >
            {/* Center Hub Avatar & Post Details */}
            <div className="w-24 h-24 rounded-full bg-[#0B0C10] border-2 border-yellow-400 p-1 flex flex-col items-center justify-center text-center shadow-lg relative z-20">
              <img src={radialQuickActionPost.authorAvatar} className="w-10 h-10 rounded-full object-cover border border-yellow-500 mb-1" />
              <span className="text-[10px] font-black text-white truncate max-w-[80px]">{radialQuickActionPost.authorName}</span>
              <span className="text-[8px] text-yellow-400 font-bold">Quick Actions</span>
            </div>

            {/* Radial Button 1: Share (Top-Left) */}
            <button 
              onClick={() => {
                triggerHaptic(30);
                setDeepSharePostModal(radialQuickActionPost);
                setRadialQuickActionPost(null);
              }}
              className="absolute top-4 left-10 bg-yellow-500 hover:bg-yellow-400 text-black p-3.5 rounded-full font-bold shadow-xl border-2 border-black transition active:scale-125 flex flex-col items-center group"
              title="Share Post"
            >
              <Share2 className="w-5 h-5" />
              <span className="absolute -bottom-6 text-[9px] font-extrabold text-white bg-black/90 px-1.5 py-0.5 rounded border border-yellow-500/40 opacity-0 group-hover:opacity-100 transition">
                Share
              </span>
            </button>

            {/* Radial Button 2: Mute User (Top-Right) */}
            <button 
              onClick={() => {
                triggerHaptic(40);
                const handle = radialQuickActionPost.authorHandle;
                setBlockedUsers(prev => Array.from(new Set([...prev, handle])));
                setRadialQuickActionPost(null);
                triggerToast(`🔇 Muted all posts from ${radialQuickActionPost.authorName} (${handle})`);
              }}
              className="absolute top-4 right-10 bg-red-600 hover:bg-red-500 text-white p-3.5 rounded-full font-bold shadow-xl border-2 border-black transition active:scale-125 flex flex-col items-center group"
              title="Mute User"
            >
              <VolumeX className="w-5 h-5" />
              <span className="absolute -bottom-6 text-[9px] font-extrabold text-white bg-black/90 px-1.5 py-0.5 rounded border border-red-500/40 opacity-0 group-hover:opacity-100 transition">
                Mute
              </span>
            </button>

            {/* Radial Button 3: Add to Collection (Bottom-Left) */}
            <button 
              onClick={() => {
                triggerHaptic(30);
                handleToggleSave(radialQuickActionPost.id);
                setRadialQuickActionPost(null);
                triggerToast(`📁 Saved post to your JagX Collections!`);
              }}
              className="absolute bottom-4 left-10 bg-emerald-500 hover:bg-emerald-400 text-black p-3.5 rounded-full font-bold shadow-xl border-2 border-black transition active:scale-125 flex flex-col items-center group"
              title="Add to Collection"
            >
              <BookmarkPlus className="w-5 h-5" />
              <span className="absolute -top-6 text-[9px] font-extrabold text-white bg-black/90 px-1.5 py-0.5 rounded border border-emerald-500/40 opacity-0 group-hover:opacity-100 transition">
                Collection
              </span>
            </button>

            {/* Radial Button 4: Translate Post (Bottom-Right) */}
            <button 
              onClick={() => {
                triggerHaptic(30);
                const p = radialQuickActionPost;
                setPostTranslations(prev => ({
                  ...prev,
                  [p.id]: {
                    translatedText: p.language === 'fr' 
                      ? 'Hello everyone! We are very excited to present the new version of JagX Connect. The Web3 network is incredible! 🚀✨ #Tech #Web3'
                      : `Translated (${p.language || 'Detected'} → English): "${p.content}"`,
                    sourceLang: p.language === 'fr' ? 'French' : 'Native Dialect',
                    isTranslating: false
                  }
                }));
                setRadialQuickActionPost(null);
                triggerToast(`🌐 Translated post using JagX AI Translate API`);
              }}
              className="absolute bottom-4 right-10 bg-purple-600 hover:bg-purple-500 text-white p-3.5 rounded-full font-bold shadow-xl border-2 border-black transition active:scale-125 flex flex-col items-center group"
              title="Translate Post"
            >
              <Languages className="w-5 h-5" />
              <span className="absolute -top-6 text-[9px] font-extrabold text-white bg-black/90 px-1.5 py-0.5 rounded border border-purple-500/40 opacity-0 group-hover:opacity-100 transition">
                Translate
              </span>
            </button>

            {/* Close hint */}
            <button 
              onClick={() => setRadialQuickActionPost(null)}
              className="absolute -bottom-8 text-xs text-gray-400 hover:text-white underline font-semibold"
            >
              Tap background to close
            </button>
          </div>
        </div>
      )}

      {/* SHARE POLL DEEP LINK MODAL */}
      {sharePollModalPost && sharePollModalPost.poll && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#14161D] border-2 border-yellow-500/50 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#1F222C] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-black text-sm border border-yellow-500/40">
                  📊
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Share Poll Deep Link</h3>
                  <p className="text-[10px] text-gray-400">Directly link users to vote</p>
                </div>
              </div>
              <button onClick={() => setSharePollModalPost(null)} className="text-gray-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Poll Question Preview Card */}
            <div className="bg-[#1F222C] border border-gray-800 p-3 rounded-2xl space-y-1.5">
              <p className="text-xs font-bold text-yellow-400">📊 "{sharePollModalPost.poll.question}"</p>
              <p className="text-[10px] text-gray-400 font-medium">By {sharePollModalPost.authorName} ({sharePollModalPost.authorHandle}) • {sharePollModalPost.poll.totalVotes} votes</p>
            </div>

            {/* Generated Deep Link Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-300 flex items-center justify-between">
                <span>Generated Poll Deep Link</span>
                <span className="text-[9px] text-yellow-400 font-mono">jagx://poll/{sharePollModalPost.id}</span>
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={`https://jri.network/app#poll=${sharePollModalPost.id}`} 
                  className="flex-1 bg-[#1F222C] border border-gray-800 rounded-xl px-3 py-2 text-xs text-yellow-400 font-mono focus:outline-none"
                />
                <button 
                  onClick={() => {
                    navigator.clipboard?.writeText(`https://jri.network/app#poll=${sharePollModalPost.id}`);
                    triggerHaptic([30, 60]);
                    triggerToast('📋 Poll deep link copied to clipboard!');
                  }}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            {/* One-Tap Social Sharing Buttons */}
            <div className="space-y-2 pt-1">
              <p className="text-[10px] text-gray-400 uppercase font-extrabold tracking-wider">Share via Channels</p>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                {/* WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`📊 Vote in this JagX Poll: "${sharePollModalPost.poll.question}"\nhttps://jri.network/app#poll=${sharePollModalPost.id}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => triggerHaptic(30)}
                  className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <span>💬 WhatsApp</span>
                </a>

                {/* Twitter / X */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`📊 Vote in this JagX Poll: "${sharePollModalPost.poll.question}"`)}&url=${encodeURIComponent(`https://jri.network/app#poll=${sharePollModalPost.id}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => triggerHaptic(30)}
                  className="bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <span>𝕏 Twitter</span>
                </a>

                {/* Telegram */}
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(`https://jri.network/app#poll=${sharePollModalPost.id}`)}&text=${encodeURIComponent(`📊 Vote in this JagX Poll: "${sharePollModalPost.poll.question}"`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => triggerHaptic(30)}
                  className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <span>✈️ Telegram</span>
                </a>

                {/* Direct DM in App */}
                <button
                  onClick={() => {
                    triggerHaptic(30);
                    triggerToast('💬 Poll shared to your active JagX DMs!');
                    setSharePollModalPost(null);
                  }}
                  className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <span>✉️ JagX DMs</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* JAGX POLL DEMOGRAPHICS & ANALYTICS API MODAL */}
      {showPollAnalyticsModal && showPollAnalyticsModal.poll && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#14161D] border-2 border-yellow-500/50 rounded-3xl p-5 max-w-md w-full space-y-4 max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1F222C] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-black text-sm border border-yellow-500/40">
                  📊
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">JagX Poll Analytics Engine</h3>
                  <p className="text-[10px] text-gray-400 font-mono">Real-time voter demographic insights</p>
                </div>
              </div>
              <button onClick={() => setShowPollAnalyticsModal(null)} className="text-gray-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Question Summary & Key Metrics Card */}
            <div className="bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent p-3.5 rounded-2xl border border-yellow-500/30 space-y-2">
              <p className="text-xs font-bold text-yellow-300">"{showPollAnalyticsModal.poll.question}"</p>
              
              <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                <div className="bg-[#14161D]/80 p-2 rounded-xl border border-gray-800">
                  <span className="text-[9px] text-gray-400 block uppercase font-sans font-extrabold">Total Votes</span>
                  <span className="text-sm font-black text-yellow-400">{showPollAnalyticsModal.poll.totalVotes}</span>
                </div>
                <div className="bg-[#14161D]/80 p-2 rounded-xl border border-gray-800">
                  <span className="text-[9px] text-gray-400 block uppercase font-sans font-extrabold">Engagement</span>
                  <span className="text-sm font-black text-emerald-400">96.4%</span>
                </div>
                <div className="bg-[#14161D]/80 p-2 rounded-xl border border-gray-800">
                  <span className="text-[9px] text-gray-400 block uppercase font-sans font-extrabold">Virality</span>
                  <span className="text-sm font-black text-purple-400">8.8/10</span>
                </div>
              </div>
            </div>

            {/* Option Selector Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] font-extrabold">
              <button
                onClick={() => {
                  setAnalyticsSelectedOptionId('all');
                  triggerHaptic(20);
                }}
                className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition ${
                  analyticsSelectedOptionId === 'all' 
                    ? 'bg-yellow-500 text-black border-yellow-400 font-black' 
                    : 'bg-[#1F222C] text-gray-400 border-gray-800 hover:text-white'
                }`}
              >
                🌐 All Voters Combined
              </button>
              {showPollAnalyticsModal.poll.options.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setAnalyticsSelectedOptionId(opt.id);
                    triggerHaptic(20);
                  }}
                  className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition ${
                    analyticsSelectedOptionId === opt.id 
                      ? 'bg-yellow-500 text-black border-yellow-400 font-black' 
                      : 'bg-[#1F222C] text-gray-400 border-gray-800 hover:text-white'
                  }`}
                >
                  "{opt.text.length > 15 ? opt.text.slice(0, 15) + '...' : opt.text}" ({opt.votes})
                </button>
              ))}
            </div>

            {/* Scrollable Demographics Breakdown Content */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin">
              {/* 1. Geographic / Location Demographics */}
              <div className="bg-[#1F222C] p-3.5 rounded-2xl border border-gray-800 space-y-2">
                <h4 className="text-xs font-black text-white flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span>🌍</span>
                    <span>Geographic Voter Locations</span>
                  </span>
                  <span className="text-[10px] text-yellow-400 font-mono font-bold">Top Countries</span>
                </h4>
                <div className="space-y-2 text-xs">
                  {[
                    { country: '🇳🇬 Nigeria', pct: 44, count: Math.round(showPollAnalyticsModal.poll.totalVotes * 0.44) },
                    { country: '🇬🇧 United Kingdom', pct: 22, count: Math.round(showPollAnalyticsModal.poll.totalVotes * 0.22) },
                    { country: '🇺🇸 United States', pct: 18, count: Math.round(showPollAnalyticsModal.poll.totalVotes * 0.18) },
                    { country: '🇰🇪 Kenya', pct: 10, count: Math.round(showPollAnalyticsModal.poll.totalVotes * 0.10) },
                    { country: '🌐 Other Nations', pct: 6, count: Math.round(showPollAnalyticsModal.poll.totalVotes * 0.06) }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px] text-gray-300 font-medium">
                        <span>{item.country}</span>
                        <span className="font-mono font-bold text-yellow-400">{item.pct}% ({item.count})</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#14161D] rounded-full overflow-hidden border border-gray-800">
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all duration-700"
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Follower Count / Influence Demographics */}
              <div className="bg-[#1F222C] p-3.5 rounded-2xl border border-gray-800 space-y-2">
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>👑</span>
                  <span>Voter Influence & Follower Distribution</span>
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="bg-[#14161D] p-2.5 rounded-xl border border-gray-800 space-y-1">
                    <span className="text-[9px] text-gray-400 font-sans block font-bold">&lt; 1k Followers</span>
                    <span className="text-xs font-black text-white">48%</span>
                    <span className="text-[9px] text-gray-500 block">Community</span>
                  </div>
                  <div className="bg-[#14161D] p-2.5 rounded-xl border border-gray-800 space-y-1">
                    <span className="text-[9px] text-gray-400 font-sans block font-bold">1k - 10k Followers</span>
                    <span className="text-xs font-black text-yellow-400">36%</span>
                    <span className="text-[9px] text-yellow-500/80 block">Creators</span>
                  </div>
                  <div className="bg-[#14161D] p-2.5 rounded-xl border border-gray-800 space-y-1">
                    <span className="text-[9px] text-gray-400 font-sans block font-bold">10k+ Followers</span>
                    <span className="text-xs font-black text-emerald-400">16%</span>
                    <span className="text-[9px] text-emerald-500/80 block">VIP Influencers</span>
                  </div>
                </div>
              </div>

              {/* 3. Device & Platform Breakdown */}
              <div className="bg-[#1F222C] p-3.5 rounded-2xl border border-gray-800 space-y-2">
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>📱</span>
                  <span>Device & Platform Client Breakdown</span>
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-gray-300 text-[11px]">
                    <span>📱 iOS iPhone App</span>
                    <span className="font-mono font-bold text-yellow-400">58%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#14161D] rounded-full overflow-hidden border border-gray-800">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: '58%' }} />
                  </div>

                  <div className="flex items-center justify-between text-gray-300 text-[11px] pt-1">
                    <span>🤖 Android Mobile App</span>
                    <span className="font-mono font-bold text-emerald-400">36%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#14161D] rounded-full overflow-hidden border border-gray-800">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: '36%' }} />
                  </div>

                  <div className="flex items-center justify-between text-gray-300 text-[11px] pt-1">
                    <span>💻 Web Desktop</span>
                    <span className="font-mono font-bold text-sky-400">6%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#14161D] rounded-full overflow-hidden border border-gray-800">
                    <div className="h-full bg-sky-400 rounded-full" style={{ width: '6%' }} />
                  </div>
                </div>
              </div>

              {/* 4. Verified Voters List */}
              <div className="bg-[#1F222C] p-3.5 rounded-2xl border border-gray-800 space-y-2">
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>⭐</span>
                  <span>Recent Influential Voters</span>
                </h4>
                <div className="space-y-2">
                  {[
                    { name: 'Aisha Bello', handle: '@aisha_tech', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', votedOpt: showPollAnalyticsModal.poll.options[0]?.text || 'Option 1' },
                    { name: 'Davido Official', handle: '@davido_official', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', votedOpt: showPollAnalyticsModal.poll.options[1]?.text || 'Option 2' },
                    { name: 'Kemi Adebayo', handle: '@kemi_dev', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80', votedOpt: showPollAnalyticsModal.poll.options[0]?.text || 'Option 1' }
                  ].map((voter, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-[#14161D] p-2 rounded-xl border border-gray-800">
                      <div className="flex items-center gap-2">
                        <img src={voter.avatar} className="w-7 h-7 rounded-full object-cover border border-yellow-500/30" />
                        <div>
                          <h5 className="text-[11px] font-bold text-white leading-none">{voter.name}</h5>
                          <p className="text-[9px] text-gray-400">{voter.handle}</p>
                        </div>
                      </div>
                      <span className="text-[9px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full font-mono font-bold">
                        Voted: "{voter.votedOpt.length > 12 ? voter.votedOpt.slice(0, 12) + '...' : voter.votedOpt}"
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Action Bar */}
            <div className="pt-2 border-t border-[#1F222C] flex items-center justify-between">
              <button
                onClick={() => {
                  triggerHaptic(30);
                  triggerToast('📊 Analytics CSV report generated & downloaded!');
                }}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Export Analytics CSV</span>
              </button>

              <button
                onClick={() => setShowPollAnalyticsModal(null)}
                className="text-xs text-gray-400 hover:text-white font-extrabold px-3 py-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#14161D]/95 backdrop-blur-md border-t border-[#1F222C] px-2 py-2 flex items-center justify-around z-40" style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}>
        <button onClick={() => setActiveTab('feed')} className={`flex flex-col items-center gap-1 p-1 ${activeTab === 'feed' ? 'text-yellow-400' : 'text-gray-500'}`}>
          <Home className="w-5 h-5" />
          <span className="text-[9px] font-bold">Feed</span>
        </button>

        <button onClick={() => setActiveTab('reels')} className={`flex flex-col items-center gap-1 p-1 ${activeTab === 'reels' ? 'text-yellow-400' : 'text-gray-500'}`}>
          <Tv className="w-5 h-5" />
          <span className="text-[9px] font-bold">Reels</span>
        </button>

        <button onClick={() => setActiveTab('live')} className={`flex flex-col items-center gap-1 p-1 ${activeTab === 'live' ? 'text-yellow-400' : 'text-gray-500'}`}>
          <Radio className="w-5 h-5" />
          <span className="text-[9px] font-bold">Live</span>
        </button>

        <button onClick={() => setActiveTab('market')} className={`flex flex-col items-center gap-1 p-1 ${activeTab === 'market' ? 'text-yellow-400' : 'text-gray-500'}`}>
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[9px] font-bold">Market</span>
        </button>

        <button onClick={() => setActiveTab('chat')} className={`flex flex-col items-center gap-1 p-1 ${activeTab === 'chat' ? 'text-yellow-400' : 'text-gray-500'}`}>
          <MessageSquare className="w-5 h-5" />
          <span className="text-[9px] font-bold">Chat</span>
        </button>

        <button onClick={() => setActiveTab('invest')} className={`flex flex-col items-center gap-1 p-1 ${activeTab === 'invest' ? 'text-yellow-400' : 'text-gray-500'}`}>
          <CreditCard className="w-5 h-5" />
          <span className="text-[9px] font-bold">VIP</span>
        </button>

        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 p-1 ${activeTab === 'profile' ? 'text-yellow-400' : 'text-gray-500'}`}>
          <User className="w-5 h-5" />
          <span className="text-[9px] font-bold">Profile</span>
        </button>
      </nav>
    </div>
  );
}
