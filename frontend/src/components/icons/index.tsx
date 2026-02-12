// Baby Products SVG Icons Collection
// All icons are custom designed for the baby e-commerce theme

interface IconProps {
  className?: string;
  size?: number;
}

// Logo Icon - Cute Baby Face
export const LogoIcon = ({ className = "", size = 40 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="24" cy="24" r="20" fill="#fce7f3" />
    <circle cx="24" cy="24" r="16" fill="#fbcfe8" />
    <circle cx="18" cy="22" r="3" fill="#4a3642" />
    <circle cx="30" cy="22" r="3" fill="#4a3642" />
    <circle cx="19" cy="21" r="1" fill="white" />
    <circle cx="31" cy="21" r="1" fill="white" />
    <ellipse cx="14" cy="26" rx="3" ry="2" fill="#f9a8d4" opacity="0.6" />
    <ellipse cx="34" cy="26" rx="3" ry="2" fill="#f9a8d4" opacity="0.6" />
    <path
      d="M20 30 Q24 34 28 30"
      stroke="#4a3642"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="10" cy="12" r="4" fill="#f472b6" />
    <circle cx="38" cy="12" r="4" fill="#f472b6" />
  </svg>
);

// Heart Icon
export const HeartIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill="currentColor"
    />
  </svg>
);

// Heart Outline Icon
export const HeartOutlineIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

// Shopping Cart Icon
export const CartIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"
      fill="currentColor"
    />
    <path
      d="M1 2h3.27l.94 2H20c.55 0 1 .45 1 1 0 .17-.04.34-.12.5l-3.58 6.47c-.34.61-1 1.03-1.75 1.03H8.1l-.9 1.63-.03.12c0 .27.22.5.5.5h11.18v2H7c-1.1 0-2-.9-2-2 0-.35.09-.68.24-.96l1.35-2.45L3.25 4H1V2z"
      fill="currentColor"
    />
  </svg>
);

// Search Icon
export const SearchIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// User Icon
export const UserIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="8" r="4" fill="currentColor" />
    <path
      d="M4 20c0-4 4-6 8-6s8 2 8 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// Menu Icon
export const MenuIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Close Icon
export const CloseIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Baby Bottle Icon
export const BabyBottleIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20 6h8v4h-8z" fill="#f9a8d4" />
    <path
      d="M18 10h12c2 0 4 2 4 4v24c0 4-3 6-6 6h-8c-3 0-6-2-6-6V14c0-2 2-4 4-4z"
      fill="#fce7f3"
      stroke="#f472b6"
      strokeWidth="2"
    />
    <path d="M18 18h12M18 24h12M18 30h12" stroke="#f9a8d4" strokeWidth="2" strokeLinecap="round" />
    <ellipse cx="24" cy="4" rx="4" ry="2" fill="#f472b6" />
  </svg>
);

// Baby Clothes Icon
export const BabyClothesIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16 8L8 16v8l4-2v18h24V22l4 2v-8l-8-8h-4c0 2-2 4-4 4s-4-2-4-4h-4z"
      fill="#fce7f3"
      stroke="#f472b6"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <circle cx="24" cy="24" r="4" fill="#f9a8d4" />
  </svg>
);

// Baby Stroller Icon
export const StrollerIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="14" cy="40" r="4" fill="#f472b6" />
    <circle cx="34" cy="40" r="4" fill="#f472b6" />
    <path
      d="M10 36h28l4-16H14l-4-12H4"
      stroke="#f472b6"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M14 20h24c2 0 4 2 4 4v8c0 2-2 4-4 4H14"
      fill="#fce7f3"
      stroke="#f472b6"
      strokeWidth="2"
    />
    <circle cx="24" cy="12" r="6" fill="#f9a8d4" />
    <path d="M24 6v12" stroke="#f472b6" strokeWidth="2" />
  </svg>
);

// Baby Toy Icon (Teddy Bear)
export const ToyIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="6" fill="#f9a8d4" />
    <circle cx="36" cy="12" r="6" fill="#f9a8d4" />
    <ellipse cx="24" cy="28" rx="14" ry="16" fill="#fce7f3" stroke="#f472b6" strokeWidth="2" />
    <circle cx="18" cy="24" r="2" fill="#4a3642" />
    <circle cx="30" cy="24" r="2" fill="#4a3642" />
    <ellipse cx="24" cy="30" rx="3" ry="2" fill="#f472b6" />
    <path
      d="M20 34 Q24 38 28 34"
      stroke="#4a3642"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

// Diaper Icon
export const DiaperIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 12h32c2 0 4 2 4 4v16c0 4-4 8-8 8H12c-4 0-8-4-8-8V16c0-2 2-4 4-4z"
      fill="#fce7f3"
      stroke="#f472b6"
      strokeWidth="2"
    />
    <path d="M16 12v6c0 4 4 6 8 6s8-2 8-6v-6" fill="white" stroke="#f472b6" strokeWidth="2" />
    <path d="M12 28h4M32 28h4" stroke="#f9a8d4" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Star Icon
