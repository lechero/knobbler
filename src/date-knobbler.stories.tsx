import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import DateKnobbler, { DateKnobblerProps } from './date-knobbler';

const meta: Meta<DateKnobblerProps> = {
	title: 'Components/DateKnobbler',
	component: DateKnobbler,
	parameters: { layout: 'centered' },
	tags: ['autodocs'],
	argTypes: {
		yearColor: { control: 'color' },
		monthColor: { control: 'color' },
		dayColor: { control: 'color' },
		trackColor: { control: 'color' },
	},
} satisfies Meta<DateKnobblerProps>;

export default meta;
type Story = StoryObj<typeof meta>;

// Shared outline style for date text
const outlineStyle: React.CSSProperties = {
	textShadow: [
		'-2px -2px 0 #fff',
		' 2px -2px 0 #fff',
		'-2px  2px 0 #fff',
		' 2px  2px 0 #fff',
		'-2px  0px 0 #fff',
		' 2px  0px 0 #fff',
		' 0px -2px 0 #fff',
		' 0px  2px 0 #fff',
	].join(','),
};

export const Default: Story = {
	render: (args) => {
		const [date, setDate] = useState(args.value as Date);
		return (
			<DateKnobbler {...args} value={date} onChange={setDate}>
				<span style={outlineStyle} className="text-lg font-semibold">
					{date.toLocaleDateString()}
				</span>
			</DateKnobbler>
		);
	},
	args: {
		value: new Date(),
		min: new Date(2000, 0, 1),
		max: new Date(2030, 11, 31),
		diameter: 220,
		startAngle: -90,
		arcLength: 360,
		yearColor: '#4f46e5',
		monthColor: '#10b981',
		dayColor: '#f59e0b',
		trackColor: '#e5e7eb',
	},
};

export const LimitedYearRange: Story = {
	render: (args) => {
		const [date, setDate] = useState(args.value as Date);
		return (
			<DateKnobbler {...args} value={date} onChange={setDate}>
				<span style={outlineStyle} className="text-blue-600 text-lg">
					{date.getFullYear()}
				</span>
			</DateKnobbler>
		);
	},
	args: {
		value: new Date(2025, 5, 15),
		min: new Date(2023, 0, 1),
		max: new Date(2027, 11, 31),
		diameter: 200,
		startAngle: -135,
		arcLength: 270,
		yearColor: '#1d4ed8',
		monthColor: '#93c5fd',
		dayColor: '#bfdbfe',
		trackColor: '#e0e7ff',
	},
};

export const CustomColorsAndRange: Story = {
	render: (args) => {
		const [date, setDate] = useState(args.value as Date);
		return (
			<DateKnobbler {...args} value={date} onChange={setDate}>
				<span style={outlineStyle} className="text-red-600 text-md">
					{date.toISOString().split('T')[0]}
				</span>
			</DateKnobbler>
		);
	},
	args: {
		value: new Date(2022, 11, 25),
		min: new Date(2022, 0, 1),
		max: new Date(2022, 11, 31),
		diameter: 250,
		startAngle: 0,
		arcLength: 360,
		yearColor: '#dc2626',
		monthColor: '#fca5a5',
		dayColor: '#fee2e2',
		trackColor: '#fef2f2',
	},
};

export const MonthDayPicker: Story = {
	render: (args) => {
		const [date, setDate] = useState(args.value as Date);
		return (
			<DateKnobbler {...args} value={date} onChange={setDate}>
				<span style={outlineStyle} className="text-green-600 text-md">
					{date.toLocaleString('default', { month: 'short' })} {date.getDate()}
				</span>
			</DateKnobbler>
		);
	},
	args: {
		value: new Date(2024, 6, 4),
		min: new Date(2024, 0, 1),
		max: new Date(2024, 11, 31),
		diameter: 200,
		startAngle: -90,
		arcLength: 360,
		yearColor: '#6d28d9',
		monthColor: '#c4b5fd',
		dayColor: '#e9d5ff',
		trackColor: '#f5f3ff',
	},
};
