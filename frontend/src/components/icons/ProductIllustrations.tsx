// Beautiful SVG Product Illustrations for Baby E-commerce
// Soft pastel colors with detailed designs

interface IllustrationProps {
  className?: string;
  size?: number;
}

// Baby Onesie / Clothes Illustration
export const ClothesIllustration = ({ className = '', size = 120 }: IllustrationProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Shadow */}
    <ellipse cx="60" cy="108" rx="35" ry="6" fill="#f9a8d4" opacity="0.3" />

    {/* Main Body */}
    <path
      d="M35 35 L25 50 L32 52 L32 95 C32 98 35 100 40 100 L80 100 C85 100 88 98 88 95 L88 52 L95 50 L85 35"
      fill="#fce7f3"
      stroke="#f9a8d4"
      strokeWidth="2"
    />

    {/* Collar/Neck area */}
    <path
      d="M35 35 C35 35 45 25 60 25 C75 25 85 35 85 35"
      fill="#fbcfe8"
      stroke="#f9a8d4"
      strokeWidth="2"
    />

    {/* Left Sleeve */}
    <path
      d="M25 50 L15 65 C14 67 15 70 18 70 L28 68 L32 52"
      fill="#fce7f3"
      stroke="#f9a8d4"
      strokeWidth="2"
    />

    {/* Right Sleeve */}
    <path
      d="M95 50 L105 65 C106 67 105 70 102 70 L92 68 L88 52"
      fill="#fce7f3"
      stroke="#f9a8d4"
      strokeWidth="2"
    />

    {/* Heart decoration */}
    <path
      d="M60 55 L56 51 C53 48 53 44 56 42 C59 40 62 42 60 46 C58 42 61 40 64 42 C67 44 67 48 64 51 Z"
      fill="#f472b6"
    />

    {/* Snap buttons */}
    <circle cx="60" cy="70" r="3" fill="#f9a8d4" />
    <circle cx="60" cy="82" r="3" fill="#f9a8d4" />
    <circle cx="60" cy="94" r="3" fill="#f9a8d4" />

    {/* Decorative dots */}
    <circle cx="45" cy="65" r="2" fill="#fbcfe8" />
    <circle cx="75" cy="65" r="2" fill="#fbcfe8" />
    <circle cx="45" cy="80" r="2" fill="#fbcfe8" />
    <circle cx="75" cy="80" r="2" fill="#fbcfe8" />
  </svg>
);

// Baby Bottle Illustration
export const BottleIllustration = ({ className = '', size = 120 }: IllustrationProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Shadow */}
    <ellipse cx="60" cy="110" rx="25" ry="5" fill="#a5b4fc" opacity="0.3" />

    {/* Nipple */}
    <ellipse cx="60" cy="18" rx="12" ry="8" fill="#fcd34d" />
    <path d="M52 20 Q60 30 68 20" fill="#fbbf24" />

    {/* Cap/Ring */}
    <rect x="45" y="24" width="30" height="10" rx="2" fill="#93c5fd" />
    <rect x="45" y="24" width="30" height="4" rx="1" fill="#60a5fa" />

    {/* Bottle Body */}
    <path
      d="M45 34 L42 45 L42 100 C42 105 48 108 60 108 C72 108 78 105 78 100 L78 45 L75 34"
      fill="white"
      stroke="#93c5fd"
      strokeWidth="2"
    />

    {/* Milk Level */}
    <path
      d="M43 55 L43 100 C43 104 49 107 60 107 C71 107 77 104 77 100 L77 55 C77 55 70 58 60 58 C50 58 43 55 43 55"
      fill="#fef3c7"
      opacity="0.8"
    />

    {/* Measurement Lines */}
    <line x1="44" y1="50" x2="52" y2="50" stroke="#93c5fd" strokeWidth="1.5" />
    <line x1="44" y1="62" x2="50" y2="62" stroke="#93c5fd" strokeWidth="1.5" />
    <line x1="44" y1="74" x2="52" y2="74" stroke="#93c5fd" strokeWidth="1.5" />
    <line x1="44" y1="86" x2="50" y2="86" stroke="#93c5fd" strokeWidth="1.5" />

    {/* ml labels */}
    <text x="54" y="52" fontSize="6" fill="#60a5fa">
      240
    </text>
    <text x="52" y="76" fontSize="6" fill="#60a5fa">
      120
    </text>

    {/* Shine effect */}
    <path
      d="M72 45 L72 95 C72 95 74 92 74 80 L74 50 C74 48 73 46 72 45"
      fill="white"
      opacity="0.5"
    />
  </svg>
);

