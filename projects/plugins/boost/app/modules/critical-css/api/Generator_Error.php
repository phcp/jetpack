<?php

namespace Automattic\Jetpack_Boost\Modules\Critical_CSS\API;

use Automattic\Jetpack_Boost\Lib\Nonce;
use Automattic\Jetpack_Boost\Modules\Critical_CSS\Critical_CSS_Storage;
use Automattic\Jetpack_Boost\Modules\Critical_CSS\Generate\Generator;

class Generator_Error extends Boost_API {

	public function methods() {
		return \WP_REST_Server::EDITABLE;
	}

	/**
	 * Handler for PUT '/critical-css/(?P<cacheKey>.+)/error'.
	 *
	 * @param \WP_REST_Request $request The request object.
	 *
	 * @return \WP_REST_Response|\WP_Error The response.
	 * @todo: Figure out what to do in the JavaScript when responding with the error status.
	 */
	public function response( $request ) {

		// @TODO:
		//		$this->ensure_module_initialized();
		/**
		 * This used to be a thing here:
		 * if ( true !== $this->is_initialized ) {
		 * wp_send_json( array( 'status' => 'module-unavailable' ) );
		 * }
		 */

		$cache_key = $request['cacheKey'];
		$params    = $request->get_params();

		if ( empty( $params['passthrough'] ) || empty( $params['passthrough']['_nonce'] ) ) {
			return rest_ensure_response(
				array(
					'status' => 'error',
					'code'   => 'missing_nonce',
				)
			);
		}

		$cache_key_nonce = $params['passthrough']['_nonce'];

		if ( ! Nonce::verify( $cache_key_nonce, Generator::CSS_CALLBACK_ACTION ) ) {
			return rest_ensure_response(
				array(
					'status' => 'error',
					'code'   => 'invalid_nonce',
				)
			);
		}

		if ( ! isset( $params['data'] ) ) {
			// Set status to error, because the data is missing.
			return rest_ensure_response(
				array(
					'status' => 'error',
					'code'   => 'missing_data',
				)
			);
		}

		$data = $params['data'];

		if ( ! isset( $data['show_stopper'] ) ) {
			// Set status to error, because the data is invalid.
			return rest_ensure_response(
				array(
					'status' => 'error',
					'code'   => 'invalid_data',
				)
			);
		}

		$storage   = new Critical_CSS_Storage();
		$generator = new Generator();

		if ( true === $data['show_stopper'] ) {
			// TODO: Review it seems a bit cumbersome the validation of the data structure here.
			if ( ! isset( $data['error'] ) ) {
				// Set status to error, because the data is invalid.
				return rest_ensure_response(
					array(
						'status' => 'error',
						'code'   => 'invalid_data',
					)
				);
			}

			$generator->state->set_as_failed( $data['error'] );
			$storage->clear();
		} else {
			// TODO: Review it seems a bit cumbersome the validation of the data structure here.
			if ( ! isset( $data['urls'] ) ) {
				// Set status to error, because the data is invalid.
				return rest_ensure_response(
					array(
						'status' => 'error',
						'code'   => 'invalid_data',
					)
				);
			}

			// otherwise, store the error at the provider level, allowing the UI to display them with all details.
			$generator->state->set_source_error( $cache_key, $data['urls'] );
		}

		// Set status to success to indicate the critical CSS error has been stored on the server.
		return rest_ensure_response(
			array(
				'status'        => 'success',
				'code'          => 'processed',
				'status_update' => $generator->get_critical_css_status(),
			)
		);
	}

	public function perrmisions() {
		return true;
	}

	protected function endpoint() {
		return '(?P<cacheKey>.+)/error';
	}
}