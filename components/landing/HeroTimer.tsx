import dynamic from "next/dynamic";

const HeroTimerInteractive = dynamic(() => import("./HeroTimerInteractive"), {
  ssr: false,
  loading: () => <HeroTimerStatic />,
});

// Static SVG shell — rendered server-side, visible immediately (no JS needed)
// Matches the interactive version exactly: size=200, strokeWidth=8, progress=0
function HeroTimerStatic() {
  const size = 200;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="absolute inset-0 -rotate-90" aria-hidden="true">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200 dark:text-gray-800"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#4f46e5"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
          />
        </svg>
        <div className="relative z-10 flex flex-col items-center justify-center">
          <span className="text-4xl font-medium tabular-nums tracking-tight text-gray-900 dark:text-white">
            25:00
          </span>
          <span className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            Deep Work
          </span>
        </div>
      </div>
      <button
        disabled
        className="px-8 py-2.5 rounded-xl font-medium text-sm bg-indigo-600 text-white shadow-sm opacity-90"
      >
        Try it live
      </button>
    </div>
  );
}

export default function HeroTimer() {
  return <HeroTimerInteractive />;
}