// Teddy Bear Illustration
export const TeddyIllustration = ({ className = '', size = 120 }: IllustrationProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Shadow */}
    <ellipse cx="60" cy="112" rx="30" ry="5" fill="#d4a574" opacity="0.3" />

    {/* Ears */}
    <circle cx="30" cy="28" r="15" fill="#e4c9a8" />
    <circle cx="30" cy="28" r="9" fill="#d4a574" />
    <circle cx="90" cy="28" r="15" fill="#e4c9a8" />
    <circle cx="90" cy="28" r="9" fill="#d4a574" />

    {/* Head */}
    <ellipse cx="60" cy="42" rx="32" ry="28" fill="#e4c9a8" />

    {/* Body */}
    <ellipse cx="60" cy="85" rx="28" ry="25" fill="#e4c9a8" />

    {/* Belly */}
    <ellipse cx="60" cy="88" rx="18" ry="16" fill="#f5e6d3" />

    {/* Muzzle */}
    <ellipse cx="60" cy="50" rx="14" ry="10" fill="#f5e6d3" />

    {/* Eyes */}
    <ellipse cx="48" cy="38" rx="5" ry="6" fill="#4a3728" />
    <ellipse cx="72" cy="38" rx="5" ry="6" fill="#4a3728" />
    <circle cx="50" cy="36" r="2" fill="white" />
    <circle cx="74" cy="36" r="2" fill="white" />

    {/* Nose */}
    <ellipse cx="60" cy="48" rx="5" ry="4" fill="#4a3728" />
    <ellipse cx="59" cy="47" rx="2" ry="1" fill="#6b5344" />

    {/* Mouth */}
    <path
      d="M54 54 Q60 60 66 54"
      stroke="#4a3728"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />

    {/* Arms */}
    <ellipse cx="30" cy="78" rx="10" ry="16" fill="#e4c9a8" transform="rotate(-20 30 78)" />
    <ellipse cx="90" cy="78" rx="10" ry="16" fill="#e4c9a8" transform="rotate(20 90 78)" />

    {/* Legs */}
    <ellipse cx="45" cy="105" rx="12" ry="8" fill="#e4c9a8" />
    <ellipse cx="75" cy="105" rx="12" ry="8" fill="#e4c9a8" />
    <ellipse cx="45" cy="105" rx="8" ry="5" fill="#d4a574" />
    <ellipse cx="75" cy="105" rx="8" ry="5" fill="#d4a574" />

    {/* Bow */}
    <circle cx="60" cy="68" r="4" fill="#f472b6" />
    <ellipse cx="50" cy="68" rx="8" ry="5" fill="#f472b6" />
    <ellipse cx="70" cy="68" rx="8" ry="5" fill="#f472b6" />
  </svg>
);

// Diaper Illustration
export const DiaperIllustration = ({ className = '', size = 120 }: IllustrationProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Shadow */}
    <ellipse cx="60" cy="105" rx="40" ry="6" fill="#a5f3fc" opacity="0.3" />

    {/* Main diaper body */}
    <path
      d="M20 35 C20 35 25 30 60 30 C95 30 100 35 100 35 L100 70 C100 90 85 100 60 100 C35 100 20 90 20 70 Z"
      fill="white"
      stroke="#67e8f9"
      strokeWidth="2"
    />

    {/* Elastic band top */}
    <path
      d="M20 35 C20 35 25 30 60 30 C95 30 100 35 100 35"
      stroke="#22d3ee"
      strokeWidth="4"
      strokeLinecap="round"
    />

    {/* Absorption area */}
    <path
      d="M35 45 L35 75 C35 85 45 92 60 92 C75 92 85 85 85 75 L85 45 C85 45 75 48 60 48 C45 48 35 45 35 45"
      fill="#ecfeff"
    />

    {/* Cute pattern - stars */}
    <path
      d="M45 55 L46 58 L49 58 L47 60 L48 63 L45 61 L42 63 L43 60 L41 58 L44 58 Z"
      fill="#67e8f9"
    />
    <path
      d="M60 50 L61 53 L64 53 L62 55 L63 58 L60 56 L57 58 L58 55 L56 53 L59 53 Z"
      fill="#f472b6"
    />
    <path
      d="M75 55 L76 58 L79 58 L77 60 L78 63 L75 61 L72 63 L73 60 L71 58 L74 58 Z"
      fill="#67e8f9"
    />

    {/* Side tabs */}
    <rect x="15" y="40" width="12" height="20" rx="3" fill="#22d3ee" />
    <rect x="93" y="40" width="12" height="20" rx="3" fill="#22d3ee" />

    {/* Tab details */}
    <rect x="17" y="45" width="8" height="10" rx="2" fill="#67e8f9" />
    <rect x="95" y="45" width="8" height="10" rx="2" fill="#67e8f9" />

    {/* Wetness indicator */}
    <rect x="55" y="70" width="10" height="15" rx="2" fill="#fef08a" />
  </svg>
);

