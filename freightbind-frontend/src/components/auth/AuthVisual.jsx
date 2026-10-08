/**
 * Decorative freight-terminal scene used on the auth pages' visual panel.
 *
 * Pure inline SVG + CSS (no image asset, zero bundle cost, reduced-motion
 * safe via the .auth-route-line / .auth-node-pulse classes defined in
 * index.css). Draws a container terminal silhouette — cranes, container
 * stacks, a ship at berth — with a slowly animated ORIGIN → PORT →
 * DESTINATION route on top. Purely illustrative, not functional data.
 */
const CONTAINER_STACKS = [
  { x: 40, y: 430, w: 74, cols: 2, rows: 5, colors: ["#1B2A4A", "#223557", "#1E3A52"] },
  { x: 216, y: 430, w: 56, cols: 3, rows: 3, colors: ["#24405A", "#2A3F63", "#25505B"] },
  { x: 478, y: 430, w: 64, cols: 2, rows: 4, colors: ["#182742", "#1F3354"] },
];

const SHIP_CONTAINER_COLORS = ["#1F3B52", "#2A405E", "#2C5A5B", "#29415F", "#1E3A52"];

const renderStacks = () =>
  CONTAINER_STACKS.map((stack, stackIndex) =>
    Array.from({ length: stack.rows }).map((_, row) =>
      Array.from({ length: stack.cols }).map((_, col) => (
        <rect
          key={`${stackIndex}-${row}-${col}`}
          x={stack.x + col * (stack.w + 3)}
          y={stack.y - 19 * (row + 1)}
          width={stack.w}
          height={17}
          rx={2}
          fill={stack.colors[row % stack.colors.length]}
          opacity={0.95 - row * 0.06}
        />
      ))
    )
  );

