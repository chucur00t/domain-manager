import React from 'react';

// Mock all lucide-react icons
const createMockIcon = (name: string) => {
  return React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) =>
    React.createElement('svg', {
      ...props,
      ref,
      'data-testid': `${name}-icon`,
      'data-lucide': name,
    })
  );
};

export const Mail = createMockIcon('Mail');
export const Lock = createMockIcon('Lock');
export const Loader2 = createMockIcon('Loader2');
export const LogIn = createMockIcon('LogIn');
export const Shield = createMockIcon('Shield');
export const Building2 = createMockIcon('Building2');
export const ShieldHalf = createMockIcon('ShieldHalf');
export const User = createMockIcon('User');
export const Users = createMockIcon('Users');
export const Globe = createMockIcon('Globe');
export const Server = createMockIcon('Server');
export const FileText = createMockIcon('FileText');
export const BarChart = createMockIcon('BarChart');
export const Settings = createMockIcon('Settings');
export const LogOut = createMockIcon('LogOut');
export const ChevronDown = createMockIcon('ChevronDown');
export const ChevronUp = createMockIcon('ChevronUp');
export const ChevronLeft = createMockIcon('ChevronLeft');
export const ChevronRight = createMockIcon('ChevronRight');
export const Check = createMockIcon('Check');
export const X = createMockIcon('X');
export const AlertCircle = createMockIcon('AlertCircle');
export const Info = createMockIcon('Info');
export const Search = createMockIcon('Search');
export const Plus = createMockIcon('Plus');
export const Edit = createMockIcon('Edit');
export const Trash = createMockIcon('Trash');
export const Eye = createMockIcon('Eye');
export const EyeOff = createMockIcon('EyeOff');
export const Calendar = createMockIcon('Calendar');
export const Clock = createMockIcon('Clock');
export const Download = createMockIcon('Download');
export const Upload = createMockIcon('Upload');
export const Menu = createMockIcon('Menu');
export const MoreVertical = createMockIcon('MoreVertical');
export const MoreHorizontal = createMockIcon('MoreHorizontal');

export default {
  Mail,
  Lock,
  Loader2,
  Shield,
  Building2,
  ShieldHalf,
  User,
  Users,
  Globe,
  Server,
  FileText,
  BarChart,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  AlertCircle,
  Info,
  Search,
  Plus,
  Edit,
  Trash,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  Download,
  Upload,
  Menu,
  MoreVertical,
  MoreHorizontal,
};