// Baby Stroller Illustration
export const StrollerIllustration = ({ className = '', size = 120 }: IllustrationProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Shadow */}
    <ellipse cx="60" cy="110" rx="45" ry="5" fill="#c4b5fd" opacity="0.3" />

    {/* Back wheel */}
    <circle cx="30" cy="100" r="12" fill="#e9d5ff" stroke="#a78bfa" strokeWidth="3" />
    <circle cx="30" cy="100" r="4" fill="#a78bfa" />

    {/* Front wheel */}
    <circle cx="90" cy="100" r="10" fill="#e9d5ff" stroke="#a78bfa" strokeWidth="3" />
    <circle cx="90" cy="100" r="3" fill="#a78bfa" />

    {/* Frame */}
    <path
      d="M30 88 L45 55 L90 55 L90 90"
      stroke="#8b5cf6"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Basket underneath */}
    <path d="M38 85 L42 75 L78 75 L82 85 Z" fill="#ddd6fe" stroke="#a78bfa" strokeWidth="2" />

    {/* Seat/Carriage */}
    <path
      d="M40 25 L40 60 L85 60 L95 40 L95 25 C95 20 90 15 80 15 L55 15 C45 15 40 20 40 25"
      fill="#fce7f3"
      stroke="#f9a8d4"
      strokeWidth="2"
    />

    {/* Hood/Canopy */}
    <path
      d="M40 25 C40 10 55 5 70 5 C85 5 95 15 95 25"
      fill="#f9a8d4"
      stroke="#f472b6"
      strokeWidth="2"
    />

    {/* Hood inner */}
    <path d="M45 25 C45 15 57 10 70 10 C83 10 90 18 90 25" fill="#fce7f3" />

    {/* Handle */}
    <path
      d="M20 30 L35 30 L40 25"
      stroke="#8b5cf6"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <circle cx="17" cy="30" r="4" fill="#a78bfa" />

    {/* Cute baby peek */}
    <circle cx="65" cy="42" r="12" fill="#fce7f3" />
    <circle cx="62" cy="40" r="2" fill="#4a3642" />
    <circle cx="68" cy="40" r="2" fill="#4a3642" />
    <path
      d="M63 45 Q65 47 67 45"
      stroke="#4a3642"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    />
    <ellipse cx="58" cy="43" rx="2" ry="1" fill="#f9a8d4" opacity="0.6" />
    <ellipse cx="72" cy="43" rx="2" ry="1" fill="#f9a8d4" opacity="0.6" />
  </svg>
);

