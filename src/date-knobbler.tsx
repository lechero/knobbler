import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';

export interface DateKnobblerProps {
	value: Date;
	onChange: (date: Date) => void;
	min?: Date;
	max?: Date;
	startAngle?: number;
	arcLength?: number;
	diameter?: number;
	yearColor?: string;
	monthColor?: string;
	dayColor?: string;
	trackColor?: string;
	children?: React.ReactNode;
}

const DateKnobbler: React.FC<DateKnobblerProps> = ({
	value,
	onChange,
	min = new Date(2000, 0, 1),
	max = new Date(2030, 11, 31),
	startAngle = -90,
	arcLength = 360,
	diameter = 200,
	yearColor = '#4f46e5',
	monthColor = '#10b981',
	dayColor = '#f59e0b',
	trackColor = '#e5e7eb',
	children,
}) => {
	const radius = diameter / 2;
	const padding = 4;
	const effectiveR = radius - padding;
	const bandWidth = effectiveR / 3;
	const center = { x: radius, y: radius };

	// clamp a date between min and max
	const inRange = (d: Date) => (d < min ? min : d > max ? max : d);

	// compute bounds for month/day
	const minYear = min.getFullYear();
	const maxYear = max.getFullYear();
	const getMonthBounds = (year: number) => ({
		low: year === minYear ? min.getMonth() + 1 : 1,
		high: year === maxYear ? max.getMonth() + 1 : 12,
	});
	const getDayBounds = (year: number, month: number) => {
		const daysInMonth = new Date(year, month, 0).getDate();
		const low = year === minYear && month === min.getMonth() + 1 ? min.getDate() : 1;
		const high = year === maxYear && month === max.getMonth() + 1 ? max.getDate() : daysInMonth;
		return { low, high };
	};

	// map a value to an angle
	const angleFor = (pos: number, minPos: number, maxPos: number) =>
		startAngle + ((pos - minPos) / (maxPos - minPos || 1)) * arcLength;

	// motion values for smooth animation
	const yearMotion = useMotionValue(angleFor(value.getFullYear(), minYear, maxYear));
	const monthBounds = getMonthBounds(value.getFullYear());
	const monthMotion = useMotionValue(
		angleFor(value.getMonth() + 1, monthBounds.low, monthBounds.high)
	);
	const dayBounds = getDayBounds(value.getFullYear(), value.getMonth() + 1);
	const dayMotion = useMotionValue(
		angleFor(value.getDate(), dayBounds.low, dayBounds.high)
	);

	// local state for display
	const [yearAngle, setYearAngle] = useState(yearMotion.get());
	const [monthAngle, setMonthAngle] = useState(monthMotion.get());
	const [dayAngle, setDayAngle] = useState(dayMotion.get());
	const [currentBand, setCurrentBand] = useState<number | null>(null);
	const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);

	// refs to store committed values
	const yearRef = useRef(value.getFullYear());
	const monthRef = useRef(value.getMonth() + 1);
	const dayRef = useRef(value.getDate());
	const bandRef = useRef<number | null>(null);

	// sync animations when value prop changes
	useEffect(() => {
		animate(yearMotion, angleFor(value.getFullYear(), minYear, maxYear), {
			type: 'spring',
			stiffness: 300,
			damping: 30,
		});
		const mb = getMonthBounds(value.getFullYear());
		animate(monthMotion, angleFor(value.getMonth() + 1, mb.low, mb.high), {
			type: 'spring',
			stiffness: 300,
			damping: 30,
		});
		const db = getDayBounds(value.getFullYear(), value.getMonth() + 1);
		animate(dayMotion, angleFor(value.getDate(), db.low, db.high), {
			type: 'spring',
			stiffness: 300,
			damping: 30,
		});

		const uY = yearMotion.on('change', v => setYearAngle(v));
		const uM = monthMotion.on('change', v => setMonthAngle(v));
		const uD = dayMotion.on('change', v => setDayAngle(v));
		return () => { uY(); uM(); uD(); };
	}, [value]);

	// pointer handling
	const containerRef = useRef<HTMLDivElement>(null);
	const handlePointerDown = useCallback((e: React.PointerEvent) => {
		if (!containerRef.current) return;
		// seed refs from current value
		yearRef.current = value.getFullYear();
		monthRef.current = value.getMonth() + 1;
		dayRef.current = value.getDate();
		bandRef.current = null;

		e.currentTarget.setPointerCapture(e.pointerId);

		const onMove = (ev: PointerEvent) => {
			const r = containerRef.current!.getBoundingClientRect();
			const x = ev.clientX - r.left;
			const y = ev.clientY - r.top;
			setDragPos({ x, y });

			// find band under cursor
			const dx = x - center.x;
			const dy = y - center.y;
			const dist = Math.min(Math.hypot(dx, dy), effectiveR);
			const newBand = Math.min(2, Math.floor(dist / bandWidth));

			// compute angle->raw Y/M/D
			let ang = (Math.atan2(dy, dx) * 180) / Math.PI;
			if (ang < 0) ang += 360;
			let rel = (ang - startAngle + 360) % 360;
			rel = Math.min(rel, arcLength);

			const rawY = minYear + (rel / arcLength) * (maxYear - minYear);
			const selY = Math.round(rawY);
			const mb2 = getMonthBounds(selY);
			const rawM = mb2.low + (rel / arcLength) * (mb2.high - mb2.low);
			const selM = Math.round(rawM);
			const db2 = getDayBounds(selY, selM);
			const rawD = db2.low + (rel / arcLength) * (db2.high - db2.low);
			const selD = Math.round(rawD);

			// if swapped bands, commit old band value first
			if (bandRef.current !== null && bandRef.current !== newBand) {
				switch (bandRef.current) {
					case 0: yearRef.current = selY; break;
					case 1: monthRef.current = selM; break;
					case 2: dayRef.current = selD; break;
				}
				bandRef.current = newBand;
				setCurrentBand(newBand);
				onChange(inRange(new Date(yearRef.current, monthRef.current - 1, dayRef.current)));
				return;
			}

			// normal drag: write into active band's ref
			bandRef.current = newBand;
			setCurrentBand(newBand);
			switch (newBand) {
				case 0: yearRef.current = selY; break;
				case 1: monthRef.current = selM; break;
				case 2: dayRef.current = selD; break;
			}
			onChange(inRange(new Date(yearRef.current, monthRef.current - 1, dayRef.current)));
		};

		const onUp = () => {
			setCurrentBand(null);
			setDragPos(null);
			bandRef.current = null;
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
		};

		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', onUp);
	}, [value, onChange]);

	// helper to draw arcs
	const renderArc = (r: number, ang: number) => {
		const start = (startAngle * Math.PI) / 180;
		const end = (ang * Math.PI) / 180;
		const large = ((ang - startAngle + 360) % 360) > 180 ? 1 : 0;
		const sx = center.x + r * Math.cos(start);
		const sy = center.y + r * Math.sin(start);
		const ex = center.x + r * Math.cos(end);
		const ey = center.y + r * Math.sin(end);
		return `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`;
	};

	const ringRadii = [bandWidth * 0.5, bandWidth * 1.5, bandWidth * 2.5];

	return (
		<div
			ref={containerRef}
			tabIndex={0}
			onPointerDown={handlePointerDown}
			style={{ width: diameter, height: diameter, position: 'relative' }}
		>
			<svg width={diameter} height={diameter}>
				{currentBand !== null && (
					<circle
						cx={center.x}
						cy={center.y}
						r={ringRadii[currentBand]}
						stroke={
							currentBand === 0 ? yearColor : currentBand === 1 ? monthColor : dayColor
						}
						strokeWidth={bandWidth}
						fill="none"
						strokeOpacity={0.3}
					/>
				)}
				{dragPos && (
					<line
						x1={center.x}
						y1={center.y}
						x2={dragPos.x}
						y2={dragPos.y}
						stroke={
							currentBand === 0 ? yearColor : currentBand === 1 ? monthColor : dayColor
						}
						strokeWidth={2}
					/>
				)}
				<circle
					cx={center.x}
					cy={center.y}
					r={effectiveR}
					stroke={trackColor}
					strokeWidth={2}
					fill="none"
				/>
				<motion.path d={renderArc(ringRadii[0], yearAngle)} stroke={yearColor} strokeWidth={bandWidth} fill="none" />
				<motion.path d={renderArc(ringRadii[1], monthAngle)} stroke={monthColor} strokeWidth={bandWidth} fill="none" />
				<motion.path d={renderArc(ringRadii[2], dayAngle)} stroke={dayColor} strokeWidth={bandWidth} fill="none" />
			</svg>
			{children && (
				<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
					{children}
				</div>
			)}
		</div>
	);
};

export default DateKnobbler;
