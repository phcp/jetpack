<?php
/**
 * A class that adds a search dashboard to wp-admin.
 *
 * @package automattic/jetpack
 */

/**
 * Requires files needed.
 */
require_once JETPACK__PLUGIN_DIR . '_inc/lib/admin-pages/class.jetpack-admin-page.php';
require_once JETPACK__PLUGIN_DIR . '_inc/lib/admin-pages/class-jetpack-redux-state-helper.php';

/**
 * Responsible for adding a search dashboard to wp-admin.
 *
 * @package Automattic\Jetpack\Search
 */
class Jetpack_Search_Setting_Page extends Jetpack_Admin_Page {
	/**
	 * Show the settings page only when Jetpack is connected or in dev mode.
	 *
	 * @var bool If the page should be shown.
	 */
	protected $dont_show_if_not_active = true;

	/**
	 * Add page specific actions given the page hook.
	 *
	 * @param {object} $hook The page hook.
	 */
	public function add_page_actions( $hook ) {}

	/**
	 * Create a menu item for the page and returns the hook.
	 */
	public function get_page_hook() {
		return add_submenu_page(
			'jetpack',
			__( 'Search Settings', 'jetpack' ),
			__( 'Search', 'jetpack' ),
			'manage_options',
			'jetpack-search',
			array( $this, 'render' ),
			$this->get_link_offset()
		);  }

	/**
	 * Enqueue and localize page specific scripts
	 */
	public function page_admin_scripts() {
		$this->load_admin_styles();
		$this->load_admin_scripts();
	}

	/**
	 * Override render funtion
	 */
	public function render() {
		$this->page_render();
	}

	/**
	 * Render Search setting elements
	 */
	public function page_render() {
		$protocol   = is_ssl() ? 'https' : 'http';
		$static_url = apply_filters( 'jetpack_static_url', "{$protocol}://en.wordpress.com/i/loading/loading-64.gif" );
		?>
		<div id="jp-search-dashboard" class="jp-search-dashboard">
			<div class="hide-if-no-js"><img class="jp-search-loader" width="32" height="32" alt="<?php esc_attr_e( 'Loading&hellip;', 'jetpack' ); ?>" src="<?php echo esc_url( $static_url ); ?>" /></div>
			<div class="hide-if-js"><?php esc_html_e( 'Your Search dashboard requires JavaScript to function properly.', 'jetpack' ); ?></div>
		</div>
		<?php
	}

	/**
	 * Place the Jetpack Search menu item at the bottom of the Jetpack submenu.
	 *
	 * @return int Menu offset.
	 */
	private function get_link_offset() {
		global $submenu;
		return count( $submenu['jetpack'] );
	}

	/**
	 * Enqueue admin styles.
	 */
	public function load_admin_styles() {
		\Jetpack_Admin_Page::load_wrapper_styles();

		wp_enqueue_style(
			'jp-search-dashboard',
			plugins_url( '_inc/build/search-dashboard.css', JETPACK__PLUGIN_FILE ),
			array(),
			JETPACK__VERSION
		);
	}

	/**
	 * Enqueue admin scripts.
	 */
	public function load_admin_scripts() {
		$script_deps_path    = JETPACK__PLUGIN_DIR . '_inc/build/search-dashboard.asset.php';
		$script_dependencies = array( 'react', 'react-dom', 'wp-polyfill' );
		if ( file_exists( $script_deps_path ) ) {
			$asset_manifest      = include $script_deps_path;
			$script_dependencies = $asset_manifest['dependencies'];
		}

		wp_enqueue_script(
			'jp-search-dashboard',
			plugins_url( '_inc/build/search-dashboard.js', JETPACK__PLUGIN_FILE ),
			$script_dependencies,
			JETPACK__VERSION,
			true
		);

		// Add objects to be passed to the initial state of the app.
		// Use wp_add_inline_script instead of wp_localize_script, see https://core.trac.wordpress.org/ticket/25280.
		wp_add_inline_script(
			'jp-search-dashboard',
			'var Initial_State=JSON.parse(decodeURIComponent("' . rawurlencode( wp_json_encode( \Jetpack_Redux_State_Helper::get_initial_state() ) ) . '"));',
			'before'
		);
	}
}