// Baby Crib/Bed Illustration
export const CribIllustration = ({ className = '', size = 120 }: IllustrationProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Shadow */}
    <ellipse cx="60" cy="108" rx="45" ry="5" fill="#fda4af" opacity="0.3" />

    {/* Crib base */}
    <rect
      x="15"
      y="85"
      width="90"
      height="8"
      rx="2"
      fill="#fecdd3"
      stroke="#fda4af"
      strokeWidth="2"
    />

    {/* Legs */}
    <rect x="20" y="93" width="6" height="15" rx="2" fill="#fda4af" />
    <rect x="94" y="93" width="6" height="15" rx="2" fill="#fda4af" />

    {/* Side rails - left */}
    <rect
      x="15"
      y="35"
      width="4"
      height="55"
      rx="2"
      fill="#fecdd3"
      stroke="#fda4af"
      strokeWidth="1"
    />
    {/* Side rails - right */}
    <rect
      x="101"
      y="35"
      width="4"
      height="55"
      rx="2"
      fill="#fecdd3"
      stroke="#fda4af"
      strokeWidth="1"
    />

    {/* Bars */}
    {[25, 35, 45, 55, 65, 75, 85, 95].map((x) => (
      <rect
        key={x}
        x={x}
        y="40"
        width="3"
        height="45"
        rx="1.5"
        fill="#fecdd3"
        stroke="#fda4af"
        strokeWidth="1"
      />
    ))}

    {/* Mattress */}
    <rect
      x="20"
      y="75"
      width="80"
      height="12"
      rx="3"
      fill="white"
      stroke="#e5e7eb"
      strokeWidth="1"
    />

    {/* Pillow */}
    <ellipse cx="40" cy="72" rx="15" ry="6" fill="#fef3c7" />

    {/* Blanket */}
    <path d="M50 68 L95 68 L95 82 C95 82 85 78 72 78 C59 78 50 82 50 82 Z" fill="#ddd6fe" />

    {/* Mobile hanging */}
    <line x1="60" y1="10" x2="60" y2="30" stroke="#f9a8d4" strokeWidth="2" />
    <circle cx="60" cy="8" r="4" fill="#f472b6" />

    {/* Mobile decorations */}
    <circle cx="45" cy="25" r="6" fill="#fcd34d" />
    <circle cx="60" cy="32" r="6" fill="#f472b6" />
    <circle cx="75" cy="25" r="6" fill="#67e8f9" />
    <line x1="60" y1="30" x2="45" y2="25" stroke="#f9a8d4" strokeWidth="1" />
    <line x1="60" y1="30" x2="75" y2="25" stroke="#f9a8d4" strokeWidth="1" />

    {/* Stars on mobile */}
    <path
      d="M45 25 L46 27 L48 27 L46.5 28.5 L47 31 L45 29.5 L43 31 L43.5 28.5 L42 27 L44 27 Z"
      fill="white"
    />
  </svg>
);

// Skincare/Bath Products Illustration
export const SkincareIllustration = ({ className = '', size = 120 }: IllustrationProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Shadow */}
    <ellipse cx="60" cy="108" rx="40" ry="5" fill="#86efac" opacity="0.3" />

    {/* Bottle 1 - Lotion */}
    <path
      d="M25 45 L25 95 C25 100 30 102 35 102 L45 102 C50 102 55 100 55 95 L55 45 C55 42 50 40 40 40 C30 40 25 42 25 45"
      fill="#dcfce7"
      stroke="#86efac"
      strokeWidth="2"
    />
    <rect x="32" y="30" width="16" height="12" rx="2" fill="#22c55e" />
    <ellipse cx="40" cy="28" rx="6" ry="3" fill="#22c55e" />

    {/* Pump */}
    <rect x="38" y="18" width="4" height="10" fill="#16a34a" />
    <rect x="35" y="15" width="10" height="5" rx="2" fill="#16a34a" />

    {/* Label */}
    <rect x="30" y="55" width="20" height="25" rx="3" fill="white" />
    <path d="M35 62 L45 62 M35 67 L42 67" stroke="#86efac" strokeWidth="2" strokeLinecap="round" />
    <circle cx="40" cy="74" r="3" fill="#22c55e" />

    {/* Bottle 2 - Small jar */}
    <ellipse cx="80" cy="92" rx="20" ry="8" fill="#fbcfe8" stroke="#f9a8d4" strokeWidth="2" />
    <path
      d="M60 65 L60 92 C60 92 68 85 80 85 C92 85 100 92 100 92 L100 65 C100 60 92 55 80 55 C68 55 60 60 60 65"
      fill="#fce7f3"
      stroke="#f9a8d4"
      strokeWidth="2"
    />
    <ellipse cx="80" cy="65" rx="20" ry="8" fill="#fce7f3" stroke="#f9a8d4" strokeWidth="2" />
    <ellipse cx="80" cy="65" rx="15" ry="5" fill="#fbcfe8" />

    {/* Cream swirl */}
    <path d="M75 65 Q80 60 85 65 Q80 70 75 65" fill="white" opacity="0.8" />

    {/* Bubbles decoration */}
    <circle cx="70" cy="25" r="8" fill="#e0f2fe" stroke="#7dd3fc" strokeWidth="1" />
    <circle cx="72" cy="23" r="2" fill="white" />
    <circle cx="85" cy="35" r="5" fill="#e0f2fe" stroke="#7dd3fc" strokeWidth="1" />
    <circle cx="95" cy="22" r="6" fill="#e0f2fe" stroke="#7dd3fc" strokeWidth="1" />
  </svg>
);

