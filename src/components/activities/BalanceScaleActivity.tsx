import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, CheckCircle2, ArrowRight, Sparkles, Scale, Info, Plus, Minus, Divide } from 'lucide-react';

interface BalanceScaleActivityProps {
  onComplete?: () => void;
  isAlreadyCompleted?: boolean;
}

interface EquationPreset {
  id: string;
  name: string;
  latex: string;
  initialX: number; // e.g. 2 for 2x
  initialLeftConstants: number; // e.g. 3
  initialRightConstants: number; // e.g. 11
  trueXValue: number; // 4
}

const PRESETS: EquationPreset[] = [
  {
    id: 'eq1',
    name: 'Class 8 Primary Demo: 2x + 3 = 11',
    latex: '2x + 3 = 11',
    initialX: 2,
    initialLeftConstants: 3,
    initialRightConstants: 11,
    trueXValue: 4
  },
  {
    id: 'eq2',
    name: 'Standard Challenge: 3x + 4 = 19',
    latex: '3x + 4 = 19',
    initialX: 3,
    initialLeftConstants: 4,
    initialRightConstants: 19,
    trueXValue: 5
  },
  {
    id: 'eq3',
    name: 'Single Variable: x + 7 = 15',
    latex: 'x + 7 = 15',
    initialX: 1,
    initialLeftConstants: 7,
    initialRightConstants: 15,
    trueXValue: 8
  }
];

