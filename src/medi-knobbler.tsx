import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';

export interface MediKnobblerProps {
	value: number;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
	tickStep?: number;
	precisionStep?: number;
	precisionDistance?: number;
	precisionSteps?: number[];
	deadzone?: number;
	/** Diameter of the full circle */
	diameter?: number;
	trackColor?: string;
	activeColor?: string;
	thumbColor?: string;
	orientation: 'top' | 'bottom' | 'left' | 'right';
	direction?: 'normal' | 'reverse';
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
	// Compute render box
	const renderWidth = (orientation === 'left' || orientation === 'right')
		? diameter / 2
		: diameter;
	const renderHeight = (orientation === 'top' || orientation === 'bottom')
		? diameter / 2
		: diameter;

	// Full circle center + radius
	const center = { x: diameter / 2, y: diameter / 2 };
	const innerR = diameter / 2 - 9;
	const round = (n: number) => parseFloat(n.toFixed(3));

	// Base half-circle
	const base = React.useMemo(() => {
		switch (orientation) {
			case 'top': return { start: 180, length: 180 };
			case 'bottom': return { start: 0, length: 180 };
			case 'left': return { start: 90, length: 180 };
			case 'right': return { start: -90, length: 180 };
			default: return { start: -90, length: 180 };
		}
	}, [orientation]);

	// Reverse logic
	const { startAngle, arcLength } = React.useMemo(() => {
		const { start, length } = base;
		return direction === 'reverse'
			? { startAngle: start + length, arcLength: -length }
			: { startAngle: start, arcLength: length };
	}, [base, direction]);

	// Precision bands
	const steps = precisionSteps && precisionSteps.length
		? precisionSteps
		: [precisionStep];
	const decimals = Math.max(...steps.map(s => (s.toString().split('.')[1]?.length || 0)));
	const bands = steps.length;
	const maxRange = Math.max(innerR - deadzone, 0);
	const bandWidth = bands ? maxRange / bands : 0;

	// Pointer to value
	const valueFromPoint = useCallback((x: number, y: number) => {
		const fx = orientation === 'right' ? x + diameter / 2 : x;
		const fy = orientation === 'bottom' ? y + diameter / 2 : y;
		const dx = fx - center.x;
		const dy = fy - center.y;
		const dist = Math.hypot(dx, dy);
		if (dist < deadzone) return value;

		let ang = (Math.atan2(dy, dx) * 180) / Math.PI;
		if (ang < 0) ang += 360;

		const absLen = Math.abs(arcLength);
		let rel = arcLength >= 0
			? (ang - startAngle + 360) % 360
			: (startAngle - ang + 360) % 360;
		rel = Math.min(rel, absLen);

		const raw = min + (rel / absLen) * (max - min);

		let stepSize = tickStep;
		if (precisionSteps && precisionSteps.length) {
			const idx = Math.min(bands - 1, Math.floor((dist - deadzone) / bandWidth));
			stepSize = steps[idx];
		} else {
			stepSize = dist > precisionDistance ? precisionStep : tickStep;
		}

		const snapped = Math.round(raw / stepSize) * stepSize;
		return parseFloat(Math.min(max, Math.max(min, snapped)).toFixed(decimals));
	}, [orientation, diameter, center, deadzone, startAngle, arcLength, min, max, tickStep, precisionStep, precisionDistance, precisionSteps, bands, bandWidth, steps, decimals, value]);

	// Motion value
	const motionValue = useMotionValue(value);
	const [currentAngle, setCurrentAngle] = useState(
		startAngle + ((value - min) / (max - min)) * arcLength
	);
	useEffect(() => {
		animate(motionValue, value, { type: 'spring', stiffness: 300, damping: 30 });
		return motionValue.on('change', v => {
			setCurrentAngle(startAngle + ((v - min) / (max - min)) * arcLength);
		});
	}, [value, motionValue, startAngle, arcLength, min, max]);

