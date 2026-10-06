import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  Calendar,
  Camera,
  Check,
  ChevronRight,
  CircleHelp,
  Cloud,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Heart,
  Home,
  Image,
  Info,
  Link,
  Lock,
  LogIn,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Play,
  Podcast,
  Radio,
  Rss,
  Search,
  Send,
  Settings,
  Share2,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  User,
  Users,
  Zap,
} from 'lucide-react'
import {
  FaApple,
  FaBluesky,
  FaDiscord,
  FaFacebookF,
  FaGithub,
  FaGooglePlay,
  FaInstagram,
  FaLinkedinIn,
  FaMastodon,
  FaMedium,
  FaPinterestP,
  FaRedditAlien,
  FaSlack,
  FaSpotify,
  FaTelegram,
  FaThreads,
  FaTiktok,
  FaTwitch,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6'
import type { IconType } from 'react-icons'

type LinkIconCategory = 'Brands' | 'General'

type LinkIconDefinition = {
  category: LinkIconCategory
  Icon: IconType
  label: string
  value: string
}

export const linkIconDefinitions: LinkIconDefinition[] = [
  { category: 'Brands', Icon: FaApple, label: 'Apple', value: 'apple' },
  { category: 'Brands', Icon: FaBluesky, label: 'Bluesky', value: 'bluesky' },
  { category: 'Brands', Icon: FaDiscord, label: 'Discord', value: 'discord' },
  {
    category: 'Brands',
    Icon: FaFacebookF,
    label: 'Facebook',
    value: 'facebook',
  },
  { category: 'Brands', Icon: FaGithub, label: 'GitHub', value: 'github' },
  {
    category: 'Brands',
    Icon: FaGooglePlay,
    label: 'Google Play',
    value: 'google-play',
  },
  {
    category: 'Brands',
    Icon: FaInstagram,
    label: 'Instagram',
    value: 'instagram',
  },
  {
    category: 'Brands',
    Icon: FaLinkedinIn,
    label: 'LinkedIn',
    value: 'linkedin',
  },
  {
    category: 'Brands',
    Icon: FaMastodon,
    label: 'Mastodon',
    value: 'mastodon',
  },
  { category: 'Brands', Icon: FaMedium, label: 'Medium', value: 'medium' },
  {
    category: 'Brands',
    Icon: FaPinterestP,
    label: 'Pinterest',
    value: 'pinterest',
  },
  { category: 'Brands', Icon: FaRedditAlien, label: 'Reddit', value: 'reddit' },
  { category: 'Brands', Icon: FaSlack, label: 'Slack', value: 'slack' },
  { category: 'Brands', Icon: FaSpotify, label: 'Spotify', value: 'spotify' },
  {
    category: 'Brands',
    Icon: FaTelegram,
    label: 'Telegram',
    value: 'telegram',
  },
  { category: 'Brands', Icon: FaThreads, label: 'Threads', value: 'threads' },
  { category: 'Brands', Icon: FaTiktok, label: 'TikTok', value: 'tiktok' },
  { category: 'Brands', Icon: FaTwitch, label: 'Twitch', value: 'twitch' },
  {
    category: 'Brands',
    Icon: FaWhatsapp,
    label: 'WhatsApp',
    value: 'whatsapp',
  },
  {
    category: 'Brands',
    Icon: FaXTwitter,
    label: 'X / Twitter',
    value: 'twitter',
  },
  { category: 'Brands', Icon: FaYoutube, label: 'YouTube', value: 'youtube' },
  {
    category: 'General',
    Icon: ArrowRight,
    label: 'Arrow right',
    value: 'arrow-right',
  },
  {
    category: 'General',
    Icon: ArrowUpRight,
    label: 'Arrow up right',
    value: 'arrow-up-right',
  },
  { category: 'General', Icon: Bell, label: 'Bell', value: 'bell' },
  { category: 'General', Icon: BookOpen, label: 'Book', value: 'book-open' },
  { category: 'General', Icon: Calendar, label: 'Calendar', value: 'calendar' },
  { category: 'General', Icon: Camera, label: 'Camera', value: 'camera' },
  { category: 'General', Icon: Check, label: 'Check', value: 'check' },
  {
    category: 'General',
    Icon: ChevronRight,
    label: 'Chevron right',
    value: 'chevron-right',
  },
  { category: 'General', Icon: CircleHelp, label: 'Help', value: 'help' },
  { category: 'General', Icon: Cloud, label: 'Cloud', value: 'cloud' },
  { category: 'General', Icon: Download, label: 'Download', value: 'download' },
  {
    category: 'General',
    Icon: ExternalLink,
    label: 'External link',
    value: 'external-link',
  },
  { category: 'General', Icon: FileText, label: 'File', value: 'file-text' },
  { category: 'General', Icon: Globe, label: 'Globe', value: 'globe' },
  { category: 'General', Icon: Heart, label: 'Heart', value: 'heart' },
  { category: 'General', Icon: Home, label: 'Home', value: 'home' },
  { category: 'General', Icon: Image, label: 'Image', value: 'image' },
  { category: 'General', Icon: Info, label: 'Info', value: 'info' },
  { category: 'General', Icon: Link, label: 'Link', value: 'link' },
  { category: 'General', Icon: Lock, label: 'Lock', value: 'lock' },
  { category: 'General', Icon: LogIn, label: 'Log in', value: 'log-in' },
  { category: 'General', Icon: Mail, label: 'Email', value: 'mail' },
  { category: 'General', Icon: MapPin, label: 'Map pin', value: 'map-pin' },
  { category: 'General', Icon: Menu, label: 'Menu', value: 'menu' },
  {
    category: 'General',
    Icon: MessageCircle,
    label: 'Message',
    value: 'message',
  },
  { category: 'General', Icon: Phone, label: 'Phone', value: 'phone' },
  { category: 'General', Icon: Play, label: 'Play', value: 'play' },
  { category: 'General', Icon: Podcast, label: 'Podcast', value: 'podcast' },
  { category: 'General', Icon: Radio, label: 'Radio', value: 'radio' },
  { category: 'General', Icon: Rss, label: 'RSS', value: 'rss' },
  { category: 'General', Icon: Search, label: 'Search', value: 'search' },
  { category: 'General', Icon: Send, label: 'Send', value: 'send' },
  { category: 'General', Icon: Settings, label: 'Settings', value: 'settings' },
  { category: 'General', Icon: Share2, label: 'Share', value: 'share' },
  {
    category: 'General',
    Icon: ShoppingBag,
    label: 'Shopping bag',
    value: 'shopping-bag',
  },
  {
    category: 'General',
    Icon: ShoppingCart,
    label: 'Shopping cart',
    value: 'shopping-cart',
  },
  { category: 'General', Icon: Sparkles, label: 'Sparkles', value: 'sparkles' },
  { category: 'General', Icon: Star, label: 'Star', value: 'star' },
  { category: 'General', Icon: User, label: 'Account', value: 'user' },
  { category: 'General', Icon: Users, label: 'Users', value: 'users' },
  { category: 'General', Icon: Zap, label: 'Zap', value: 'zap' },
]

const icons = new Map(
  linkIconDefinitions.map(({ Icon, value }) => [value, Icon]),
)

export const linkIconOptions = linkIconDefinitions.map(({ label, value }) => ({
  label,
  value,
}))

export const socialIconOptions = linkIconDefinitions
  .filter(
    ({ category, value }) =>
      category === 'Brands' ||
      ['globe', 'mail', 'phone', 'podcast', 'rss'].includes(value),
  )
  .map(({ label, value }) => ({ label, value }))

export function getLinkIcon(icon?: null | string) {
  return icon ? icons.get(icon) : undefined
}