// Baby Shoes Illustration
export const ShoesIllustration = ({ className = '', size = 120 }: IllustrationProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Shadow */}
    <ellipse cx="60" cy="100" rx="45" ry="6" fill="#f9a8d4" opacity="0.3" />

    {/* Left shoe */}
    <path
      d="M15 70 C15 55 25 45 40 45 L50 45 C55 45 58 50 58 55 L58 75 C58 85 50 90 35 90 C20 90 15 82 15 70"
      fill="#fce7f3"
      stroke="#f9a8d4"
      strokeWidth="2"
    />
    {/* Left shoe sole */}
    <path d="M15 78 C15 85 22 92 35 92 C48 92 58 88 58 78" fill="#f9a8d4" />
    {/* Left shoe opening */}
    <ellipse cx="42" cy="50" rx="12" ry="6" fill="#fbcfe8" />
    {/* Left shoe strap */}
    <rect x="30" y="55" width="20" height="8" rx="4" fill="#f472b6" />
    <circle cx="40" cy="59" r="3" fill="#fce7f3" />
    {/* Left shoe decoration */}
    <circle cx="25" cy="70" r="3" fill="#f472b6" />
    <circle cx="35" cy="75" r="2" fill="#f472b6" />

    {/* Right shoe */}
    <path
      d="M62 70 C62 55 72 45 87 45 L97 45 C102 45 105 50 105 55 L105 75 C105 85 97 90 82 90 C67 90 62 82 62 70"
      fill="#fce7f3"
      stroke="#f9a8d4"
      strokeWidth="2"
    />
    {/* Right shoe sole */}
    <path d="M62 78 C62 85 69 92 82 92 C95 92 105 88 105 78" fill="#f9a8d4" />
    {/* Right shoe opening */}
    <ellipse cx="89" cy="50" rx="12" ry="6" fill="#fbcfe8" />
    {/* Right shoe strap */}
    <rect x="77" y="55" width="20" height="8" rx="4" fill="#f472b6" />
    <circle cx="87" cy="59" r="3" fill="#fce7f3" />
    {/* Right shoe decoration */}
    <circle cx="95" cy="70" r="3" fill="#f472b6" />
    <circle cx="85" cy="75" r="2" fill="#f472b6" />

    {/* Sparkles */}
    <path
      d="M50 35 L51 38 L54 38 L52 40 L53 43 L50 41 L47 43 L48 40 L46 38 L49 38 Z"
      fill="#fcd34d"
    />
    <path
      d="M75 30 L76 33 L79 33 L77 35 L78 38 L75 36 L72 38 L73 35 L71 33 L74 33 Z"
      fill="#fcd34d"
    />
  </svg>
);

// Pacifier Illustration
export const PacifierIllustration = ({ className = '', size = 120 }: IllustrationProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Shadow */}
    <ellipse cx="60" cy="100" rx="35" ry="5" fill="#f9a8d4" opacity="0.3" />

    {/* Shield/Guard */}
    <path
      d="M20 55 C20 40 35 30 60 30 C85 30 100 40 100 55 C100 70 85 80 60 80 C35 80 20 70 20 55"
      fill="#fce7f3"
      stroke="#f9a8d4"
      strokeWidth="3"
    />

    {/* Shield inner curve (butterfly shape) */}
    <path
      d="M30 55 C30 45 42 38 60 38 C78 38 90 45 90 55 C90 65 78 72 60 72 C42 72 30 65 30 55"
      fill="#fbcfe8"
    />

    {/* Ventilation holes */}
    <ellipse cx="40" cy="55" rx="5" ry="8" fill="#fce7f3" stroke="#f9a8d4" strokeWidth="1" />
    <ellipse cx="80" cy="55" rx="5" ry="8" fill="#fce7f3" stroke="#f9a8d4" strokeWidth="1" />

    {/* Nipple base */}
    <ellipse cx="60" cy="80" rx="15" ry="5" fill="#f9a8d4" />

    {/* Nipple */}
    <path
      d="M50 82 C50 82 52 95 60 95 C68 95 70 82 70 82"
      fill="#fcd34d"
      stroke="#fbbf24"
      strokeWidth="2"
    />

    {/* Ring/Handle */}
    <circle cx="60" cy="25" r="12" fill="none" stroke="#f472b6" strokeWidth="5" />
    <circle cx="60" cy="25" r="12" fill="none" stroke="#f9a8d4" strokeWidth="2" />

    {/* Decorative heart */}
    <path
      d="M60 50 L57 47 C54 44 54 40 57 38 C60 36 63 38 60 42 C57 38 60 36 63 38 C66 40 66 44 63 47 Z"
      fill="#f472b6"
    />

    {/* Shine on ring */}
    <path d="M52 18 C54 15 58 14 60 14" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Baby Rattle Toy Illustration
