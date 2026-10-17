import React, { useState } from 'react';
import { Hash, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';

interface NumberLineActivityProps {
  onComplete?: () => void;
  isAlreadyCompleted?: boolean;
}

export function NumberLineActivity({ onComplete, isAlreadyCompleted }: NumberLineActivityProps) {
  const [position, setPosition] = useState(0.75); // 3/4
  const [divisionMode, setDivisionMode] = useState<number>(4); // quarters
  const [hasCompleted, setHasCompleted] = useState(Boolean(isAlreadyCompleted));

  const target = 0.75; // 3/4
  const isMatch = Math.abs(position - target) < 0.05;

  const handleConfirm = () => {
    if (isMatch && !hasCompleted) {
      setHasCompleted(true);
      if (onComplete) onComplete();
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold tracking-wide uppercase">
            <Hash className="w-4 h-4" />
            <span>Number Systems Explorer</span>
          </div>
          <h3 className="text-xl font-bold text-white mt-1">
            Representation of Rational Numbers on the Number Line
          </h3>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Locate the rational fraction <span className="font-mono font-bold text-cyan-300">3/4</span> by subdividing the unit interval into equal divisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Subdivisions:</span>
          {[2, 4, 8].map((div) => (
            <button
              key={div}
              onClick={() => setDivisionMode(div)}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-lg border transition-all ${
                divisionMode === div
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              1/{div}s
            </button>
          ))}
        </div>
      </div>

      <div className="my-8 bg-slate-950/70 p-8 rounded-xl border border-slate-800 flex flex-col items-center">
        {/* Number Line Graphic */}
        <div className="w-full max-w-2xl relative select-none py-6">
          {/* Main Axis Line */}
          <div className="w-full h-1 bg-slate-400 relative rounded">
            {/* Arrowheads */}
            <div className="absolute -left-2 -top-1.5 w-0 h-0 border-y-4 border-y-transparent border-r-8 border-r-slate-400" />
            <div className="absolute -right-2 -top-1.5 w-0 h-0 border-y-4 border-y-transparent border-l-8 border-l-slate-400" />
          </div>

          {/* Major Integers: -1, 0, 1, 2 */}
          {[-1, 0, 1, 2].map((val) => {
            const leftPercent = ((val + 1) / 3) * 100;
            return (
              <div
                key={val}
                className="absolute top-3 -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${leftPercent}%` }}
              >
                <div className="w-0.5 h-6 bg-white" />
                <span className="text-sm font-bold text-white mt-1 font-mono">{val}</span>
              </div>
            );
          })}

          {/* Subdivisions between 0 and 1 */}
          {Array.from({ length: divisionMode - 1 }).map((_, i) => {
            const stepFraction = (i + 1) / divisionMode;
            // 0 is at 33.33%, 1 is at 66.67%
            const leftPercent = ((stepFraction + 1) / 3) * 100;
            return (
              <div
                key={i}
                className="absolute top-4 -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${leftPercent}%` }}
              >
                <div className="w-0.5 h-4 bg-cyan-400/80" />
                <span className="text-[10px] text-cyan-300 font-mono mt-1 font-semibold">
                  {i + 1}/{divisionMode}
                </span>
              </div>
            );
          })}

          {/* Draggable Marker */}
          <div
            className="absolute top-0 -translate-x-1/2 flex flex-col items-center cursor-pointer"
            style={{ left: `${((position + 1) / 3) * 100}%` }}
          >
            <div className="w-4 h-4 rounded-full bg-cyan-400 ring-4 ring-cyan-500/30 shadow-lg" />
            <div className="w-0.5 h-8 bg-cyan-400" />
          </div>
        </div>

        {/* Position Slider */}
        <div className="w-full max-w-md mt-6 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Current Position:</span>
            <span className="font-mono font-bold text-cyan-300">
              {position.toFixed(2)} (≈ {Math.round(position * divisionMode)}/{divisionMode})
            </span>
          </div>
          <input
            type="range"
            min="-1"
            max="2"
            step={1 / divisionMode}
            value={position}
            onChange={(e) => setPosition(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        <button
          onClick={handleConfirm}
          className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Confirm Position 3/4</span>
        </button>

        {hasCompleted && (
          <div className="mt-4 flex items-center gap-2 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Target Rational Number 3/4 Verified! (+20% Progress)</span>
          </div>
        )}
      </div>
    </div>
  );
}
