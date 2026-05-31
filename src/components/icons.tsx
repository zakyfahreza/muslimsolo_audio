import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...props,
});

export const PlayIcon = (props: IconProps) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <path d="M6 4.5v15a1 1 0 0 0 1.5.87l13-7.5a1 1 0 0 0 0-1.74l-13-7.5A1 1 0 0 0 6 4.5Z" />
  </svg>
);

export const PauseIcon = (props: IconProps) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
);

export const NextIcon = (props: IconProps) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <path d="M5 4.5v15a1 1 0 0 0 1.5.87L16 14.7V19a1 1 0 0 0 2 0V5a1 1 0 0 0-2 0v4.3L6.5 3.63A1 1 0 0 0 5 4.5Z" />
  </svg>
);

export const PrevIcon = (props: IconProps) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <path d="M19 4.5v15a1 1 0 0 1-1.5.87L8 14.7V19a1 1 0 0 1-2 0V5a1 1 0 0 1 2 0v4.3l9.5-5.67A1 1 0 0 1 19 4.5Z" />
  </svg>
);

export const SearchIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const SunIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

export const MoonIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
  </svg>
);

export const HeartIcon = ({ filled, ...props }: IconProps & { filled?: boolean }) => (
  <svg {...base(props)} fill={filled ? 'currentColor' : 'none'}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
  </svg>
);

export const BookmarkIcon = ({ filled, ...props }: IconProps & { filled?: boolean }) => (
  <svg {...base(props)} fill={filled ? 'currentColor' : 'none'}>
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

export const BookIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
  </svg>
);

export const UserIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

export const ClockIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const HomeIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </svg>
);

export const MenuIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const CloseIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const ShareIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
  </svg>
);

export const LinkIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5" />
    <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5" />
  </svg>
);

export const DownloadIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 3v12" />
    <path d="m7 10 5 5 5-5" />
    <path d="M5 21h14" />
  </svg>
);

export const FilterIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 5h18M6 12h12M10 19h4" />
  </svg>
);

export const SpeakerIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M11 5 6 9H3v6h3l5 4z" />
    <path d="M16 9a3 3 0 0 1 0 6M19 6a7 7 0 0 1 0 12" />
  </svg>
);

export const ChartIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 3v18h18" />
    <rect x="7" y="11" width="3" height="6" rx="1" />
    <rect x="12" y="7" width="3" height="10" rx="1" />
    <rect x="17" y="13" width="3" height="4" rx="1" />
  </svg>
);

export const ChevronDownIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const WhatsAppIcon = (props: IconProps) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.16c-.24.68-1.42 1.31-1.95 1.36-.5.05-1.13.21-3.66-.77-3.07-1.21-5.04-4.3-5.19-4.5-.15-.2-1.25-1.66-1.25-3.17 0-1.5.79-2.24 1.07-2.55.28-.31.61-.38.81-.38.2 0 .41 0 .59.01.19.01.44-.07.69.53.24.6.83 2.07.9 2.22.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.39-.45.52-.15.15-.3.31-.13.6.17.3.76 1.25 1.63 2.02 1.12.99 2.07 1.3 2.36 1.45.3.15.47.13.64-.08.17-.2.74-.86.94-1.16.2-.3.4-.25.67-.15.27.1 1.72.81 2.01.96.3.15.5.22.57.34.07.12.07.7-.17 1.38Z" />
  </svg>
);

export const TelegramIcon = (props: IconProps) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <path d="M21.94 4.3 18.6 19.1c-.25 1.1-.91 1.37-1.84.85l-5.1-3.76-2.46 2.37c-.27.27-.5.5-1.02.5l.36-5.18 9.43-8.52c.41-.36-.09-.57-.64-.2L5.06 13.1l-5.02-1.57c-1.09-.34-1.11-1.09.23-1.61L20.53 2.7c.91-.34 1.7.2 1.41 1.6Z" transform="translate(1 0)" />
  </svg>
);

export const FacebookIcon = (props: IconProps) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.9h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
  </svg>
);

export const GridIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export const UploadIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 16V4" />
    <path d="m7 9 5-5 5 5" />
    <path d="M5 20h14" />
  </svg>
);

export const SettingsIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  </svg>
);

export const LogoutIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

export const PlusIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const TrashIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 6h18" />
    <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

export const EditIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

export const CheckIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const ChevronRightIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export const ChevronLeftIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

export const FileAudioIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
    <path d="M14 2v6h6" />
    <path d="M9 17a2 2 0 1 1-2-2V11l5-1v5" />
  </svg>
);

export const ExternalIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
);