export const RattleIllustration = ({ className = '', size = 120 }: IllustrationProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Shadow */}
    <ellipse cx="60" cy="108" rx="30" ry="5" fill="#fda4af" opacity="0.3" />

    {/* Handle */}
    <path
      d="M55 95 L55 65 C55 60 58 58 60 58 C62 58 65 60 65 65 L65 95 C65 100 62 102 60 102 C58 102 55 100 55 95"
      fill="#a78bfa"
      stroke="#8b5cf6"
      strokeWidth="2"
    />

    {/* Handle grip lines */}
    <line x1="56" y1="75" x2="64" y2="75" stroke="#8b5cf6" strokeWidth="1" />
    <line x1="56" y1="80" x2="64" y2="80" stroke="#8b5cf6" strokeWidth="1" />
    <line x1="56" y1="85" x2="64" y2="85" stroke="#8b5cf6" strokeWidth="1" />
    <line x1="56" y1="90" x2="64" y2="90" stroke="#8b5cf6" strokeWidth="1" />

    {/* Main rattle head */}
    <circle cx="60" cy="35" r="28" fill="#fce7f3" stroke="#f9a8d4" strokeWidth="3" />

    {/* Inner circle */}
    <circle cx="60" cy="35" r="20" fill="#fbcfe8" />

    {/* Cute face */}
    <circle cx="52" cy="32" r="4" fill="#4a3642" />
    <circle cx="68" cy="32" r="4" fill="#4a3642" />
    <circle cx="53" cy="31" r="1.5" fill="white" />
    <circle cx="69" cy="31" r="1.5" fill="white" />

    {/* Blush */}
    <ellipse cx="46" cy="38" rx="4" ry="2" fill="#fda4af" opacity="0.6" />
    <ellipse cx="74" cy="38" rx="4" ry="2" fill="#fda4af" opacity="0.6" />

    {/* Smile */}
    <path
      d="M54 42 Q60 48 66 42"
      stroke="#4a3642"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />

    {/* Stars around */}
    <path
      d="M25 25 L26 28 L29 28 L27 30 L28 33 L25 31 L22 33 L23 30 L21 28 L24 28 Z"
      fill="#fcd34d"
    />
    <path
      d="M95 25 L96 28 L99 28 L97 30 L98 33 L95 31 L92 33 L93 30 L91 28 L94 28 Z"
      fill="#fcd34d"
    />
    <path d="M60 5 L61 8 L64 8 L62 10 L63 13 L60 11 L57 13 L58 10 L56 8 L59 8 Z" fill="#fcd34d" />

    {/* Sound effect lines */}
    <path d="M92 35 C95 32 95 38 92 35" stroke="#f9a8d4" strokeWidth="2" />
    <path d="M98 35 C101 30 101 40 98 35" stroke="#f9a8d4" strokeWidth="2" />
    <path d="M28 35 C25 32 25 38 28 35" stroke="#f9a8d4" strokeWidth="2" />
    <path d="M22 35 C19 30 19 40 22 35" stroke="#f9a8d4" strokeWidth="2" />
  </svg>
);