export const StarIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill="currentColor"
    />
  </svg>
);

// Arrow Right Icon
export const ArrowRightIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 12h14M12 5l7 7-7 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Truck/Delivery Icon
export const TruckIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M1 3h15v13H1z" fill="currentColor" opacity="0.2" />
    <path
      d="M16 8h4l3 4v5h-7V8z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      fill="none"
    />
    <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2" />
    <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2" />
    <path d="M1 3h15v13H1z" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

// Shield/Safe Icon
export const ShieldIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
      fill="currentColor"
      opacity="0.2"
    />
    <path
      d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M9 12l2 2 4-4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Gift Icon
export const GiftIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="8" width="18" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
    <rect x="5" y="12" width="14" height="9" rx="1" stroke="currentColor" strokeWidth="2" />
    <path d="M12 8v13" stroke="currentColor" strokeWidth="2" />
    <path
      d="M12 8c-1.5 0-4-2-4-4 0-1.5 1-2 2-2s2 1.5 2 2M12 8c1.5 0 4-2 4-4 0-1.5-1-2-2-2s-2 1.5-2 2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// Phone Icon
export const PhoneIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Email Icon
export const EmailIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
    <path
      d="M22 6l-10 7L2 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Location Icon
export const LocationIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
  </svg>
);

// Facebook Icon
export const FacebookIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z"
      fill="currentColor"
    />
  </svg>
);

// Instagram Icon
export const InstagramIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
    <circle cx="18" cy="6" r="1" fill="currentColor" />
  </svg>
);

// Play Icon (for video)
export const PlayIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path d="M10 8l6 4-6 4V8z" fill="currentColor" />
  </svg>
);

// Sparkle Icon
export const SparkleIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
      fill="currentColor"
    />
    <path
      d="M19 14L19.75 16.25L22 17L19.75 17.75L19 20L18.25 17.75L16 17L18.25 16.25L19 14Z"
      fill="currentColor"
    />
  </svg>
);

// Cloud Icon (decorative)
export const CloudIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 36c-4.42 0-8-3.58-8-8 0-3.7 2.5-6.8 5.9-7.7C10.36 14.68 15.6 10 22 10c5.5 0 10.2 3.4 12.1 8.2.6-.1 1.3-.2 1.9-.2 5.5 0 10 4.5 10 10s-4.5 10-10 10H12z"
      fill="currentColor"
    />
  </svg>
);

// Pacifier Icon
export const PacifierIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="24" cy="28" r="14" fill="#fce7f3" stroke="#f472b6" strokeWidth="2" />
    <circle cx="24" cy="28" r="8" fill="#f9a8d4" />
    <ellipse cx="24" cy="10" rx="6" ry="4" fill="#f472b6" />
    <path d="M24 14v6" stroke="#f472b6" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// Moon Icon (for sleep products)
export const MoonIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor" />
  </svg>
);

// Crown Icon (for premium products)
export const CrownIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M2 17h20l-3-10-5 4-2-6-2 6-5-4-3 10z" fill="currentColor" />
    <rect x="2" y="17" width="20" height="3" rx="1" fill="currentColor" />
  </svg>
);

// Filter Icon
export const FilterIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 4h18v2.5l-7 7v7.5l-4 2V13.5l-7-7V4z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Grid Icon
export const GridIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" />
  </svg>
);

// List Icon
export const ListIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="4" width="18" height="4" rx="1" fill="currentColor" />
    <rect x="3" y="10" width="18" height="4" rx="1" fill="currentColor" />
    <rect x="3" y="16" width="18" height="4" rx="1" fill="currentColor" />
  </svg>
);

// Chevron Down Icon
export const ChevronDownIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 9l6 6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Trash Icon
export const TrashIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Minus Icon
export const MinusIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 12h14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Plus Icon
export const PlusIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 5v14M5 12h14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Check Circle Icon
export const CheckCircleIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path
      d="M8 12l3 3 5-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Map Pin Icon
export const MapPinIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
      fill="currentColor"
    />
    <circle cx="12" cy="9" r="2.5" fill="white" />
  </svg>
);

// COD Icon (Cash/Wallet)
export const CodIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
    <path d="M2 10h20" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="15" r="2" fill="currentColor" />
  </svg>
);

// MoMo Icon (stylized M in circle)
export const MomoIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" fill="#d63384" />
    <path
      d="M7 16V8l2.5 5L12 8l2.5 5L17 8v8"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Chevron Up Icon
export const ChevronUpIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 15l-6-6-6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Camera Icon
export const CameraIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" />
  </svg>
);

// Lock Icon
export const LockIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Package Icon
export const PackageIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Edit/Pencil Icon
export const EditIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Check Icon
export const CheckIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 6L9 17l-5-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Login Icon
export const LoginIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Logout Icon
export const LogoutIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Register/User Plus Icon
export const UserPlusIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
    <path
      d="M20 8v6M23 11h-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Eye Icon (for password visibility toggle)
export const EyeIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
  </svg>
);

// Eye Off Icon
export const EyeOffIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M1 1l22 22"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
