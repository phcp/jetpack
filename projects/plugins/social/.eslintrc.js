module.exports = {
	extends: [ require.resolve( 'jetpack-js-tools/eslintrc/react' ) ],
	parserOptions: {
		babelOptions: {
			configFile: require.resolve( './babel.config.js' ),
		},
	},
	rules: {
		// Enforce the use of the jetpack-social textdomain.
		'@wordpress/i18n-text-domain': [
			'error',
			{
				allowedTextDomain: 'jetpack-social',
			},
		],
	},
	globals: {
		jetpackSocial: 'readonly',
	},
};
