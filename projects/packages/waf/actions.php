<?php
/**
 * Action Hooks for Jetpack WAF module.
 *
 * @package automattic/jetpack-waf
 */

namespace Automattic\Jetpack\Waf;

// We don't want to be anything in here outside WP context.
if ( ! function_exists( 'add_action' ) ) {
	return;
}

/**
 * Triggers when the Jetpack plugin is updated
 */
add_action(
	'upgrader_process_complete',
	array( __NAMESPACE__ . '\Waf_Runner', 'update_rules_if_changed' )
);

/**
 * Runs the WAF in the WP context.
 *
 * @return void
 */
add_action(
	'plugin_loaded',
	function () {
		require_once __DIR__ . '/run.php';
	}
);

add_action( 'update_option_' . Waf_Runner::IP_ALLOW_LIST_OPTION_NAME, array( Waf_Runner::class, 'activate' ), 10, 0 );
add_action( 'update_option_' . Waf_Runner::IP_BLOCK_LIST_OPTION_NAME, array( Waf_Runner::class, 'activate' ), 10, 0 );
add_action( 'update_option_' . Waf_Runner::IP_LISTS_ENABLED_OPTION_NAME, array( Waf_Runner::class, 'activate' ), 10, 0 );
