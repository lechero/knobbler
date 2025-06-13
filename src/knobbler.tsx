import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';

interface KnobblerProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  tickStep?: number;
  precisionStep?: number;
  precisionDistance?: number;
  precisionSteps?: number[];
  deadzone?: number;
  startAngle?: number;
  arcLength?: number;
  diameter?: number;
  trackColor?: string;
  activeColor?: string;
  thumbColor?: string;
  children?: React.ReactNode;
}

export const Knobbler: React.FC<KnobblerProps> = ({
  value,
  onChange,
  min = 0,
  max = 12,
  tickStep = 1,
  precisionStep = 0.1,
  precisionDistance = 30,
  precisionSteps,
  deadzone = 15,
  startAngle = -90,
  arcLength = 360,
  diameter = 150,
  trackColor = '#e5e7eb',
  activeColor = '#4f46e5',
  thumbColor = '#ffffff',
  children,
}) => {
  const radius = diameter / 2;
  const padding = 4;
  const effectiveRadius = radius - padding;
  const center = { x: radius, y: radius };
  const innerR = effectiveRadius - 5;

  const round = (n: number) => parseFloat(n.toFixed(3));

  const [isDragging, setDragging] = useState(false);
  const [currentBand, setCurrentBand] = useState<number | null>(null);
  const [isFocused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const angleForValue = useCallback(
    (val: number) => startAngle + ((val - min) / (max - min)) * arcLength,
    [min, max, startAngle, arcLength]
  );

  const steps = precisionSteps && precisionSteps.length > 0 ? precisionSteps : [precisionStep];
  const decimals = Math.max(...steps.map(s => s.toString().split('.')[1]?.length || 0));
  const bands = steps.length;
  const maxRange = Math.max(innerR - deadzone, 0);
  const bandWidth = bands > 0 ? maxRange / bands : 0;

  const motionValue = useMotionValue(value);
  const [currentAngle, setCurrentAngle] = useState(() => angleForValue(value));
  useEffect(() => {
    animate(motionValue, value, { type: 'spring', stiffness: 300, damping: 30 });
    const unsub = motionValue.on('change', v => setCurrentAngle(angleForValue(v)));
    return unsub;
  }, [value, motionValue, angleForValue]);

  const valueFromPoint = useCallback(
    (x: number, y: number) => {
      const dx = x - center.x, dy = y - center.y;
      const dist = Math.hypot(dx, dy);
      if (dist < deadzone) return value;
      let ang = (Math.atan2(dy, dx) * 180) / Math.PI;
      if (ang < 0) ang += 360;
      let rel = (ang - startAngle + 360) % 360;
      if (rel > arcLength) rel = arcLength;
      const raw = min + (rel / arcLength) * (max - min);
      let stepSize = tickStep;
      if (precisionSteps && precisionSteps.length) {
        const idx = Math.min(bands - 1, Math.floor((dist - deadzone) / bandWidth));
        stepSize = steps[idx];
      } else {
        stepSize = dist > precisionDistance ? precisionStep : tickStep;
      }
      const snapped = Math.round(raw / stepSize) * stepSize;
      return parseFloat(snapped.toFixed(decimals));
    },
    [center, deadzone, startAngle, arcLength, min, max, tickStep, precisionStep, precisionDistance,
      precisionSteps, steps, bands, bandWidth, decimals, value]
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      const dist = Math.hypot(x - center.x, y - center.y);
      if (precisionSteps && precisionSteps.length) {
        const idx = Math.min(bands - 1, Math.floor((dist - deadzone) / bandWidth));
        setCurrentBand(idx);
      }
      onChange(valueFromPoint(x, y));
    }, [onChange, valueFromPoint, center, deadzone, bands, bandWidth, precisionSteps]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(false);
    setCurrentBand(null);
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  }, [handlePointerMove]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isFocused) return;
    let delta = 0;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') delta = tickStep;
    if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') delta = -tickStep;
    if (e.shiftKey) delta = delta > 0 ? precisionStep : -precisionStep;
    if (delta) {
      e.preventDefault();
      const next = parseFloat((Math.min(max, Math.max(min, value + delta))).toFixed(decimals));
      onChange(next);
    }
  }, [isFocused, tickStep, precisionStep, min, max, value, decimals, onChange]);

  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (currentAngle * Math.PI) / 180;
  const relSweep = (currentAngle - startAngle + 360) % 360;
  const largeArc = relSweep > 180 ? 1 : 0;

  const arcD =
    `M ${round(center.x + innerR * Math.cos(startRad))} ${round(center.y + innerR * Math.sin(startRad))}` +
    ` A ${round(innerR)} ${round(innerR)} 0 ${largeArc} 1 ` +
    `${round(center.x + innerR * Math.cos(endRad))} ${round(center.y + innerR * Math.sin(endRad))}`;

  const pathLength = (motionValue.get() - min) / (max - min);

  const ticks: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let v = min; v <= max; v += tickStep) {
    const ang = angleForValue(v) * (Math.PI / 180);
    ticks.push({
      x1: round(center.x + (innerR - 5) * Math.cos(ang)),
      y1: round(center.y + (innerR - 5) * Math.sin(ang)),
      x2: round(center.x + innerR * Math.cos(ang)),
      y2: round(center.y + innerR * Math.sin(ang))
    });
  }

  return (
    <div
      ref={containerRef}
      className="inline-block relative"
      style={{ width: diameter, height: diameter }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onPointerDown={handlePointerDown}
    >
      <svg width={diameter} height={diameter}>
        {/* Base track */}
        <circle cx={center.x} cy={center.y} r={innerR} stroke={trackColor} strokeWidth={10} fill="none" />

        {/* Line borders for bands */}
        {isDragging && precisionSteps && currentBand !== null && (() => {
          const rBorder = round(deadzone + (currentBand + 0.2) * bandWidth);
          if (rBorder <= 0) return null;
          return <circle cx={center.x} cy={center.y} r={rBorder} stroke={trackColor} strokeWidth={1} fill="none" />;
        })()}

        {/* Main arc */}
        <motion.path d={arcD} stroke={activeColor} strokeWidth={10} fill="none" style={{ pathLength }} initial={false} />

        {/* Filled precision bands */}
        {isDragging && precisionSteps && currentBand !== null && Array.from({ length: currentBand + 1 }, (_, i) => {
          const r_i = round(deadzone + (i + 0.5) * bandWidth);
          if (r_i <= 0) return null;
          const sx = center.x + r_i * Math.cos(startRad);
          const sy = center.y + r_i * Math.sin(startRad);
          const ex = center.x + r_i * Math.cos(endRad);
          const ey = center.y + r_i * Math.sin(endRad);
          const d_i = `M ${round(sx)} ${round(sy)} A ${round(r_i)} ${round(r_i)} 0 ${largeArc} 1 ${round(ex)} ${round(ey)}`;
          return <motion.path key={i} d={d_i} stroke={activeColor} strokeWidth={bandWidth + 0.2} fill="none" style={{ pathLength }} initial={false} />;
        })}

        {/* Ticks */}
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={trackColor} strokeWidth={2} />
        ))}

        {/* Thumb */}
        <motion.circle
          cx={round(center.x + innerR * Math.cos(endRad))}
          cy={round(center.y + innerR * Math.sin(endRad))}
          r={8}
          fill={thumbColor}
          stroke={activeColor}
          strokeWidth={2}
          initial={false}
          animate={{}}
        />
      </svg>

      {/* Centered children overlay */}
      {children && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {children}
        </div>
      )}
    </div>
  );
};

export default Knobbler;
