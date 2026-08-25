import React from 'react';
import { Club } from '../types';

interface ClubEmblemProps {
  club: Club;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showName?: boolean;
}

export const ClubEmblem: React.FC<ClubEmblemProps> = ({
  club,
  size = 'md',
  className = '',
  showName = false,
}) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  const renderHeraldicIcon = () => {
    const p = club.primaryColor;
    const s = club.secondaryColor;
    const a = club.accentColor;

    switch (club.id) {
      case 'galatasaray':
        return (
          <g>
            {/* Split Shield */}
            <path d="M50 8 L84 22 C84 62 50 88 50 92 C50 88 16 62 16 22 Z" fill={p} stroke="#FDB913" strokeWidth="3" />
            <path d="M50 8 L84 22 C84 62 50 88 50 92 Z" fill={s} />
            {/* Stylized Lion Silhouette */}
            <path d="M42 34 C42 30 58 30 58 34 C58 42 62 46 58 58 C55 52 45 52 42 58 C38 46 42 42 42 34 Z" fill="#FFFFFF" opacity="0.9" />
            <circle cx="50" cy="46" r="5" fill="#A90432" />
            {/* Stars */}
            <polygon points="50,16 52,21 57,21 53,24 55,29 50,26 45,29 47,24 43,21 48,21" fill="#FDB913" />
            <text x="50" y="74" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="sans-serif">GS</text>
          </g>
        );

      case 'fenerbahce':
        return (
          <g>
            {/* Circle Badge */}
            <circle cx="50" cy="50" r="42" fill="#002D72" stroke="#FFF200" strokeWidth="4" />
            <circle cx="50" cy="50" r="32" fill="#FFFFFF" />
            {/* Vertical Yellow/Navy Stripes in center */}
            <rect x="36" y="24" width="8" height="36" fill="#002D72" rx="2" />
            <rect x="44" y="20" width="12" height="42" fill="#FFF200" rx="2" />
            <rect x="56" y="24" width="8" height="36" fill="#002D72" rx="2" />
            {/* Oak Leaf / Acorn heraldry */}
            <path d="M50 30 C56 36 54 48 50 56 C46 48 44 36 50 30 Z" fill="#10743B" />
            <text x="50" y="78" textAnchor="middle" fill="#FFF200" fontSize="10" fontWeight="bold" letterSpacing="1">1907</text>
          </g>
        );

      case 'besiktas':
        return (
          <g>
            {/* Shield with Black and White stripes */}
            <path d="M50 10 L82 22 C82 60 50 88 50 90 C50 88 18 60 18 22 Z" fill="#111111" stroke="#F4F4F5" strokeWidth="3" />
            <rect x="34" y="20" width="10" height="50" fill="#F4F4F5" />
            <rect x="56" y="20" width="10" height="50" fill="#F4F4F5" />
            {/* Red Turkish Flag Badge */}
            <rect x="44" y="26" width="12" height="12" fill="#E11D48" rx="2" />
            <circle cx="49" cy="32" r="3" fill="#FFFFFF" />
            <circle cx="50" cy="32" r="2.2" fill="#E11D48" />
            {/* Eagle Wings Silhouette */}
            <path d="M30 48 Q50 64 70 48 Q50 54 30 48 Z" fill="#F4F4F5" />
            <text x="50" y="76" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">BJK</text>
          </g>
        );

      case 'trabzonspor':
        return (
          <g>
            <path d="M50 10 L84 24 C84 62 50 88 50 90 C50 88 16 62 16 24 Z" fill="#800020" stroke="#4A90E2" strokeWidth="3.5" />
            <path d="M50 10 L84 24 C84 62 50 88 50 90 Z" fill="#4A90E2" />
            <circle cx="50" cy="46" r="18" fill="#800020" stroke="#FFFFFF" strokeWidth="2" />
            <text x="50" y="52" textAnchor="middle" fill="#4A90E2" fontSize="16" fontWeight="900">TS</text>
            <text x="50" y="76" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">1967</text>
          </g>
        );

      case 'manchester_city':
        return (
          <g>
            <circle cx="50" cy="50" r="42" fill="#6CABDD" stroke="#1C2C5B" strokeWidth="4" />
            <circle cx="50" cy="50" r="32" fill="#FFFFFF" />
            {/* Golden Ship */}
            <path d="M34 38 L66 38 L60 48 L40 48 Z" fill="#DBA111" />
            <path d="M50 24 L50 38 M44 28 L50 24 L56 28" stroke="#1C2C5B" strokeWidth="2.5" fill="none" />
            {/* Red Rose Motif */}
            <circle cx="50" cy="60" r="6" fill="#DA291C" />
            <circle cx="50" cy="60" r="2.5" fill="#DBA111" />
          </g>
        );

      case 'arsenal':
        return (
          <g>
            <path d="M50 10 L84 20 C84 65 50 90 50 90 C50 90 16 65 16 20 Z" fill="#EF0107" stroke="#023474" strokeWidth="4" />
            <path d="M50 14 L80 23 C80 62 50 85 50 85 C50 85 20 62 20 23 Z" fill="#EF0107" stroke="#FFFFFF" strokeWidth="2" />
            {/* Artillery Golden Cannon */}
            <rect x="32" y="44" width="34" height="8" rx="3" fill="#D4AF37" />
            <circle cx="38" cy="56" r="9" fill="#D4AF37" stroke="#023474" strokeWidth="3" />
            <rect x="34" y="40" width="8" height="4" fill="#D4AF37" />
            <text x="50" y="32" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="900" letterSpacing="1">GUNNERS</text>
          </g>
        );

      case 'liverpool':
        return (
          <g>
            <path d="M50 10 L84 22 C84 62 50 88 50 90 C50 88 16 62 16 22 Z" fill="#C8102E" stroke="#00B2A9" strokeWidth="3.5" />
            {/* Heraldic Liverbird */}
            <path d="M48 28 C52 26 56 28 58 32 C62 30 64 34 60 38 C64 42 62 48 58 52 C58 58 52 64 46 64 C40 64 42 56 46 52 C42 48 40 40 44 34 C42 30 46 28 48 28 Z" fill="#F6EB61" />
            <path d="M56 34 L62 32" stroke="#F6EB61" strokeWidth="2" />
            <text x="50" y="78" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">LFC</text>
          </g>
        );

      case 'manchester_united':
        return (
          <g>
            <path d="M50 10 L84 22 C84 62 50 88 50 90 C50 88 16 62 16 22 Z" fill="#DA291C" stroke="#FBE122" strokeWidth="3.5" />
            {/* Center Yellow Band */}
            <rect x="22" y="34" width="56" height="28" fill="#FBE122" />
            {/* Red Devil Trident */}
            <path d="M50 36 L50 58 M44 38 Q50 48 56 38" stroke="#DA291C" strokeWidth="3" fill="none" strokeLinecap="round" />
            <polygon points="50,33 47,38 53,38" fill="#DA291C" />
            <text x="50" y="26" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">MANCHESTER</text>
            <text x="50" y="76" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">UNITED</text>
          </g>
        );

      case 'chelsea':
        return (
          <g>
            <circle cx="50" cy="50" r="42" fill="#034694" stroke="#DBA111" strokeWidth="4" />
            <circle cx="50" cy="50" r="32" fill="#FFFFFF" />
            {/* Rampant Lion with Scepter */}
            <path d="M44 32 C46 28 54 28 56 32 C54 36 60 40 56 46 C60 52 56 60 50 64 C44 60 46 52 42 46 C44 40 40 36 44 32 Z" fill="#034694" />
            <line x1="58" y1="28" x2="62" y2="52" stroke="#DA291C" strokeWidth="2.5" />
            <circle cx="58" cy="27" r="2.5" fill="#DBA111" />
            {/* Red Roses */}
            <circle cx="28" cy="50" r="3" fill="#DA291C" />
            <circle cx="72" cy="50" r="3" fill="#DA291C" />
          </g>
        );

      case 'tottenham':
        return (
          <g>
            <path d="M50 10 L82 22 C82 62 50 88 50 90 C50 88 18 62 18 22 Z" fill="#FFFFFF" stroke="#132257" strokeWidth="4" />
            {/* Cockerel on Ball */}
            <path d="M50 26 C54 22 58 24 58 28 C62 30 60 36 56 40 C56 46 54 50 50 54 C46 50 44 46 44 40 C40 36 38 30 42 28 C42 24 46 22 50 26 Z" fill="#132257" />
            <circle cx="50" cy="64" r="10" fill="#132257" stroke="#CBD5E1" strokeWidth="1.5" />
            <text x="50" y="82" textAnchor="middle" fill="#132257" fontSize="8" fontWeight="bold">SPURS</text>
          </g>
        );

      case 'real_madrid':
        return (
          <g>
            {/* Golden Crown */}
            <path d="M30 22 L35 14 L50 20 L65 14 L70 22 Z" fill="#EEB527" stroke="#5E2784" strokeWidth="1.5" />
            <circle cx="35" cy="14" r="2" fill="#5E2784" />
            <circle cx="50" cy="20" r="2" fill="#5E2784" />
            <circle cx="65" cy="14" r="2" fill="#5E2784" />
            {/* Circle Crest */}
            <circle cx="50" cy="56" r="34" fill="#FFFFFF" stroke="#EEB527" strokeWidth="4" />
            {/* Purple Diagonal Sash */}
            <path d="M26 40 L60 74 L74 60 L40 26 Z" fill="#5E2784" />
            {/* Stylized Monogram */}
            <circle cx="50" cy="56" r="18" fill="none" stroke="#EEB527" strokeWidth="3" />
            <text x="50" y="62" textAnchor="middle" fill="#EEB527" fontSize="16" fontWeight="900" fontFamily="serif">M</text>
          </g>
        );

      case 'barcelona':
        return (
          <g>
            <path d="M50 10 L84 20 C84 65 50 90 50 90 C50 90 16 65 16 20 Z" fill="#FFFFFF" stroke="#EDBB00" strokeWidth="3.5" />
            {/* Top Half: St George Cross & Catalan Senyera */}
            <rect x="18" y="20" width="30" height="22" fill="#FFFFFF" />
            <line x1="33" y1="20" x2="33" y2="42" stroke="#DA291C" strokeWidth="4" />
            <line x1="18" y1="31" x2="48" y2="31" stroke="#DA291C" strokeWidth="4" />
            <rect x="50" y="20" width="32" height="22" fill="#EDBB00" />
            <line x1="58" y1="20" x2="58" y2="42" stroke="#DA291C" strokeWidth="3" />
            <line x1="68" y1="20" x2="68" y2="42" stroke="#DA291C" strokeWidth="3" />
            {/* Bottom Half: Blaugrana Stripes */}
            <path d="M18 42 L82 42 C80 66 50 86 50 86 C50 86 20 66 18 42 Z" fill="#A50044" />
            <rect x="36" y="42" width="10" height="38" fill="#004D98" />
            <rect x="54" y="42" width="10" height="38" fill="#004D98" />
            {/* Center Ball */}
            <circle cx="50" cy="58" r="8" fill="#EDBB00" stroke="#111111" strokeWidth="1.5" />
          </g>
        );

      case 'atletico_madrid':
        return (
          <g>
            <path d="M50 10 L82 20 C82 62 50 88 50 90 C50 88 18 62 18 20 Z" fill="#FFFFFF" stroke="#272E61" strokeWidth="3.5" />
            {/* Red & White Stripes */}
            <rect x="22" y="20" width="12" height="64" fill="#CB3524" />
            <rect x="44" y="20" width="12" height="68" fill="#CB3524" />
            <rect x="66" y="20" width="12" height="64" fill="#CB3524" />
            {/* Top Left Navy Box with Bear & Tree */}
            <path d="M18 20 L50 20 L50 48 L18 48 Z" fill="#272E61" />
            <circle cx="34" cy="34" r="7" fill="#FFFFFF" />
            <circle cx="34" cy="34" r="4" fill="#CB3524" />
          </g>
        );

      case 'sevilla':
        return (
          <g>
            <path d="M50 10 L84 20 C84 62 50 88 50 90 C50 88 16 62 16 20 Z" fill="#FFFFFF" stroke="#D4001F" strokeWidth="3.5" />
            {/* Red-White diagonal / stripes */}
            <rect x="48" y="42" width="34" height="42" fill="#D4001F" />
            <rect x="58" y="42" width="8" height="42" fill="#FFFFFF" />
            <rect x="74" y="42" width="8" height="42" fill="#FFFFFF" />
            <text x="50" y="34" textAnchor="middle" fill="#D4001F" fontSize="11" fontWeight="900">SFC</text>
          </g>
        );

      case 'valencia':
        return (
          <g>
            {/* Bat atop Shield */}
            <path d="M30 18 Q50 8 70 18 Q62 26 50 22 Q38 26 30 18 Z" fill="#000000" />
            <path d="M50 22 L82 30 C82 66 50 90 50 90 C50 90 18 66 18 30 Z" fill="#FFFFFF" stroke="#FF6600" strokeWidth="3" />
            {/* Senyera Stripes */}
            <rect x="22" y="32" width="12" height="52" fill="#FF6600" />
            <rect x="44" y="32" width="12" height="56" fill="#FF6600" />
            <rect x="66" y="32" width="12" height="52" fill="#FF6600" />
            <circle cx="50" cy="56" r="10" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
            <text x="50" y="60" textAnchor="middle" fill="#000000" fontSize="10" fontWeight="bold">VCF</text>
          </g>
        );

      case 'inter':
        return (
          <g>
            <circle cx="50" cy="50" r="42" fill="#0066B2" stroke="#0A0A0A" strokeWidth="4" />
            <circle cx="50" cy="50" r="34" fill="#0A0A0A" />
            <circle cx="50" cy="50" r="28" fill="#0066B2" />
            {/* Stylized Modern IM Monogram */}
            <text x="50" y="58" textAnchor="middle" fill="#FFFFFF" fontSize="22" fontWeight="900" letterSpacing="1">IM</text>
          </g>
        );

      case 'milan':
        return (
          <g>
            <ellipse cx="50" cy="50" rx="34" ry="42" fill="#FFFFFF" stroke="#FB090B" strokeWidth="4" />
            {/* Left: Red and Black Stripes */}
            <path d="M50 10 A 32 40 0 0 0 18 50 A 32 40 0 0 0 50 90 Z" fill="#FB090B" />
            <path d="M38 12 A 32 40 0 0 0 26 50 A 32 40 0 0 0 38 88 Z" fill="#000000" />
            {/* Right: Red Cross of St Ambrose */}
            <line x1="50" y1="10" x2="50" y2="90" stroke="#FB090B" strokeWidth="3" />
            <line x1="50" y1="50" x2="82" y2="50" stroke="#FB090B" strokeWidth="6" />
            <line x1="66" y1="18" x2="66" y2="82" stroke="#FB090B" strokeWidth="6" />
            <text x="50" y="24" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">ACM</text>
            <text x="50" y="82" textAnchor="middle" fill="#000000" fontSize="8" fontWeight="bold">1899</text>
          </g>
        );

      case 'juventus':
        return (
          <g>
            <path d="M50 10 L82 20 C82 65 50 90 50 90 C50 90 18 65 18 20 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="4" />
            {/* Modern J Silhouette */}
            <path d="M34 26 L46 26 L46 62 C46 68 40 72 32 72 L32 64 C36 64 38 62 38 58 L38 26 Z" fill="#000000" />
            <path d="M54 26 L66 26 L66 62 C66 74 54 80 44 80 L44 72 C50 72 58 68 58 60 L58 26 Z" fill="#000000" />
            {/* Golden Star Accent */}
            <polygon points="50,14 52,18 56,18 53,21 54,25 50,22 46,25 47,21 44,18 48,18" fill="#CB9B51" />
          </g>
        );

      case 'roma':
        return (
          <g>
            <path d="M50 10 L84 22 C84 62 50 88 50 90 C50 88 16 62 16 22 Z" fill="#8E1F2F" stroke="#F0BC42" strokeWidth="3.5" />
            <path d="M50 10 L84 22 C84 62 50 88 50 90 Z" fill="#F0BC42" />
            {/* Capitoline Wolf Silhouette */}
            <circle cx="50" cy="42" r="14" fill="#8E1F2F" stroke="#FFFFFF" strokeWidth="1.5" />
            <text x="50" y="46" textAnchor="middle" fill="#F0BC42" fontSize="10" fontWeight="bold">ASR</text>
            <text x="50" y="74" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">ROMA</text>
          </g>
        );

      case 'napoli':
        return (
          <g>
            <circle cx="50" cy="50" r="42" fill="#12A0D7" stroke="#003B64" strokeWidth="4" />
            <circle cx="50" cy="50" r="32" fill="#003B64" />
            <text x="50" y="62" textAnchor="middle" fill="#FFFFFF" fontSize="32" fontWeight="900" fontFamily="sans-serif">N</text>
          </g>
        );

      case 'bayern_munchen':
        return (
          <g>
            <circle cx="50" cy="50" r="42" fill="#DC052D" stroke="#0066B2" strokeWidth="4" />
            <circle cx="50" cy="50" r="32" fill="#FFFFFF" />
            {/* Bavarian Blue-White Checkered Lozenges */}
            <circle cx="50" cy="50" r="24" fill="#0066B2" />
            <path d="M36 36 L44 28 L52 36 L44 44 Z M52 36 L60 28 L68 36 L60 44 Z M44 44 L52 36 L60 44 L52 52 Z M36 52 L44 44 L52 52 L44 60 Z M52 52 L60 44 L68 52 L60 60 Z M44 60 L52 52 L60 60 L52 68 Z" fill="#FFFFFF" />
            <text x="50" y="24" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="900">FC BAYERN</text>
          </g>
        );

      case 'borussia_dortmund':
        return (
          <g>
            <circle cx="50" cy="50" r="42" fill="#FDE100" stroke="#000000" strokeWidth="4.5" />
            <circle cx="50" cy="50" r="34" fill="#FDE100" stroke="#000000" strokeWidth="1.5" />
            <text x="50" y="46" textAnchor="middle" fill="#000000" fontSize="16" fontWeight="900">BVB</text>
            <text x="50" y="66" textAnchor="middle" fill="#000000" fontSize="14" fontWeight="900">09</text>
          </g>
        );

      case 'bayer_leverkusen':
        return (
          <g>
            <circle cx="50" cy="50" r="42" fill="#E32219" stroke="#000000" strokeWidth="4" />
            <circle cx="50" cy="50" r="30" fill="#000000" />
            <text x="50" y="46" textAnchor="middle" fill="#F7E700" fontSize="12" fontWeight="900">B04</text>
            <text x="50" y="64" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">BAYER</text>
          </g>
        );

      case 'rb_leipzig':
        return (
          <g>
            <path d="M50 10 L84 22 C84 62 50 88 50 90 C50 88 16 62 16 22 Z" fill="#FFFFFF" stroke="#DA291C" strokeWidth="3.5" />
            {/* Red Charging Bulls */}
            <circle cx="40" cy="46" r="10" fill="#DA291C" />
            <circle cx="60" cy="46" r="10" fill="#DA291C" />
            <circle cx="50" cy="46" r="8" fill="#FBD800" />
            <text x="50" y="74" textAnchor="middle" fill="#DA291C" fontSize="11" fontWeight="900">RBL</text>
          </g>
        );

      case 'paris_saint_germain':
        return (
          <g>
            <circle cx="50" cy="50" r="42" fill="#004170" stroke="#DA291C" strokeWidth="4" />
            <circle cx="50" cy="50" r="32" fill="#004170" />
            {/* Eiffel Tower Silhouette */}
            <path d="M50 24 L54 44 L46 44 Z M45 44 L55 44 L60 64 L40 64 Z" fill="#DA291C" />
            {/* Fleur-de-lis */}
            <path d="M50 56 C48 52 52 52 50 56 Z" fill="#FFFFFF" />
            <circle cx="50" cy="56" r="2" fill="#FFFFFF" />
            <text x="50" y="80" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">PARIS</text>
          </g>
        );

      case 'olympique_marseille':
        return (
          <g>
            <circle cx="50" cy="50" r="42" fill="#FFFFFF" stroke="#2FAEE0" strokeWidth="4" />
            {/* Golden Star */}
            <polygon points="50,14 52,18 56,18 53,21 54,25 50,22 46,25 47,21 44,18 48,18" fill="#D4AF37" />
            {/* OM Monogram */}
            <text x="50" y="60" textAnchor="middle" fill="#2FAEE0" fontSize="24" fontWeight="900">OM</text>
            <text x="50" y="78" textAnchor="middle" fill="#D4AF37" fontSize="7" fontWeight="bold">DROIT AU BUT</text>
          </g>
        );

      case 'olympique_lyon':
        return (
          <g>
            <path d="M50 10 L84 22 C84 62 50 88 50 90 C50 88 16 62 16 22 Z" fill="#002B7F" stroke="#DA291C" strokeWidth="3.5" />
            <path d="M50 10 L84 22 C84 62 50 88 50 90 Z" fill="#DA291C" />
            {/* Golden Lion Rampant */}
            <circle cx="50" cy="46" r="16" fill="#002B7F" stroke="#D4AF37" strokeWidth="2" />
            <text x="50" y="52" textAnchor="middle" fill="#D4AF37" fontSize="14" fontWeight="900">OL</text>
          </g>
        );

      case 'monaco':
        return (
          <g>
            {/* Princely Crown */}
            <path d="M35 18 L40 12 L50 16 L60 12 L65 18 Z" fill="#D4AF37" />
            {/* Split Diagonal Shield */}
            <path d="M50 20 L84 28 C84 64 50 90 50 90 C50 90 16 64 16 28 Z" fill="#E30613" stroke="#D4AF37" strokeWidth="3" />
            <path d="M16 28 L84 76 L84 28 Z" fill="#FFFFFF" />
            <text x="50" y="60" textAnchor="middle" fill="#E30613" fontSize="12" fontWeight="900">ASM</text>
          </g>
        );

      case 'benfica':
        return (
          <g>
            {/* Eagle Top */}
            <path d="M30 18 Q50 8 70 18 Q50 24 30 18 Z" fill="#006400" />
            <path d="M50 20 L84 28 C84 64 50 90 50 90 C50 90 16 64 16 28 Z" fill="#E30613" stroke="#FFFFFF" strokeWidth="3" />
            <circle cx="50" cy="54" r="18" fill="#FFFFFF" stroke="#006400" strokeWidth="2" />
            <text x="50" y="60" textAnchor="middle" fill="#E30613" fontSize="12" fontWeight="900">SLB</text>
          </g>
        );

      case 'porto':
        return (
          <g>
            <path d="M50 10 L84 22 C84 62 50 88 50 90 C50 88 16 62 16 22 Z" fill="#003893" stroke="#00A3E0" strokeWidth="3.5" />
            {/* White-Blue vertical stripes */}
            <rect x="36" y="24" width="10" height="52" fill="#FFFFFF" />
            <rect x="54" y="24" width="10" height="52" fill="#FFFFFF" />
            {/* Dragon Crest */}
            <circle cx="50" cy="46" r="12" fill="#003893" stroke="#00A3E0" strokeWidth="2" />
            <text x="50" y="51" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="900">FCP</text>
          </g>
        );

      case 'sporting_cp':
        return (
          <g>
            <path d="M50 10 L84 22 C84 62 50 88 50 90 C50 88 16 62 16 22 Z" fill="#008057" stroke="#FFCC00" strokeWidth="3.5" />
            {/* Green-White horizontal stripes */}
            <rect x="22" y="32" width="56" height="8" fill="#FFFFFF" />
            <rect x="22" y="48" width="56" height="8" fill="#FFFFFF" />
            {/* Rampant Golden Lion */}
            <text x="50" y="74" textAnchor="middle" fill="#FFCC00" fontSize="13" fontWeight="900">SCP</text>
          </g>
        );

      default:
        return (
          <g>
            <circle cx="50" cy="50" r="42" fill={p} stroke={s} strokeWidth="4" />
            <text x="50" y="58" textAnchor="middle" fill={a} fontSize="18" fontWeight="bold">
              {club.shortName}
            </text>
          </g>
        );
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`${sizeMap[size]} relative transition-transform duration-200 hover:scale-105 filter drop-shadow-md`}
        title={`${club.name} (${club.country})`}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <filter id={`shadow-${club.id}`} x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" />
            </filter>
          </defs>
          {renderHeraldicIcon()}
        </svg>
      </div>
      {showName && (
        <span className="mt-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 text-center tracking-tight truncate max-w-[100px]">
          {club.name}
        </span>
      )}
    </div>
  );
};
