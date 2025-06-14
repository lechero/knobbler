"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, useMotionValue, MotionValue } from 'framer-motion';
import { Sun, Moon, Globe } from 'lucide-react';

export interface DateOrbiterProps {
	/** Initial date value */
	value: Date;
	/** Callback when date changes */
	onChange?: (date: Date) => void;
	/** Minimum allowed date */
	minDate?: Date;
	/** Maximum allowed date */
	maxDate?: Date;
	/** Start angle for 0% position */
	startAngle?: number;
	/** Total arc length for full range */
	arcLength?: number;
	/** Overall diameter of the SVG */
	diameter?: number;
}

/**
 * A Date picker using three draggable orbiters (Sun=year, Moon=month, Globe=day).
 * Internally tracks its own date state but notifies via onChange.
 */
const DateOrbiter: React.FC<DateOrbiterProps> = ({
	value,
	onChange,
	minDate = new Date(2000, 0, 1),
	maxDate = new Date(2030, 11, 31),
	startAngle = -90,
	arcLength = 360,
	diameter = 200,
}) => {
	// Internal date state
	const [internalDate, setInternalDate] = useState<Date>(value);
	useEffect(() => { setInternalDate(value); }, [value]);

	// Constants
	const ICON_SIZE = 24;

	// Setup geometry
	const radius = diameter / 2;
	const padding = 4;
	const effectiveR = radius - padding;
	const bandWidth = effectiveR / 3;
	const center = useMemo(() => ({ x: radius, y: radius }), [radius]);

	// Map numeric value to angle
	const angleFor = useCallback(
		(pos: number, min: number, max: number) =>
			startAngle + ((pos - min) / (max - min)) * arcLength,
		[startAngle, arcLength]
	);

	// Calculate days in current month
	const daysInMonth = useMemo(
		() => new Date(internalDate.getFullYear(), internalDate.getMonth() + 1, 0).getDate(),
		[internalDate]
	);

	// Define bands: year, month, day
	const bands = useMemo(
		() => [
			{
				id: 'year', icon: <Sun size={ICON_SIZE} />, min: minDate.getFullYear(), max: maxDate.getFullYear(),
				value: internalDate.getFullYear(),
				setter: (v: number) => { const d = new Date(v, internalDate.getMonth(), internalDate.getDate()); setInternalDate(d); onChange?.(d); },
				color: '#facc15',
			},
			{
				id: 'month', icon: <Moon size={ICON_SIZE} />, min: 1, max: 12,
				value: internalDate.getMonth() + 1,
				setter: (v: number) => { const d = new Date(internalDate.getFullYear(), v - 1, internalDate.getDate()); setInternalDate(d); onChange?.(d); },
				color: '#a78bfa',
			},
			{
				id: 'day', icon: <Globe size={ICON_SIZE} />, min: 1, max: daysInMonth,
				value: internalDate.getDate(),
				setter: (v: number) => { const d = new Date(internalDate.getFullYear(), internalDate.getMonth(), v); setInternalDate(d); onChange?.(d); },
				color: '#34d399',
			},
		], [internalDate, onChange, minDate, maxDate, daysInMonth]
	);

	// Unconditional hooks: motion values
	const yearMotion = useMotionValue(angleFor(bands[0].value, bands[0].min, bands[0].max));
	const monthMotion = useMotionValue(angleFor(bands[1].value, bands[1].min, bands[1].max));
	const dayMotion = useMotionValue(angleFor(bands[2].value, bands[2].min, bands[2].max));
	const motionAngles: MotionValue<number>[] = [yearMotion, monthMotion, dayMotion];

	// Local angles state
	const [angles, setAngles] = useState<number[]>(motionAngles.map(mv => mv.get()));
	useEffect(() => {
		const subs = motionAngles.map((mv, i) => mv.on('change', v => {
			setAngles(prev => { const next = [...prev]; next[i] = v; return next; });
		}));
		return () => subs.forEach(unsub => unsub());
	}, [motionAngles]);

	// Interaction state
	const containerRef = useRef<HTMLDivElement>(null);
	const [activeBand, setActiveBand] = useState<number | null>(null);

	// Handle dragging
	const handlePointerDown = useCallback(
		(index: number) => (e: React.PointerEvent) => {
			e.currentTarget.setPointerCapture(e.pointerId);
			setActiveBand(index);
			const onMove = (ev: PointerEvent) => {
				const rect = containerRef.current?.getBoundingClientRect(); if (!rect) return;
				const dx = ev.clientX - rect.left - center.x;
				const dy = ev.clientY - rect.top - center.y;
				let ang = (Math.atan2(dy, dx) * 180) / Math.PI; if (ang < 0) ang += 360;
				const rel = Math.min((ang - startAngle + 360) % 360, arcLength);
				const band = bands[index];
				const raw = band.min + (rel / arcLength) * (band.max - band.min);
				const sel = Math.round(raw);
				motionAngles[index].set(angleFor(sel, band.min, band.max));
				band.setter(sel);
			};
			const onUp = () => { setActiveBand(null); window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
			window.addEventListener('pointermove', onMove);
			window.addEventListener('pointerup', onUp);
		},
		[bands, center, startAngle, arcLength, angleFor, motionAngles]
	);

	// Arc renderer
	const renderArc = useCallback((r: number, ang: number) => {
		const startRad = (startAngle * Math.PI) / 180;
		const endRad = (ang * Math.PI) / 180;
		const large = ((ang - startAngle + 360) % 360) > 180 ? 1 : 0;
		const sx = center.x + r * Math.cos(startRad);
		const sy = center.y + r * Math.sin(startRad);
		const ex = center.x + r * Math.cos(endRad);
		const ey = center.y + r * Math.sin(endRad);
		return `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`;
	}, [center, startAngle]);

	const ringRadii = [bandWidth * 0.5, bandWidth * 1.5, bandWidth * 2.5];

	return (
		<div ref={containerRef} style={{ width: diameter, height: diameter, position: 'relative' }}>
			<svg width={diameter} height={diameter}>
				<circle cx={center.x} cy={center.y} r={effectiveR} stroke="#ccc" strokeWidth={2} fill="none" />
				{bands.map((band, i) => {
					const angleRad = (angles[i] * Math.PI) / 180;
					const x = center.x + ringRadii[i] * Math.cos(angleRad) - ICON_SIZE / 2;
					const y = center.y + ringRadii[i] * Math.sin(angleRad) - ICON_SIZE / 2;
					return (
						<g key={band.id}>
							<motion.path d={renderArc(ringRadii[i], angles[i])} stroke={band.color} strokeWidth={bandWidth} fill="none" />
							<g onPointerDown={handlePointerDown(i)} style={{ cursor: 'pointer', transform: `translate(${x}px, ${y}px)` }}>
								{band.icon}
							</g>
						</g>
					);
				})}
			</svg>
			<div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', fontSize: 14 }}>
				{internalDate.toLocaleDateString()}
			</div>
		</div>
	);
};

export default DateOrbiter;

