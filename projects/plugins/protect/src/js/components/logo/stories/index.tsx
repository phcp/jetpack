/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Logo from '..';

export default {
	title: 'Plugins/Protect/Logo',
	component: Logo,
	argTypes: {
		iconColor: {
			control: {
				type: 'color',
			},
		},
		color: {
			control: {
				type: 'color',
			},
		},
	},
};

const Template = args => <Logo { ...args } />;

export const _default = Template.bind( {} );
_default.args = {
	iconColor: '#069E08',
	color: '#000',
};