export function BalanceScaleActivity({ onComplete, isAlreadyCompleted }: BalanceScaleActivityProps) {
  const [selectedPreset, setSelectedPreset] = useState<EquationPreset>(PRESETS[0]);
  const [leftXCount, setLeftXCount] = useState(selectedPreset.initialX);
  const [leftConstants, setLeftConstants] = useState(selectedPreset.initialLeftConstants);
  const [rightXCount, setRightXCount] = useState(0);
  const [rightConstants, setRightConstants] = useState(selectedPreset.initialRightConstants);
  const [stepsLog, setStepsLog] = useState<string[]>([
    'Scale initialized with balanced equation: ' + selectedPreset.latex
  ]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(Boolean(isAlreadyCompleted));

  // Reset to current preset
  const handleResetPreset = (preset: EquationPreset) => {
    setSelectedPreset(preset);
    setLeftXCount(preset.initialX);
    setLeftConstants(preset.initialLeftConstants);
    setRightXCount(0);
    setRightConstants(preset.initialRightConstants);
    setStepsLog(['Scale initialized with balanced equation: ' + preset.latex]);
    setShowCelebration(false);
  };

  // Compute effective weight in each pan using trueXValue
  const leftTotalWeight = leftXCount * selectedPreset.trueXValue + leftConstants;
  const rightTotalWeight = rightXCount * selectedPreset.trueXValue + rightConstants;

  // Beam tilt angle: positive tilts right down, negative tilts left down
  // clamped between -14deg and +14deg
  const weightDiff = rightTotalWeight - leftTotalWeight;
  const tiltAngle = Math.max(-14, Math.min(14, weightDiff * 1.5));
  const isBalanced = leftTotalWeight === rightTotalWeight;

  // Check if variable x is successfully isolated
  const isSolved = isBalanced && leftXCount === 1 && leftConstants === 0 && rightXCount === 0;

  // Perform balanced operation on BOTH sides
  const applyOperationBothSides = (operation: 'subtract-constant' | 'add-constant' | 'divide', value: number) => {
    if (operation === 'subtract-constant') {
      if (leftConstants < value || rightConstants < value) {
        setStepsLog((prev) => [
          ...prev,
          `⚠️ Cannot subtract ${value} because one pan has fewer constants.`
        ]);
        return;
      }
      setLeftConstants((prev) => prev - value);
      setRightConstants((prev) => prev - value);
      const newLeft = `${leftXCount > 0 ? (leftXCount === 1 ? 'x' : `${leftXCount}x`) : ''}${leftConstants - value > 0 ? ` + ${leftConstants - value}` : ''}`;
      const newRight = `${rightConstants - value}`;
      const logEntry = `Subtracted ${value} from BOTH pans → ${newLeft || '0'} = ${newRight}`;
      setStepsLog((prev) => [...prev, logEntry]);
    } else if (operation === 'add-constant') {
      setLeftConstants((prev) => prev + value);
      setRightConstants((prev) => prev + value);
      setStepsLog((prev) => [
        ...prev,
        `Added ${value} to BOTH pans → Preserved balance.`
      ]);
    } else if (operation === 'divide') {
      if (value <= 0) return;
      if (leftXCount % value !== 0 || rightConstants % value !== 0) {
        setStepsLog((prev) => [
          ...prev,
          `⚠️ Division by ${value} produces non-integer blocks. Ensure all terms are divisible by ${value}.`
        ]);
        return;
      }
      const newX = leftXCount / value;
      const newConst = rightConstants / value;
      setLeftXCount(newX);
      setRightConstants(newConst);
      const logEntry = `Divided BOTH pans by ${value} → ${newX === 1 ? 'x' : `${newX}x`} = ${newConst}`;
      setStepsLog((prev) => [...prev, logEntry]);

      if (newX === 1 && newConst === selectedPreset.trueXValue) {
        setShowCelebration(true);
        setHasCompleted(true);
        if (onComplete) onComplete();
      }
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      {/* Header and Preset Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold tracking-wide uppercase">
            <Scale className="w-4 h-4" />
            <span>Virtual Physics &amp; Algebra Laboratory</span>
          </div>
          <h3 className="text-xl font-bold text-white mt-1">
            The Balance Scale Method: Solving Linear Equations
          </h3>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Equality is an unbroken balance. Apply inverse operations to <strong>both sides</strong> to isolate the unknown block <span className="font-mono text-cyan-300 font-bold">x</span>.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleResetPreset(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                selectedPreset.id === p.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {p.latex}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Sandbox Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Interactive Scale Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950/60 rounded-xl border border-slate-800 p-6 flex flex-col justify-between relative overflow-hidden min-h-[420px]">
          {/* Subtle Grid Canvas Background */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }}
          />

          {/* Top Status & Equation Representation */}
          <div className="flex items-center justify-between z-10">
            <div className="bg-slate-900/90 border border-slate-700/80 px-4 py-2 rounded-xl flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium">Current Equation:</span>
              <span className="text-lg font-mono font-bold text-cyan-300">
                {leftXCount > 0 ? (leftXCount === 1 ? 'x' : `${leftXCount}x`) : '0'}
                {leftConstants > 0 ? ` + ${leftConstants}` : ''}
                {' = '}
                {rightConstants}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border ${
                  isBalanced
                    ? 'bg-emerald-950/80 border-emerald-600/60 text-emerald-300'
                    : 'bg-amber-950/80 border-amber-600/60 text-amber-300'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isBalanced ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <span>{isBalanced ? 'IN EQUILIBRIUM (BALANCED)' : 'UNBALANCED TILT'}</span>
              </div>

              <button
                onClick={() => handleResetPreset(selectedPreset)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
                title="Reset Equation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* PHYSICAL BALANCE SCALE SVG / MOTION RIG */}
          <div className="py-8 flex flex-col items-center justify-center relative select-none">
            {/* The Tilting Beam Assembly */}
            <motion.div
              animate={{ rotate: tiltAngle }}
              transition={{ type: 'spring', stiffness: 120, damping: 14 }}
              className="w-full max-w-lg relative flex items-center justify-center"
              style={{ transformOrigin: 'center center' }}
            >
              {/* Horizontal Beam Bar */}
              <div className="w-full h-3 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 rounded-full shadow-lg relative border border-amber-300/40">
                {/* Center Pivot Jewel */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center shadow-md">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                </div>

                {/* Left Pan Suspension Cord */}
                <div className="absolute left-6 top-3 w-0.5 h-20 bg-slate-400/80 origin-top flex flex-col items-center">
                  <div className="w-40 -ml-20 mt-20 relative">
                    {/* Left Pan Dish */}
                    <div className="w-40 h-8 rounded-b-full bg-gradient-to-b from-slate-700 to-slate-900 border-2 border-slate-500 shadow-xl flex items-center justify-center relative">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 font-bold">
                        Left Pan (LHS)
                      </span>
                    </div>

                    {/* Left Pan Contents (Blocks & Weights stacked inside dish) */}
                    <div className="absolute bottom-8 left-0 right-0 flex flex-wrap-reverse items-center justify-center gap-1.5 p-1 max-h-36 overflow-visible pointer-events-none">
                      {/* Variable X Cubes */}
                      {Array.from({ length: leftXCount }).map((_, i) => (
                        <motion.div
                          key={`left-x-${i}`}
                          initial={{ scale: 0.5, y: -10 }}
                          animate={{ scale: 1, y: 0 }}
                          className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 border border-cyan-300 shadow-md flex items-center justify-center text-white font-mono font-bold text-sm"
                        >
                          x
                        </motion.div>
                      ))}

                      {/* Unit Weights */}
                      {Array.from({ length: leftConstants }).map((_, i) => (
                        <motion.div
                          key={`left-c-${i}`}
                          initial={{ scale: 0.5, y: -10 }}
                          animate={{ scale: 1, y: 0 }}
                          className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-purple-700 border border-purple-300 shadow-sm flex items-center justify-center text-white font-mono text-[10px] font-bold"
                        >
                          1
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Pan Suspension Cord */}
                <div className="absolute right-6 top-3 w-0.5 h-20 bg-slate-400/80 origin-top flex flex-col items-center">
                  <div className="w-40 -mr-20 mt-20 relative">
                    {/* Right Pan Dish */}
                    <div className="w-40 h-8 rounded-b-full bg-gradient-to-b from-slate-700 to-slate-900 border-2 border-slate-500 shadow-xl flex items-center justify-center relative">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 font-bold">
                        Right Pan (RHS)
                      </span>
                    </div>

                    {/* Right Pan Contents */}
                    <div className="absolute bottom-8 left-0 right-0 flex flex-wrap-reverse items-center justify-center gap-1.5 p-1 max-h-36 overflow-visible pointer-events-none">
                      {/* Unit Weights on Right Pan */}
                      {Array.from({ length: rightConstants }).map((_, i) => (
                        <motion.div
                          key={`right-c-${i}`}
                          initial={{ scale: 0.5, y: -10 }}
                          animate={{ scale: 1, y: 0 }}
                          className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-purple-700 border border-purple-300 shadow-sm flex items-center justify-center text-white font-mono text-[10px] font-bold"
                        >
                          1
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Fulcrum Stand Pillar */}
            <div className="w-8 h-28 bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800 rounded-t-md border-x border-slate-500 mt-2 relative z-0 flex flex-col items-center">
              {/* Level Needle Indicator */}
              <motion.div
                animate={{ rotate: tiltAngle }}
                className="w-1 h-12 bg-red-500 origin-top rounded-full shadow-sm -mt-2"
              />
              <div className="mt-auto mb-2 w-4 h-4 rounded-full bg-slate-900 border border-slate-600" />
            </div>

            {/* Heavy Base Plate */}
            <div className="w-52 h-5 rounded-md bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-t border-slate-500 shadow-2xl relative z-0 flex items-center justify-center">
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">
                Fulcrum Support
              </span>
            </div>
          </div>

          {/* Solved Celebration Toast */}
          <AnimatePresence>
            {isSolved && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="bg-emerald-950/95 border-2 border-emerald-500 p-4 rounded-xl flex items-center justify-between gap-4 z-20 shadow-2xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-emerald-300 font-bold text-sm">
                      Outstanding! Variable Isolated &amp; Scale Balanced!
                    </h4>
                    <p className="text-emerald-100 text-xs mt-0.5">
                      You solved <span className="font-mono font-bold text-white">x = {selectedPreset.trueXValue}</span> using pure inverse balance operations!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-300 font-semibold bg-emerald-900/60 px-3 py-1.5 rounded-lg border border-emerald-700/60">
                    +20% Completion Earned
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Pan Content Tally */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div className="flex items-center justify-between bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-800">
              <span className="text-slate-400">Left Pan Contents:</span>
              <span className="text-cyan-300 font-mono font-semibold">
                {leftXCount}x block{leftXCount !== 1 ? 's' : ''} + {leftConstants} unit{leftConstants !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center justify-between bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-800">
              <span className="text-slate-400">Right Pan Contents:</span>
              <span className="text-purple-300 font-mono font-semibold">
                {rightConstants} unit weights
              </span>
            </div>
          </div>
        </div>

        {/* Control Deck & Step Log (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Action Operations Deck */}
          <div className="bg-slate-950/70 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 text-white font-semibold text-sm mb-3">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Apply Balanced Operations</span>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Every action is applied simultaneously to <strong>both pans</strong> to preserve algebraic equality.
            </p>

            <div className="space-y-3">
              {/* Subtract Operation */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                  1. Undo Addition (Subtract from Both Sides)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    disabled={leftConstants < 1 || rightConstants < 1}
                    onClick={() => applyOperationBothSides('subtract-constant', 1)}
                    className="px-2.5 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <Minus className="w-3.5 h-3.5 text-cyan-400" />
                    <span>-1</span>
                  </button>
                  <button
                    disabled={leftConstants < selectedPreset.initialLeftConstants || rightConstants < selectedPreset.initialLeftConstants}
                    onClick={() => applyOperationBothSides('subtract-constant', selectedPreset.initialLeftConstants)}
                    className="px-2.5 py-2 text-xs font-semibold rounded-lg bg-blue-700/80 hover:bg-blue-600 text-white disabled:opacity-40 disabled:cursor-not-allowed border border-blue-500/60 transition-colors flex items-center justify-center gap-1 col-span-2"
                  >
                    <Minus className="w-3.5 h-3.5 text-cyan-300" />
                    <span>-{selectedPreset.initialLeftConstants} (All Constants)</span>
                  </button>
                </div>
              </div>

              {/* Divide Operation */}
              <div className="pt-2">
                <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                  2. Undo Multiplication (Divide Both Sides)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    disabled={leftXCount % 2 !== 0 || rightConstants % 2 !== 0}
                    onClick={() => applyOperationBothSides('divide', 2)}
                    className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Divide className="w-3.5 h-3.5 text-purple-400" />
                    <span>Divide by 2</span>
                  </button>
                  <button
                    disabled={leftXCount % 3 !== 0 || rightConstants % 3 !== 0}
                    onClick={() => applyOperationBothSides('divide', 3)}
                    className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Divide className="w-3.5 h-3.5 text-purple-400" />
                    <span>Divide by 3</span>
                  </button>
                </div>
              </div>

              {/* Add constant (for exploring undoing subtraction) */}
              <div className="pt-2">
                <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Optional: Add to Both Sides
                </label>
                <button
                  onClick={() => applyOperationBothSides('add-constant', 1)}
                  className="w-full px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Add +1 to Both Sides (Preserves Balance)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Real-Time Mathematical Step Log */}
          <div className="bg-slate-950/70 rounded-xl border border-slate-800 p-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Mathematical Step Log
              </span>
              <span className="text-[11px] font-mono text-cyan-400">
                {stepsLog.length} recorded
              </span>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-48 pr-1 flex-1 text-xs font-mono">
              {stepsLog.map((log, index) => (
                <div
                  key={index}
                  className="p-2 rounded bg-slate-900/80 border border-slate-800/80 text-slate-300 leading-relaxed"
                >
                  <span className="text-cyan-400 font-bold mr-1.5">{index + 1}.</span>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
