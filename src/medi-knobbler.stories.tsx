import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import MediKnobbler, { MediKnobblerProps } from './medi-knobbler';

const meta: Meta<MediKnobblerProps> = {
	title: 'Components/MediKnobbler',
	component: MediKnobbler,
	parameters: { layout: 'centered' },
	tags: ['autodocs'],
	argTypes: {
		trackColor: { control: 'color' },
		activeColor: { control: 'color' },
		thumbColor: { control: 'color' },
		orientation: {
			control: { type: 'inline-radio', options: ['top', 'bottom', 'left', 'right'] }
		}
	},
	args: {
		value: 50,
		min: 0,
		max: 100,
		tickStep: 10,
		precisionStep: 1,
		precisionDistance: 20,
		deadzone: 10,
		diameter: 140,
		trackColor: '#f3f4f6',
		activeColor: '#2563eb',
		thumbColor: '#3b82f6',
		orientation: 'top',
	},
} satisfies Meta<MediKnobblerProps>;

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

export const Top: Story = {
	render: (args) => {
		const [value, setValue] = useState(args.value as number);
		return (
			<MediKnobbler {...args} value={value} onChange={setValue}>
				<span style={outlineStyle} className="text-lg font-semibold">
					{value}
				</span>
			</MediKnobbler>
		);
	}
};

export const Bottom: Story = {
	render: (args) => {
		const [value, setValue] = useState(args.value as number);
		return (
			<MediKnobbler {...args} value={value} onChange={setValue}>
				<span style={outlineStyle} className="text-purple-600 text-lg">
					{value}%
				</span>
			</MediKnobbler>
		);
	},
	args: {
		orientation: 'bottom',
		trackColor: '#faf5ff',
		activeColor: '#7c3aed',
		thumbColor: '#ddd6fe',
	},
};

export const Left: Story = {
	render: (args) => {
		const [value, setValue] = useState(args.value as number);
		return (
			<MediKnobbler {...args} value={value} onChange={setValue}>
				<span style={outlineStyle} className="text-green-600 text-lg">
					{value}
				</span>
			</MediKnobbler>
		);
	},
	args: {
		orientation: 'left',
		trackColor: '#ecfdf5',
		activeColor: '#10b981',
		thumbColor: '#a7f3d0',
		min: 0,
		max: 1,
		tickStep: 0.1,
		precisionStep: 0.01,
		precisionDistance: 15,
		diameter: 120,
	},
};

export const Right: Story = {
	render: (args) => {
		const [value, setValue] = useState(args.value as number);
		return (
			<MediKnobbler {...args} value={value} onChange={setValue}>
				<span style={outlineStyle} className="text-amber-600 text-lg">
					{value}
				</span>
			</MediKnobbler>
		);
	},
	args: {
		orientation: 'right',
		trackColor: '#fffbeb',
		activeColor: '#f59e0b',
		thumbColor: '#fde68a',
	},
};