	// Build paths
	const startRad = (startAngle * Math.PI) / 180;
	const endRadBase = ((startAngle + arcLength) * Math.PI) / 180;
	const largeArcFlag = Math.abs(arcLength) > 180 ? 1 : 0;
	const sweepFlag = arcLength > 0 ? 1 : 0;
	const trackD =
		`M ${round(center.x + innerR * Math.cos(startRad))} ${round(center.y + innerR * Math.sin(startRad))}` +
		` A ${round(innerR)} ${round(innerR)} 0 ${largeArcFlag} ${sweepFlag} ` +
		`${round(center.x + innerR * Math.cos(endRadBase))} ${round(center.y + innerR * Math.sin(endRadBase))}`;

	const endRad = (currentAngle * Math.PI) / 180;
	// Compute relative angle for active segment (handles reverse correctly)
	const relAngle = arcLength >= 0
		? (currentAngle - startAngle + 360) % 360
		: (startAngle - currentAngle + 360) % 360;
	const activeLargeFlag = relAngle > 180 ? 1 : 0;
	const activeD =
		`M ${round(center.x + innerR * Math.cos(startRad))} ${round(center.y + innerR * Math.sin(startRad))}` +
		` A ${round(innerR)} ${round(innerR)} 0 ${activeLargeFlag} ${sweepFlag} ` +
		`${round(center.x + innerR * Math.cos(endRad))} ${round(center.y + innerR * Math.sin(endRad))}`;

	// pathLength only
	const rawFrac = (value - min) / (max - min);
	const pathLength = Math.abs(rawFrac);

	// ticks
	const ticks = Array.from(
		{ length: Math.floor((max - min) / tickStep) + 1 },
		(_, i) => {
			const v = min + i * tickStep;
			const ang = ((startAngle + ((v - min) / (max - min)) * arcLength) * Math.PI) / 180;
			return {
				x1: round(center.x + (innerR - 5) * Math.cos(ang)),
				y1: round(center.y + (innerR - 5) * Math.sin(ang)),
				x2: round(center.x + innerR * Math.cos(ang)),
				y2: round(center.y + innerR * Math.sin(ang)),
			};
		}
	);

	// viewBox crop
	let viewBox: string;
	if (orientation === 'top') viewBox = `0 0 ${diameter} ${diameter / 2}`;
	else if (orientation === 'bottom') viewBox = `0 ${diameter / 2} ${diameter} ${diameter / 2}`;
	else if (orientation === 'left') viewBox = `0 0 ${diameter / 2} ${diameter}`;
	else viewBox = `${diameter / 2} 0 ${diameter / 2} ${diameter}`;

	// pointer
	const containerRef = useRef<HTMLDivElement>(null);
	const handlePointerMove = useCallback((e: PointerEvent) => {
		if (!containerRef.current) return;
		const rect = containerRef.current.getBoundingClientRect();
		onChange(valueFromPoint(e.clientX - rect.left, e.clientY - rect.top));
	}, [onChange, valueFromPoint]);

	const handlePointerUp = useCallback(() => {
		window.removeEventListener('pointermove', handlePointerMove);
		window.removeEventListener('pointerup', handlePointerUp);
	}, [handlePointerMove]);

	const handlePointerDown = (e: React.PointerEvent) => {
		motionValue.stop();
		e.currentTarget.setPointerCapture(e.pointerId);
		window.addEventListener('pointermove', handlePointerMove);
		window.addEventListener('pointerup', handlePointerUp);
	};

	return (
		<div
			ref={containerRef}
			className="inline-block relative"
			style={{ width: renderWidth, height: renderHeight, overflow: 'hidden' }}
			onPointerDown={handlePointerDown}
		>
			<svg
				width={renderWidth}
				height={renderHeight}
				viewBox={viewBox}
				preserveAspectRatio="xMinYMin meet"
			>
				<path d={trackD} stroke={trackColor} strokeWidth={10} fill="none" />
				<motion.path
					d={activeD}
					stroke={activeColor}
					strokeWidth={10}
					fill="none"
					style={{ pathLength }}
					initial={false}
				/>
				{ticks.map((t, i) => (
					<line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={trackColor} strokeWidth={2} />
				))}
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
			{children && (
				<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
					{children}
				</div>
			)}
		</div>
	);
};

export default MediKnobbler;