const AuthVisual = ({ className = "" }) => (
  <svg
    viewBox="0 0 760 540"
    preserveAspectRatio="xMidYMax meet"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <linearGradient id="authSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0B1220" />
        <stop offset="100%" stopColor="#14243F" />
      </linearGradient>
      <linearGradient id="authWater" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0E1B33" />
        <stop offset="100%" stopColor="#080E1B" />
      </linearGradient>
      <radialGradient id="authGlow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="#2E9385" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#2E9385" stopOpacity="0" />
      </radialGradient>
      <pattern id="authGrid" width="44" height="44" patternUnits="userSpaceOnUse">
        <path d="M44 0H0V44" fill="none" stroke="#94A3B8" strokeOpacity="0.05" />
      </pattern>
    </defs>

    <rect width="760" height="540" fill="url(#authSky)" />
    <rect width="760" height="540" fill="url(#authGrid)" />
    <circle cx="620" cy="190" r="230" fill="url(#authGlow)" />
    <circle cx="140" cy="120" r="170" fill="url(#authGlow)" opacity="0.5" />

    {/* Digital network routes */}
    <g fill="none" strokeLinecap="round">
      <path
        d="M150 112 C 300 176, 430 64, 596 124"
        stroke="#4CB0A2"
        strokeWidth="1.6"
        strokeOpacity="0.7"
        className="auth-route-line"
      />
      <path
        d="M596 124 C 640 112, 680 88, 712 66"
        stroke="#4CB0A2"
        strokeWidth="1.3"
        strokeOpacity="0.5"
        className="auth-route-line"
        style={{ animationDelay: "-9s" }}
      />
      <path
        d="M96 258 C 240 300, 470 262, 620 306"
        stroke="#7FCCC1"
        strokeWidth="1"
        strokeOpacity="0.22"
        strokeDasharray="3 8"
      />
    </g>

    {/* Route nodes */}
    <g>
      <circle cx="150" cy="112" r="17" fill="#4CB0A2" opacity="0.1" />
      <circle cx="150" cy="112" r="7" fill="none" stroke="#4CB0A2" strokeOpacity="0.45" />
      <circle cx="150" cy="112" r="2.6" fill="#4CB0A2" className="auth-node-pulse" />

      <circle cx="596" cy="124" r="17" fill="#4CB0A2" opacity="0.1" />
      <circle cx="596" cy="124" r="7" fill="none" stroke="#4CB0A2" strokeOpacity="0.45" />
      <circle
        cx="596"
        cy="124"
        r="2.6"
        fill="#4CB0A2"
        className="auth-node-pulse"
        style={{ animationDelay: "-1.2s" }}
      />

      <circle cx="712" cy="66" r="15" fill="#4CB0A2" opacity="0.08" />
      <circle cx="712" cy="66" r="6" fill="none" stroke="#4CB0A2" strokeOpacity="0.45" />
      <circle
        cx="712"
        cy="66"
        r="2.4"
        fill="#7FCCC1"
        className="auth-node-pulse"
        style={{ animationDelay: "-2.4s" }}
      />

      <circle cx="250" cy="278" r="2" fill="#7FCCC1" opacity="0.5" />
      <circle cx="470" cy="272" r="2" fill="#7FCCC1" opacity="0.5" />
    </g>

    {/* Network labels */}
    <g
      fill="#94A3B8"
      opacity="0.55"
      style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: 2 }}
    >
      <text x="150" y="94" textAnchor="middle">
        ORIGIN
      </text>
      <text x="596" y="150" textAnchor="middle">
        PORT
      </text>
      <text x="712" y="50" textAnchor="middle">
        DESTINATION
      </text>
    </g>

    {/* Horizon + water */}
    <line x1="0" y1="430" x2="760" y2="430" stroke="#FFFFFF" strokeOpacity="0.07" />
    <rect x="0" y="430" width="760" height="110" fill="url(#authWater)" />
    <path
      d="M0 448 Q 28 441 56 448 T 112 448 T 168 448 T 224 448 T 280 448 T 336 448 T 392 448 T 448 448 T 504 448 T 560 448 T 616 448 T 672 448 T 728 448 T 760 448"
      fill="none"
      stroke="#4CB0A2"
      strokeOpacity="0.16"
      strokeWidth="1.4"
    />
    <path
      d="M0 478 Q 34 470 68 478 T 136 478 T 204 478 T 272 478 T 340 478 T 408 478 T 476 478 T 544 478 T 612 478 T 680 478 T 748 478 T 760 478"
      fill="none"
      stroke="#7FCCC1"
      strokeOpacity="0.09"
      strokeWidth="1.4"
    />
    <path
      d="M0 512 Q 40 504 80 512 T 160 512 T 240 512 T 320 512 T 400 512 T 480 512 T 560 512 T 640 512 T 720 512 T 760 512"
      fill="none"
      stroke="#4CB0A2"
      strokeOpacity="0.07"
      strokeWidth="1.4"
    />

    {/* Back gantry crane (dim, far side) */}
    <g fill="none" stroke="#94A3B8" strokeOpacity="0.28" strokeWidth="3">
      <path d="M520 252 V 430" />
      <path d="M588 252 V 430" />
      <path d="M520 252 H 688" />
      <path d="M528 296 H 580" strokeOpacity="0.18" />
    </g>
    <rect x="652" y="254" width="9" height="10" fill="#94A3B8" opacity="0.28" />
    <path d="M656.5 264 V 336" stroke="#94A3B8" strokeOpacity="0.3" strokeWidth="1.4" />

    {/* Front gantry crane — legs behind the stacks */}
    <g fill="none" stroke="#CBD5E1" strokeOpacity="0.35" strokeWidth="3">
      <path d="M96 280 V 430" />
      <path d="M176 280 V 430" />
      <path d="M96 280 H 336" />
      <path d="M106 316 H 166" strokeOpacity="0.2" />
    </g>

    {/* Container stacks */}
    {renderStacks()}

    {/* Front crane trolley + cables over the stacks */}
    <rect x="299" y="282" width="9" height="10" fill="#CBD5E1" opacity="0.35" />
    <path d="M303.5 292 V 368" stroke="#CBD5E1" strokeOpacity="0.35" strokeWidth="1.4" />

    {/* Ship at berth */}
    <g>
      <path
        d="M430 402 L 742 402 L 756 434 Q 755 444 738 444 L 434 444 Q 420 444 418 434 Z"
        fill="#16243F"
        stroke="#33415E"
        strokeOpacity="0.5"
        strokeWidth="1.2"
      />
      {Array.from({ length: 2 }).map((_, row) =>
        Array.from({ length: 5 }).map((_, col) => (
          <rect
            key={`ship-${row}-${col}`}
            x={452 + col * 50}
            y={382 - row * 18}
            width={46}
            height={16}
            rx={1.5}
            fill={SHIP_CONTAINER_COLORS[(row + col) % SHIP_CONTAINER_COLORS.length]}
          />
        ))
      )}
      <rect x="700" y="352" width="30" height="50" fill="#1B2A4A" />
      <path d="M715 352 V 300" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="2" />
      <circle cx="715" cy="296" r="3" fill="#4CB0A2" opacity="0.8" />
    </g>
  </svg>
);

export default AuthVisual;
