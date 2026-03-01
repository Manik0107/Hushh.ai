function Icon({ size = 20, strokeWidth = 1.8, className = '', viewBox = '0 0 24 24', children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      {children}
    </svg>
  );
}

export const BookOpen = (props) => (
  <Icon {...props}>
    <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
    <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
  </Icon>
);

export const FileText = (props) => (
  <Icon {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="16" y2="17" />
    <line x1="8" y1="9" x2="10" y2="9" />
  </Icon>
);

export const LinkIcon = (props) => (
  <Icon {...props}>
    <path d="M10 13a5 5 0 0 0 7.54.54l2.92-2.92a5 5 0 0 0-7.07-7.07l-1.7 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54L3.54 13.4a5 5 0 0 0 7.07 7.07l1.7-1.71" />
  </Icon>
);

export const ImageIcon = (props) => (
  <Icon {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </Icon>
);

export const Upload = (props) => (
  <Icon {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </Icon>
);

export const Download = (props) => (
  <Icon {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </Icon>
);

export const MessageSquare = (props) => (
  <Icon {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </Icon>
);

export const ThumbsUp = (props) => (
  <Icon {...props}>
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.4a2 2 0 0 0 2-1.7l1.2-8.2A2 2 0 0 0 19.6 9z" />
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </Icon>
);

export const ThumbsDown = (props) => (
  <Icon {...props}>
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.6a2 2 0 0 0-2 1.7l-1.2 8.2A2 2 0 0 0 4.4 15z" />
    <path d="M17 2h2.6A2.4 2.4 0 0 1 22 4.4v6.2A2.4 2.4 0 0 1 19.6 13H17" />
  </Icon>
);

export const Clock = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </Icon>
);

export const Trophy = (props) => (
  <Icon {...props}>
    <path d="M8 4V2h8v2" />
    <path d="M7 4h10v3a5 5 0 0 1-10 0z" />
    <path d="M4 7h3a4 4 0 0 1-3 4" />
    <path d="M20 7h-3a4 4 0 0 0 3 4" />
    <path d="M12 12v4" />
    <path d="M9 22h6" />
    <path d="M10 16h4" />
  </Icon>
);

export const ChevronDown = (props) => (
  <Icon {...props}>
    <polyline points="6 9 12 15 18 9" />
  </Icon>
);

export const ChevronRight = (props) => (
  <Icon {...props}>
    <polyline points="9 18 15 12 9 6" />
  </Icon>
);

export const ChevronLeft = (props) => (
  <Icon {...props}>
    <polyline points="15 18 9 12 15 6" />
  </Icon>
);

export const X = (props) => (
  <Icon {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Icon>
);

export const Send = (props) => (
  <Icon {...props}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </Icon>
);

export const Bot = (props) => (
  <Icon {...props}>
    <rect x="3" y="10" width="18" height="11" rx="2" />
    <circle cx="9" cy="15.5" r="1" />
    <circle cx="15" cy="15.5" r="1" />
    <path d="M12 10V6" />
    <circle cx="12" cy="4" r="1.6" />
  </Icon>
);

export const User = (props) => (
  <Icon {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
);

export const Plus = (props) => (
  <Icon {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </Icon>
);

export const Medal = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="8" r="5" />
    <path d="M8.5 12.5L7 22l5-2.8 5 2.8-1.5-9.5" />
  </Icon>
);

export const Home = (props) => (
  <Icon {...props}>
    <path d="M3 10l9-7 9 7" />
    <path d="M5 9v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9" />
    <path d="M9 22v-8h6v8" />
  </Icon>
);

export const Layers = (props) => (
  <Icon {...props}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 12 12 17 22 12" />
    <polyline points="2 17 12 22 22 17" />
  </Icon>
);

export const Zap = (props) => (
  <Icon {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </Icon>
);

export const Search = (props) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.6" y2="16.6" />
  </Icon>
);

export const BarChart2 = (props) => (
  <Icon {...props}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </Icon>
);

export const Star = (props) => (
  <Icon {...props}>
    <polygon points="12 2 15 8.2 22 9.3 17 14.2 18.2 21.2 12 17.8 5.8 21.2 7 14.2 2 9.3 9 8.2 12 2" />
  </Icon>
);

export const ArrowUp = (props) => (
  <Icon {...props}>
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </Icon>
);

export const ArrowDown = (props) => (
  <Icon {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </Icon>
);

export const CheckCircle = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="8 12 11 15 16 9" />
  </Icon>
);

export const XCircle = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </Icon>
);

export const Paperclip = (props) => (
  <Icon {...props}>
    <path d="M21.4 11.1l-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 1 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5" />
  </Icon>
);

export const Tag = (props) => (
  <Icon {...props}>
    <path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z" />
    <circle cx="7" cy="7" r="1" />
  </Icon>
);

export const AlertCircle = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12" y2="16" />
  </Icon>
);

export const Sparkles = (props) => (
  <Icon {...props}>
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
    <path d="M19 13l.8 2.2L22 16l-2.2.8L19 19l-.8-2.2L16 16l2.2-.8L19 13z" />
    <path d="M5 17l.5 1.5L7 19l-1.5.5L5 21l-.5-1.5L3 19l1.5-.5L5 17z" />
  </Icon>
);

export const Brain = (props) => (
  <Icon {...props}>
    <path d="M8.5 4a3 3 0 0 0-3 3v.5A3.5 3.5 0 0 0 3 11a3.5 3.5 0 0 0 2.5 3.4V15a3 3 0 0 0 3 3" />
    <path d="M15.5 4a3 3 0 0 1 3 3v.5A3.5 3.5 0 0 1 21 11a3.5 3.5 0 0 1-2.5 3.4V15a3 3 0 0 1-3 3" />
    <path d="M9 7.5c0-1.2 1-2.2 2.2-2.2h1.6A2.2 2.2 0 0 1 15 7.5" />
    <path d="M9 12.5c0 1.2 1 2.2 2.2 2.2h1.6a2.2 2.2 0 0 0 2.2-2.2" />
    <path d="M9.3 10h5.4" />
  </Icon>
);

export const Menu = (props) => (
  <Icon {...props}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </Icon>
);

export const Filter = (props) => (
  <Icon {...props}>
    <polygon points="3 4 21 4 14 12 14 19 10 21 10 12 3 4" />
  </Icon>
);

export const Timer = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 13l3-2" />
    <path d="M9 2h6" />
  </Icon>
);
