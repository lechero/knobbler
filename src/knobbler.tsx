import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';

export interface MediKnobblerProps {
  /** Current value */
  value: number;
  /** Change handler */
  onChange: (value: number) => void;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Coarse step size */
  tickStep?: number;
  /** Fine step size when shift key or beyond precisionDistance */
  precisionStep?: number;
  /** Distance threshold in px for switching to precisionStep */
  precisionDistance?: number;
  /** Optional array of precision steps per band */
  precisionSteps?: number[];
  /** Deadzone radius in px where drag won't change value */
  deadzone?: number;
  /** Diameter of the control in px */
  diameter?: number;
  /** Track (background arc) color */
  trackColor?: string;
  /** Active (filled arc) color */
  activeColor?: string;
  /** Thumb circle color */
  thumbColor?: string;
  /** Orientation of half-circle */
  orientation: 'top' | 'bottom' | 'left' | 'right';
  /** Draw direction: normal (start->end) or reverse (end->start) */
  direction?: 'normal' | 'reverse';
  /** Centered children overlay */
  children?: React.ReactNode;
}

export const MediKnobbler: React.FC<MediKnobblerProps> = ({
  value,
  onChange,
  min = 0,
  max = 12,
  tickStep = 1,
  precisionStep = 0.1,
  precisionDistance = 30,
  precisionSteps,
  deadzone = 15,
  diameter = 150,
  trackColor = '#e5e7eb',
  activeColor = '#4f46e5',
  thumbColor = '#ffffff',
  orientation,
  direction = 'normal',
  children,
}) => {
  const radius = diameter / 2;
  const padding = 4;
  const effectiveRadius = radius - padding;
  const center = { x: radius, y: radius };
  const innerR = effectiveRadius - 5;

  const round = (n: number) => parseFloat(n.toFixed(3));

  // Determine base half-circle angles
  const baseAngles = React.useMemo(() => {
    switch (orientation) {
      case 'top':
        return { start: 180, length: 180 };
      case 'bottom':
        return { start: 0, length: 180 };
      case 'left':
        return { start: 90, length: 180 };
      case 'right':
        return { start: -90, length: 180 };
      default:
        return { start: -90, length: 180 };
    }
  }, [orientation]);

  // Apply direction (reverse flips start and length sign)
  const { startAngle, arcLength } = React.useMemo(() => {
    const { start, length } = baseAngles;
    if (direction === 'reverse') {
      return { startAngle: start + length, arcLength: -length };
    }
    return { startAngle: start, arcLength: length };
  }, [baseAngles, direction]);

  // Snapping config
  const steps = precisionSteps && precisionSteps.length > 0 ? precisionSteps : [precisionStep];
  const decimals = Math.max(...steps.map(s => s.toString().split('.')[1]?.length || 0));
  const bands = steps.length;
  const maxRange = Math.max(innerR - deadzone, 0);
  const bandWidth = bands > 0 ? maxRange / bands : 0;

  // Map a mouse point to a value along one axis
  const valueFromPoint = useCallback(
    (x: number, y: number) => {
      // Determine fraction along the control based on orientation
      let fraction: number;
      if (orientation === 'top' || orientation === 'bottom') {
        // horizontal drag
        const dx = Math.min(Math.max(x, 0), diameter);
        fraction = dx / diameter;
      } else {
        // vertical drag
        const dy = Math.min(Math.max(y, 0), diameter);
        fraction = 1 - dy / diameter;
      }
      const raw = min + fraction * (max - min);

      // Determine dynamic step size
      let stepSize = tickStep;
      const dist = orientation === 'top' || orientation === 'bottom'
        ? Math.abs(x - center.x)
        : Math.abs(y - center.y);

      if (precisionSteps && precisionSteps.length) {
        const idx = Math.min(bands - 1, Math.floor((dist - deadzone) / bandWidth));
        stepSize = steps[idx];
      } else {
        stepSize = dist > precisionDistance ? precisionStep : tickStep;
      }

      // Snap and clamp
      const snapped = Math.round(raw / stepSize) * stepSize;
      const clamped = Math.min(max, Math.max(min, snapped));
      return parseFloat(clamped.toFixed(decimals));
    },
    [orientation, diameter, min, max, tickStep, precisionStep, precisionDistance, precisionSteps, bands, bandWidth, deadzone, steps, decimals, center.x, center.y]
  );

  // Motion value and syncing angle
  const motionValue = useMotionValue(value);
  const [currentAngle, setCurrentAngle] = useState(
    startAngle + ((value - min) / (max - min)) * arcLength
  );
  useEffect(() => {
    animate(motionValue, value, { type: 'spring', stiffness: 300, damping: 30 });
    const unsub = motionValue.on('change', v => {
      setCurrentAngle(startAngle + ((v - min) / (max - min)) * arcLength);
    });
    return unsub;
  }, [value, motionValue, startAngle, arcLength, min, max]);

  // Pointer event handlers
  const containerRef = useRef<HTMLDivElement>(null);
  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    onChange(valueFromPoint(x, y));
  }, [onChange, valueFromPoint]);

  const handlePointerUp = useCallback(() => {
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  }, [handlePointerMove]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Build SVG arc path
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (currentAngle * Math.PI) / 180;
  // Calculate sweep and large-arc flags
  const relAngle = (currentAngle - startAngle + 360) % 360;
  const largeArc = relAngle > 180 ? 1 : 0;
  const sweepFlag = arcLength >= 0 ? 1 : 0;
  const arcD =
    `M ${round(center.x + innerR * Math.cos(startRad))} ${round(center.y + innerR * Math.sin(startRad))}` +
    ` A ${round(innerR)} ${round(innerR)} 0 ${largeArc} ${sweepFlag} ` +
    `${round(center.x + innerR * Math.cos(endRad))} ${round(center.y + innerR * Math.sin(endRad))}`;

  const pathLength = (Math.abs((value - min) / (max - min)));

  // Create ticks along the half-arc
  const ticks: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let v = min; v <= max; v += tickStep) {
    const ang = ((startAngle + ((v - min) / (max - min)) * arcLength) * Math.PI) / 180;
    ticks.push({
      x1: round(center.x + (innerR - 5) * Math.cos(ang)),
      y1: round(center.y + (innerR - 5) * Math.sin(ang)),
      x2: round(center.x + innerR * Math.cos(ang)),
      y2: round(center.y + innerR * Math.sin(ang)),
    });
  }

  return (
    <div
      ref={containerRef}
      className="inline-block relative"
      style={{ width: diameter, height: diameter }}
      onPointerDown={handlePointerDown}
    >
      <svg width={diameter} height={diameter}>
        {/* Base track */}
        <circle cx={center.x} cy={center.y} r={innerR} stroke={trackColor} strokeWidth={10} fill="none" />
        {/* Main arc */}
        <motion.path d={arcD} stroke={activeColor} strokeWidth={10} fill="none" style={{ pathLength }} initial={false} />
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

export default MediKnobbler;
