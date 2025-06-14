import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import Knobbler, { KnobblerProps } from './knobbler';

const meta: Meta<KnobblerProps> = {
	title: 'Components/Knobbler',
	component: Knobbler,
	parameters: { layout: 'centered' },
	tags: ['autodocs'],
	argTypes: {
		trackColor: { control: 'color' },
		activeColor: { control: 'color' },
		thumbColor: { control: 'color' },
	},
} satisfies Meta<KnobblerProps>;

export default meta;
type Story = StoryObj<typeof meta>;

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
		const [value, setValue] = useState(args.value as number);
		return (
			<div className="border border-foreground">
				<Knobbler {...args} value={value} onChange={setValue}>
					<span style={outlineStyle} className="text-lg font-semibold">
						{value}
					</span>
				</Knobbler>
			</div>
		);
	},
	args: {
		value: 6,
		min: 0,
		max: 12,
		tickStep: 1,
		precisionStep: 0.1,
		precisionDistance: 20,
		deadzone: 10,
		startAngle: -90,
		arcLength: 360,
		diameter: 120,
	},
};

export const ClockStyle: Story = {
	render: (args) => {
		const [value, setValue] = useState(args.value as number);
		return (
			<Knobbler {...args} value={value} onChange={setValue}>
				<span style={outlineStyle} className="text-blue-600 text-xl">
					{value} <small>o'clock</small>
				</span>
			</Knobbler>
		);
	},
	args: {
		value: 3,
		min: 1,
		max: 12,
		tickStep: 1,
		precisionSteps: [1, 0.5],
		deadzone: 10,
		startAngle: -90,
		arcLength: 360,
		diameter: 140,
		trackColor: '#e2e8f0',
		activeColor: '#2563eb',
		thumbColor: '#3b82f6',
	},
};

export const Full360: Story = {
	render: (args) => {
		const [value, setValue] = useState(args.value as number);
		return (
			<Knobbler {...args} value={value} onChange={setValue}>
				<span style={outlineStyle} className="text-teal-600 text-lg">
					{value}°
				</span>
			</Knobbler>
		);
	},
	args: {
		value: 180,
		min: 0,
		max: 360,
		tickStep: 45,
		precisionSteps: [30, 15, 5, 1],
		deadzone: 20,
		startAngle: 0,
		arcLength: 360,
		diameter: 160,
		trackColor: '#f3f4f6',
		activeColor: '#0891b2',
		thumbColor: '#bae6fd',
	},
};

export const SemiCircle: Story = {
	render: (args) => {
		const [value, setValue] = useState(args.value as number);
		return (
			<Knobbler {...args} value={value} onChange={setValue}>
				<span style={outlineStyle} className="text-purple-600 text-lg">
					{value}%
				</span>
			</Knobbler>
		);
	},
	args: {
		value: 50,
		min: 0,
		max: 100,
		tickStep: 20,
		precisionStep: 5,
		precisionDistance: 25,
		deadzone: 10,
		startAngle: -180,
		arcLength: 180,
		diameter: 130,
		trackColor: '#faf5ff',
		activeColor: '#7c3aed',
		thumbColor: '#ddd6fe',
	},
};

export const CustomBands: Story = {
	render: (args) => {
		const [value, setValue] = useState(args.value as number);
		return (
			<Knobbler {...args} value={value} onChange={setValue}>
				<span style={outlineStyle} className="text-amber-600 text-md">
					Val: {value}
				</span>
			</Knobbler>
		);
	},
	args: {
		value: 5,
		min: 0,
		max: 50,
		tickStep: 5,
		precisionSteps: [10, 5, 2, 1, 0.5],
		deadzone: 15,
		startAngle: -90,
		arcLength: 360,
		diameter: 150,
		trackColor: '#fef3c7',
		activeColor: '#f59e0b',
		thumbColor: '#fde68a',
	},
};

export const SmallKnob: Story = {
	render: (args) => {
		const [value, setValue] = useState(args.value as number);
		return (
			<Knobbler {...args} value={value} onChange={setValue}>
				<span style={outlineStyle} className="text-sm">
					{value.toFixed(2)}
				</span>
			</Knobbler>
		);
	},
	args: {
		value: 0.5,
		min: 0,
		max: 1,
		tickStep: 0.1,
		precisionStep: 0.01,
		precisionDistance: 10,
		deadzone: 5,
		startAngle: -90,
		arcLength: 360,
		diameter: 80,
		trackColor: '#e5e7eb',
		activeColor: '#047857',
		thumbColor: '#10b981',
	},
};

