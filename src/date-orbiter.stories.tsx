// src/DateOrbiter.stories.tsx
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import DateOrbiter, { DateOrbiterProps } from './date-orbiter';

const meta: Meta<DateOrbiterProps> = {
	title: 'Components/DateOrbiter',
	component: DateOrbiter,
	parameters: { layout: 'centered' },
	tags: ['autodocs'],
	argTypes: {
		value: { control: 'date' },
		minDate: { control: 'date' },
		maxDate: { control: 'date' },
		startAngle: { control: { type: 'number', min: -360, max: 360, step: 15 } },
		arcLength: { control: { type: 'number', min: 0, max: 360, step: 15 } },
		diameter: { control: { type: 'number', min: 50, max: 500, step: 10 } },
	},
} satisfies Meta<DateOrbiterProps>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A static preview of the DateOrbiter at default settings.
 */
export const Default: Story = {
	args: {
		value: new Date(),
		onChange: () => { },
		minDate: new Date(2000, 0, 1),
		maxDate: new Date(2030, 11, 31),
		startAngle: -90,
		arcLength: 360,
		diameter: 200,
	},
};

/**
 * Interactive example: dragging the day/month/year icons updates the displayed date.
 */
export const Interactive: Story = {
	render: (args) => {
		const [date, setDate] = useState(new Date(args.value as Date));
		return (
			<DateOrbiter
				{...args}
				value={date}
				onChange={setDate}
			/>
		);
	},
	args: {
		value: new Date(),
		minDate: new Date(2000, 0, 1),
		maxDate: new Date(2030, 11, 31),
		startAngle: -90,
		arcLength: 360,
		diameter: 200,
	},
};
