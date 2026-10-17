import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sun, CheckCircle2, RotateCcw, Eye, Compass, Sparkles } from 'lucide-react';

interface RayOpticsActivityProps {
  onComplete?: () => void;
  isAlreadyCompleted?: boolean;
}

export function RayOpticsActivity({ onComplete, isAlreadyCompleted }: RayOpticsActivityProps) {
  const [angleIncident, setAngleIncident] = useState(45);
  const [showProtractor, setShowProtractor] = useState(true);
  const [showNormal, setShowNormal] = useState(true);
  const [verifiedPoints, setVerifiedPoints] = useState<number[]>([45]);
  const [hasCompleted, setHasCompleted] = useState(Boolean(isAlreadyCompleted));

  const angleReflected = angleIncident;
  const glancingAngle = 90 - angleIncident;

  const handleVerifyCurrentAngle = () => {
    if (!verifiedPoints.includes(angleIncident)) {
      const updated = [...verifiedPoints, angleIncident];
      setVerifiedPoints(updated);
      if (updated.length >= 2 && !hasCompleted) {
        setHasCompleted(true);
        if (onComplete) onComplete();
      }
    }
  };

  // Geometry coordinates for SVG (Center point on mirror is (250, 220))
  const centerX = 250;
  const centerY = 220;
  const rayLength = 170;

  // Incident ray comes from top-left: angle from normal (vertical line going up)
  const incidentRad = (angleIncident * Math.PI) / 180;
  const incidentStartX = centerX - rayLength * Math.sin(incidentRad);
  const incidentStartY = centerY - rayLength * Math.cos(incidentRad);

  // Reflected ray goes towards top-right
  const reflectedEndX = centerX + rayLength * Math.sin(incidentRad);
  const reflectedEndY = centerY - rayLength * Math.cos(incidentRad);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold tracking-wide uppercase">
            <Sun className="w-4 h-4" />
            <span>Optics &amp; Wave Mechanics Sandbox</span>
          </div>
          <h3 className="text-xl font-bold text-white mt-1">
            Verification of the Laws of Reflection
          </h3>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Slide the incident beam angle and prove that the Angle of Incidence (∠i) precisely matches the Angle of Reflection (∠r).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowProtractor(!showProtractor)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              showProtractor
                ? 'bg-blue-600/80 border-blue-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5 inline mr-1" />
            {showProtractor ? 'Protractor Active' : 'Show Protractor'}
          </button>
          <button
            onClick={() => setAngleIncident(45)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
            title="Reset to 45°"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Ray Simulation SVG Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950/80 rounded-xl border border-slate-800 p-4 flex flex-col items-center justify-center relative min-h-[380px] overflow-hidden">
          {/* SVG Optics Bench */}
          <svg
            viewBox="0 0 500 300"
            className="w-full max-w-lg h-auto select-none"
          >
            {/* Protractor Arc Overlay */}
            {showProtractor && (
              <g opacity="0.35">
                <circle
                  cx={centerX}
                  cy={centerY}
                  r="130"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                {/* Degree tick marks every 15 deg */}
                {[0, 15, 30, 45, 60, 75].map((deg) => {
                  const rad = (deg * Math.PI) / 180;
                  const x1 = centerX - 125 * Math.sin(rad);
                  const y1 = centerY - 125 * Math.cos(rad);
                  const x2 = centerX + 125 * Math.sin(rad);
                  const y2 = centerY - 125 * Math.cos(rad);
                  return (
                    <g key={deg}>
                      <text x={x1 - 10} y={y1} fill="#94a3b8" fontSize="9" textAnchor="end">{deg}°</text>
                      <text x={x2 + 10} y={y2} fill="#94a3b8" fontSize="9" textAnchor="start">{deg}°</text>
                    </g>
                  );
                })}
              </g>
            )}

            {/* Mirror Surface at bottom (y = 220) */}
            <rect
              x="50"
              y={centerY}
              width="400"
              height="18"
              fill="url(#mirrorGradient)"
              stroke="#64748b"
              strokeWidth="2"
              rx="3"
            />
            {/* Mirror Polished Front Face Highlight */}
            <line
              x1="50"
              y1={centerY}
              x2="450"
              y2={centerY}
              stroke="#38bdf8"
              strokeWidth="2.5"
            />
            {/* Mirror Hatch Marks (silver backing) */}
            {Array.from({ length: 26 }).map((_, i) => (
              <line
                key={i}
                x1={60 + i * 15}
                y1={centerY + 4}
                x2={50 + i * 15}
                y2={centerY + 16}
                stroke="#475569"
                strokeWidth="1.5"
              />
            ))}
            <text x="250" y={centerY + 32} fill="#64748b" fontSize="10" textAnchor="middle" fontWeight="bold">
              POLISHED PLANE MIRROR
            </text>

            {/* Normal Line (Perpendicular at 90°) */}
            {showNormal && (
              <g>
                <line
                  x1={centerX}
                  y1="30"
                  x2={centerX}
                  y2={centerY}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                />
                <text x={centerX + 6} y="45" fill="#94a3b8" fontSize="11" fontWeight="bold">
                  Normal (90°)
                </text>
              </g>
            )}

            {/* Incident Light Ray (Yellow glowing line) */}
            <line
              x1={incidentStartX}
              y1={incidentStartY}
              x2={centerX}
              y2={centerY}
              stroke="#facc15"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Ray Direction Arrow */}
            <polygon
              points={`${centerX - 35 * Math.sin(incidentRad) - 4},${centerY - 35 * Math.cos(incidentRad) - 4} ${centerX - 25 * Math.sin(incidentRad)},${centerY - 25 * Math.cos(incidentRad)} ${centerX - 35 * Math.sin(incidentRad) + 4},${centerY - 35 * Math.cos(incidentRad) - 2}`}
              fill="#facc15"
            />

            {/* Reflected Light Ray (Cyan glowing line) */}
            <line
              x1={centerX}
              y1={centerY}
              x2={reflectedEndX}
              y2={reflectedEndY}
              stroke="#38bdf8"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <polygon
              points={`${centerX + 25 * Math.sin(incidentRad)},${centerY - 25 * Math.cos(incidentRad)} ${centerX + 35 * Math.sin(incidentRad) + 4},${centerY - 35 * Math.cos(incidentRad) - 4} ${centerX + 35 * Math.sin(incidentRad) - 4},${centerY - 35 * Math.cos(incidentRad) - 2}`}
              fill="#38bdf8"
            />

            {/* Point of Incidence Marker */}
            <circle cx={centerX} cy={centerY} r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
            <text x={centerX} y={centerY + 14} fill="#ef4444" fontSize="9" textAnchor="middle" fontWeight="bold">
              Point of Incidence (O)
            </text>

            {/* Angle Arcs */}
            <path
              d={`M ${centerX - 40 * Math.sin(incidentRad)} ${centerY - 40 * Math.cos(incidentRad)} A 40 40 0 0 1 ${centerX} ${centerY - 40}`}
              fill="none"
              stroke="#facc15"
              strokeWidth="2"
            />
            <text
              x={centerX - 20 * Math.sin(incidentRad / 2) - 10}
              y={centerY - 45 * Math.cos(incidentRad / 2)}
              fill="#facc15"
              fontSize="11"
              fontWeight="bold"
            >
              ∠i = {angleIncident}°
            </text>

            <path
              d={`M ${centerX} ${centerY - 40} A 40 40 0 0 1 ${centerX + 40 * Math.sin(incidentRad)} ${centerY - 40 * Math.cos(incidentRad)}`}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
            />
            <text
              x={centerX + 20 * Math.sin(incidentRad / 2) + 8}
              y={centerY - 45 * Math.cos(incidentRad / 2)}
              fill="#38bdf8"
              fontSize="11"
              fontWeight="bold"
            >
              ∠r = {angleReflected}°
            </text>

            {/* Definitions */}
            <defs>
              <linearGradient id="mirrorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Controls Deck (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-4">
          <div className="bg-slate-950/70 rounded-xl border border-slate-800 p-5">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Laser Incident Angle Control</span>
            </h4>

            {/* Angle Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Angle of Incidence (∠i):</span>
                <span className="font-mono font-bold text-cyan-300 text-sm">
                  {angleIncident}°
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="80"
                value={angleIncident}
                onChange={(e) => setAngleIncident(Number(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>5° (Near Normal)</span>
                <span>45°</span>
                <span>80° (Grazing)</span>
              </div>
            </div>

            {/* Real-time Math Proof */}
            <div className="mt-5 p-3.5 bg-slate-900/80 rounded-lg border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-yellow-400 font-medium">Incident Angle (∠i):</span>
                <span className="font-mono font-bold text-white">{angleIncident}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyan-400 font-medium">Reflected Angle (∠r):</span>
                <span className="font-mono font-bold text-white">{angleReflected}°</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800">
                <span className="text-slate-400">Glancing Angle (Mirror to ray):</span>
                <span className="font-mono text-slate-300">{glancingAngle}°</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Total Angular Separation:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {angleIncident + angleReflected}°
                </span>
              </div>
            </div>

            <button
              onClick={handleVerifyCurrentAngle}
              className="w-full mt-4 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Verify Law at {angleIncident}°</span>
            </button>
          </div>

          {/* Verification Badge */}
          <div className="bg-slate-950/70 rounded-xl border border-slate-800 p-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400">Tested Angles:</span>
              <span className="font-mono text-cyan-400 font-semibold">
                {verifiedPoints.length} verified
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {verifiedPoints.map((pt) => (
                <span
                  key={pt}
                  className="px-2 py-0.5 rounded bg-blue-950 border border-blue-700/60 text-blue-200 text-xs font-mono font-bold"
                >
                  {pt}°
                </span>
              ))}
            </div>
            {hasCompleted && (
              <div className="mt-3 flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>First Law of Reflection Confirmed! (+20% Progress)</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