// Baby Food/Bowl Illustration
export const BabyFoodIllustration = ({ className = '', size = 120 }: IllustrationProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Shadow */}
    <ellipse cx="55" cy="105" rx="35" ry="5" fill="#fdba74" opacity="0.3" />

    {/* Bowl */}
    <ellipse cx="55" cy="75" rx="40" ry="15" fill="#fef3c7" stroke="#fcd34d" strokeWidth="2" />
    <path
      d="M15 75 C15 90 32 100 55 100 C78 100 95 90 95 75"
      fill="#fef3c7"
      stroke="#fcd34d"
      strokeWidth="2"
    />

    {/* Food in bowl */}
    <ellipse cx="55" cy="72" rx="32" ry="10" fill="#fed7aa" />

    {/* Food texture */}
    <circle cx="40" cy="70" r="4" fill="#fdba74" opacity="0.6" />
    <circle cx="55" cy="68" r="5" fill="#fdba74" opacity="0.6" />
    <circle cx="70" cy="71" r="4" fill="#fdba74" opacity="0.6" />
    <circle cx="48" cy="74" r="3" fill="#fdba74" opacity="0.6" />
    <circle cx="62" cy="73" r="3" fill="#fdba74" opacity="0.6" />

    {/* Steam */}
    <path
      d="M40 55 Q42 50 40 45 Q38 40 40 35"
      stroke="#e5e7eb"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M55 52 Q57 47 55 42 Q53 37 55 32"
      stroke="#e5e7eb"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M70 55 Q72 50 70 45 Q68 40 70 35"
      stroke="#e5e7eb"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />

    {/* Spoon */}
    <ellipse
      cx="100"
      cy="50"
      rx="12"
      ry="8"
      fill="#e5e7eb"
      stroke="#d1d5db"
      strokeWidth="2"
      transform="rotate(30 100 50)"
    />
    <rect x="95" y="55" width="6" height="40" rx="3" fill="#d1d5db" transform="rotate(30 98 75)" />

    {/* Bowl decoration - stars */}
    <path
      d="M25 85 L26 87 L28 87 L26.5 88.5 L27 90 L25 89 L23 90 L23.5 88.5 L22 87 L24 87 Z"
      fill="#f472b6"
    />
    <path
      d="M85 85 L86 87 L88 87 L86.5 88.5 L87 90 L85 89 L83 90 L83.5 88.5 L82 87 L84 87 Z"
      fill="#f472b6"
    />
  </svg>
);

// Ribbon/Bow Decoration Illustration
export const BowIllustration = ({ className = '', size = 120 }: IllustrationProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Left ribbon tail */}
    <path d="M25 60 L35 85 L45 82 L40 60" fill="#f472b6" />
    <path d="M25 60 L20 95 L30 98 L35 85" fill="#ec4899" />

    {/* Right ribbon tail */}
    <path d="M95 60 L85 85 L75 82 L80 60" fill="#f472b6" />
    <path d="M95 60 L100 95 L90 98 L85 85" fill="#ec4899" />

    {/* Left bow loop */}
    <ellipse cx="40" cy="45" rx="22" ry="18" fill="#f9a8d4" />
    <ellipse cx="40" cy="45" rx="18" ry="14" fill="#fbcfe8" />
    <ellipse cx="38" cy="42" rx="8" ry="6" fill="#fce7f3" opacity="0.6" />

    {/* Right bow loop */}
    <ellipse cx="80" cy="45" rx="22" ry="18" fill="#f9a8d4" />
    <ellipse cx="80" cy="45" rx="18" ry="14" fill="#fbcfe8" />
    <ellipse cx="82" cy="42" rx="8" ry="6" fill="#fce7f3" opacity="0.6" />

    {/* Center knot */}
    <ellipse cx="60" cy="52" rx="12" ry="15" fill="#f472b6" />
    <ellipse cx="60" cy="50" rx="8" ry="10" fill="#ec4899" />
    <ellipse cx="58" cy="47" rx="3" ry="4" fill="#f9a8d4" opacity="0.5" />

    {/* Sparkles */}
    <circle cx="30" cy="30" r="3" fill="#fcd34d" />
    <circle cx="90" cy="30" r="2" fill="#fcd34d" />
    <circle cx="60" cy="25" r="2" fill="#fcd34d" />
  </svg>
);

export const productIllustrations = {
  clothes: ClothesIllustration,
  bottle: BottleIllustration,
  teddy: TeddyIllustration,
  diaper: DiaperIllustration,
  stroller: StrollerIllustration,
  crib: CribIllustration,
  skincare: SkincareIllustration,
  shoes: ShoesIllustration,
  pacifier: PacifierIllustration,
  rattle: RattleIllustration,
  food: BabyFoodIllustration,
  bow: BowIllustration,
};

export type ProductIllustrationType = keyof typeof productIllustrations;
