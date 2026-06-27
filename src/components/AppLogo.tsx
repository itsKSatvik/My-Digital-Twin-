import React from 'react';

interface AppLogoProps {
  className?: string;
}

export default function AppLogo({ className = "w-8 h-8" }: AppLogoProps) {
  return (
    <svg 
      viewBox="0 0 512 512" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} select-none`}
    >
      <defs>
        {/* Background Gradients */}
        <radialGradient id="bg-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1E293B" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="cyber-cyan-purple" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" /> {/* Cyan */}
          <stop offset="50%" stopColor="#60A5FA" /> {/* Blue */}
          <stop offset="100%" stopColor="#C084FC" /> {/* Purple */}
        </linearGradient>

        <linearGradient id="split-line-grad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#818CF8" stopOpacity="0.2" />
        </linearGradient>

        {/* Glow Filters for Neon effect */}
        <filter id="neon-glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur1" />
          <feGaussianBlur stdDeviation="16" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="neon-glow-purple" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Main Container Frame with rounded corners */}
      <rect width="512" height="512" rx="120" fill="#020617" stroke="#38BDF8" strokeOpacity="0.15" strokeWidth="2" />
      <rect width="508" height="508" x="2" y="2" rx="118" fill="url(#bg-glow)" />

      {/* Cybernetic Head Outer Silhouette Group */}
      <g>
        {/* Left Side (Organic Biological) Face Silhouette */}
        <path 
          d="M256 100 C180 100 135 150 135 240 C135 300 120 310 120 330 C120 355 140 355 145 355 C150 380 170 410 256 410" 
          fill="#0B132B" 
          fillOpacity="0.6"
          stroke="#38BDF8" 
          strokeWidth="3.5" 
          strokeLinecap="round"
          strokeDasharray="1000"
          strokeDashoffset="0"
          className="opacity-90"
        />

        {/* Right Side (Cybernetic Machine) Face Silhouette */}
        <path 
          d="M256 100 C332 100 377 150 377 240 C377 300 392 310 392 330 C392 355 372 355 367 355 C362 380 342 410 256 410" 
          fill="#1E1E38" 
          fillOpacity="0.5"
          stroke="#6366F1" 
          strokeWidth="3.5" 
          strokeLinecap="round"
        />
      </g>

      {/* Left Ear */}
      <path 
        d="M135 235 C115 235 110 265 125 280" 
        stroke="#38BDF8" 
        strokeWidth="3" 
        strokeLinecap="round" 
        fill="#0B132B"
      />

      {/* Right Ear */}
      <path 
        d="M377 235 C397 235 402 265 387 280" 
        stroke="#6366F1" 
        strokeWidth="3" 
        strokeLinecap="round" 
        fill="#1E1E38"
      />

      {/* Perfectly Vertical Split Partition Line */}
      <line 
        x1="256" 
        y1="90" 
        x2="256" 
        y2="420" 
        stroke="url(#split-line-grad)" 
        strokeWidth="5" 
        strokeLinecap="round"
        filter="url(#neon-glow-cyan)"
      />

      {/* LEFT SIDE FEATURES: Calm Closed Eye */}
      <path 
        d="M165 240 C175 252 210 252 220 240" 
        stroke="#38BDF8" 
        strokeWidth="5" 
        strokeLinecap="round" 
        filter="url(#neon-glow-cyan)"
      />
      <path 
        d="M175 210 C185 205 205 205 215 210" 
        stroke="#38BDF8" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeOpacity="0.5"
      />

      {/* RIGHT SIDE FEATURES: Cybernetic Circuits & Neural Traces */}
      {/* Central horizontal eye-level connector */}
      <path 
        d="M256 240 H285 L300 220 H345 L360 200" 
        stroke="#38BDF8" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        filter="url(#neon-glow-cyan)"
      />
      {/* Central Eye-node */}
      <circle cx="315" cy="220" r="12" fill="#020617" stroke="#38BDF8" strokeWidth="4" filter="url(#neon-glow-cyan)" />
      <circle cx="315" cy="220" r="4" fill="#38BDF8" />

      {/* Circuit Trace 1: Top Right Forehead */}
      <path 
        d="M256 160 H295 L310 130 H340" 
        stroke="#38BDF8" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <circle cx="340" cy="130" r="6" fill="#38BDF8" />

      {/* Circuit Trace 2: Mid Right Cheek */}
      <path 
        d="M256 290 H280 L300 320 H345 L360 350" 
        stroke="#818CF8" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <circle cx="360" cy="350" r="7" fill="#818CF8" />

      {/* Circuit Trace 3: Lower Right Chin */}
      <path 
        d="M256 360 H280 L295 390 H320" 
        stroke="#C084FC" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <circle cx="320" cy="390" r="5" fill="#C084FC" filter="url(#neon-glow-purple)" />

      {/* Vertical circuit line on right edge */}
      <path 
        d="M345 160 V260 L365 290 V330" 
        stroke="#6366F1" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        strokeOpacity="0.7"
      />
      <circle cx="345" cy="160" r="4" fill="#6366F1" />

      {/* Cybernetic nodes glow accents */}
      <circle cx="300" cy="130" r="3" fill="#38BDF8" opacity="0.8" />
      <circle cx="280" cy="320" r="3" fill="#818CF8" opacity="0.8" />
    </svg>
  );
}
