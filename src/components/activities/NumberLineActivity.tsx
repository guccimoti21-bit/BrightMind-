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
    <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#EDF2F7]">
        <div>
          <div className="flex items-center gap-2 text-[#2563EB] text-xs font-semibold tracking-wide uppercase">
            <Hash className="w-4 h-4" />
            <span>Number Systems Explorer</span>
          </div>
          <h3 className="text-xl font-bold text-[#111827] mt-1">
            Representation of Rational Numbers on the Number Line
          </h3>
          <p className="text-sm text-[#475569] mt-1 max-w-2xl">
            Locate the rational fraction <span className="font-mono font-bold text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.5 rounded border border-[#BFDBFE]">3/4</span> by subdividing the unit interval into equal divisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#64748B]">Subdivisions:</span>
          {[2, 4, 8].map((div) => (
            <button
              key={div}
              onClick={() => setDivisionMode(div)}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                divisionMode === div
                  ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-sm'
                  : 'bg-[#FFFFFF] border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5FF] hover:text-[#111827]'
              }`}
            >
              1/{div}s
            </button>
          ))}
        </div>
      </div>

      <div className="my-8 bg-[#F8FAFF] p-8 rounded-xl border border-[#E2E8F0] flex flex-col items-center">
        {/* Number Line Graphic */}
        <div className="w-full max-w-2xl relative select-none py-6">
          {/* Main Axis Line */}
          <div className="w-full h-1 bg-[#94A3B8] relative rounded">
            {/* Arrowheads */}
            <div className="absolute -left-2 -top-1.5 w-0 h-0 border-y-4 border-y-transparent border-r-8 border-r-[#94A3B8]" />
            <div className="absolute -right-2 -top-1.5 w-0 h-0 border-y-4 border-y-transparent border-l-8 border-l-[#94A3B8]" />
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
                <div className="w-0.5 h-6 bg-[#111827]" />
                <span className="text-sm font-bold text-[#111827] mt-1 font-mono">{val}</span>
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
                <div className="w-0.5 h-4 bg-[#2563EB]" />
                <span className="text-[10px] text-[#2563EB] font-mono mt-1 font-bold">
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
            <div className="w-4 h-4 rounded-full bg-[#2563EB] ring-4 ring-[#BFDBFE] shadow-md" />
            <div className="w-0.5 h-8 bg-[#2563EB]" />
          </div>
        </div>

        {/* Position Slider */}
        <div className="w-full max-w-md mt-6 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-[#64748B]">Current Position:</span>
            <span className="font-mono font-bold text-[#2563EB]">
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
            className="w-full accent-[#2563EB] h-2 bg-[#E2E8F0] rounded-lg cursor-pointer"
          />
        </div>

        <button
          onClick={handleConfirm}
          className="btn-primary mt-6 px-6 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Confirm Position 3/4</span>
        </button>

        {hasCompleted && (
          <div className="mt-4 flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Target Rational Number 3/4 Verified! (+20% Progress)</span>
          </div>
        )}
      </div>
    </div>
  );
}
