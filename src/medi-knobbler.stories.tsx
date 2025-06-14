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
			control: { type: 'inline-radio', options: ['top', 'bottom', 'left', 'right'] },
		},
		direction: {
			control: { type: 'inline-radio', options: ['normal', 'reverse'] },
		},
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
		direction: 'normal',
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

const Template: Story = {
	render: (args) => {
		const [value, setValue] = useState(args.value as number);
		return (
			<div style={{ display: 'inline-block', padding: 20, border: '1px solid #ddd' }}>
				<MediKnobbler {...args} value={value} onChange={setValue}>
					<span style={outlineStyle} className="text-lg font-semibold">
						{value}
					</span>
				</MediKnobbler>
			</div>
		);
	},
};

export const TopNormal = {
	...Template,
	name: 'Top / Normal',
	args: { orientation: 'top', direction: 'normal' },
};

export const TopReverse = {
	...Template,
	name: 'Top / Reverse',
	args: { orientation: 'top', direction: 'reverse', activeColor: '#e11d48' },
};

export const BottomNormal = {
	...Template,
	name: 'Bottom / Normal',
	args: { orientation: 'bottom', direction: 'normal', trackColor: '#faf5ff', activeColor: '#7c3aed', thumbColor: '#ddd6fe' },
};

export const BottomReverse = {
	...Template,
	name: 'Bottom / Reverse',
	args: { orientation: 'bottom', direction: 'reverse', trackColor: '#fef3c7', activeColor: '#ca8a04', thumbColor: '#fde047' },
};

export const LeftNormal = {
	...Template,
	name: 'Left / Normal',
	args: { orientation: 'left', direction: 'normal', trackColor: '#ecfdf5', activeColor: '#10b981', thumbColor: '#a7f3d0', min: 0, max: 1, tickStep: 0.1, precisionStep: 0.01, precisionDistance: 15, diameter: 120 },
};

export const LeftReverse = {
	...Template,
	name: 'Left / Reverse',
	args: { orientation: 'left', direction: 'reverse', trackColor: '#d1fae5', activeColor: '#047857', thumbColor: '#6ee7b7', min: 0, max: 1, tickStep: 0.1, precisionStep: 0.01, precisionDistance: 15, diameter: 120 },
};

export const RightNormal = {
	...Template,
	name: 'Right / Normal',
	args: { orientation: 'right', direction: 'normal', trackColor: '#fffbeb', activeColor: '#f59e0b', thumbColor: '#fde68a' },
};

export const RightReverse = {
	...Template,
	name: 'Right / Reverse',
	args: { orientation: 'right', direction: 'reverse', trackColor: '#ffedd5', activeColor: '#b45309', thumbColor: '#fcd34d' },
};

