// ═══════════════════════════════════════════════════════════════════
// Íconos — Re-export centralizado de lucide-react
// ═══════════════════════════════════════════════════════════════════
// Regla 4 del CLAUDE.md: lucide-react SOLO en packages/ui.
// apps/web lo consume re-exportado desde @enbandeja/ui/icons.
//
// Stroke: 1.5px | Tamaño base: 20px
// ═══════════════════════════════════════════════════════════════════

export {
  // Navegación
  Home,
  CalendarDays,
  ClipboardList,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Search,

  // Acciones
  Plus,
  Minus,
  Check,
  ShoppingCart, ShoppingBag,
  CreditCard,
  Download,
  Upload,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Copy,
  Share2,
  Filter,
  SlidersHorizontal,

  // Estados
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Clock,
  CalendarX,
  Loader2,

  // Dominio
  UtensilsCrossed,
  ChefHat,
  Store,
  Building2,
  Users,
  Bell,
  BellRing,
  Mail,
  QrCode,
  Star,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  FileText,
  FileSpreadsheet,
  Settings,
  LogOut,
  Shield,
  Lock,
  Smartphone,
  Wallet,
  RotateCcw,
  ArrowDownLeft,
  ArrowUpRight,
  Save,
  Send,
  Package,
  DollarSign,
  ArrowLeft,
  RefreshCw,
  Ban,
  ArrowUpCircle,
  ArrowDownCircle,
  ShieldCheck,

  // Tipo genérico
  type LucideIcon,
} from 'lucide-react'

// Tamaño y stroke por defecto del design system
export const ICON_DEFAULTS = {
  size: 20,
  strokeWidth: 1.5,
} as const
