/**
 * External dependencies
 */
import { assign } from 'lodash';

/**
 * Helps create new custom error classes to better notify upper layers.
 *
 * @param {string} name - the Error name that will be availble in Error.name
 * @returns {Error}      a new custom error class.
 */
function createCustomError( name ) {
	class CustomError extends Error {
		constructor( ...args ) {
			super( ...args );
			this.name = name;
		}
	}
	return CustomError;
}

export const JsonParseError = createCustomError( 'JsonParseError' );
export const JsonParseAfterRedirectError = createCustomError( 'JsonParseAfterRedirectError' );
export const Api404Error = createCustomError( 'Api404Error' );
export const Api404AfterRedirectError = createCustomError( 'Api404AfterRedirectError' );
export const FetchNetworkError = createCustomError( 'FetchNetworkError' );

/**
 * Create a Jetpack Rest Api Client
 *
 * @param {string} root - The API root
 * @param {string} nonce - The API Nonce
 */
function JetpackRestApiClient( root, nonce ) {
	let apiRoot = root,
		headers = {
			'X-WP-Nonce': nonce,
		},
		getParams = {
			credentials: 'same-origin',
			headers,
		},
		postParams = {
			method: 'post',
			credentials: 'same-origin',
			headers: assign( {}, headers, {
				'Content-type': 'application/json',
			} ),
		},
		cacheBusterCallback = addCacheBuster;

	const methods = {
		setApiRoot( newRoot ) {
			apiRoot = newRoot;
		},
		setApiNonce( newNonce ) {
			headers = {
				'X-WP-Nonce': newNonce,
			};
			getParams = {
				credentials: 'same-origin',
				headers: headers,
			};
			postParams = {
				method: 'post',
				credentials: 'same-origin',
				headers: assign( {}, headers, {
					'Content-type': 'application/json',
				} ),
			};
		},
		setCacheBusterCallback: callback => {
			cacheBusterCallback = callback;
		},

		fetchSiteConnectionStatus: () =>
			getRequest( `${ apiRoot }jetpack/v4/connection`, getParams ).then( parseJsonResponse ),

		fetchSiteConnectionTest: () =>
			getRequest( `${ apiRoot }jetpack/v4/connection/test`, getParams )
				.then( checkStatus )
				.then( parseJsonResponse ),

		fetchUserConnectionData: () =>
			getRequest( `${ apiRoot }jetpack/v4/connection/data`, getParams ).then( parseJsonResponse ),

		fetchUserTrackingSettings: () =>
			getRequest( `${ apiRoot }jetpack/v4/tracking/settings`, getParams )
				.then( checkStatus )
				.then( parseJsonResponse ),

		updateUserTrackingSettings: newSettings =>
			postRequest( `${ apiRoot }jetpack/v4/tracking/settings`, postParams, {
				body: JSON.stringify( newSettings ),
			} )
				.then( checkStatus )
				.then( parseJsonResponse ),

		disconnectSite: () =>
			postRequest( `${ apiRoot }jetpack/v4/connection`, postParams, {
				body: JSON.stringify( { isActive: false } ),
			} )
				.then( checkStatus )
				.then( parseJsonResponse ),

		fetchConnectUrl: () =>
			getRequest( `${ apiRoot }jetpack/v4/connection/url`, getParams )
				.then( checkStatus )
				.then( parseJsonResponse ),

		unlinkUser: () =>
			postRequest( `${ apiRoot }jetpack/v4/connection/user`, postParams, {
				body: JSON.stringify( { linked: false } ),
			} )
				.then( checkStatus )
				.then( parseJsonResponse ),

		reconnect: () =>
			postRequest( `${ apiRoot }jetpack/v4/connection/reconnect`, postParams )
				.then( checkStatus )
				.then( parseJsonResponse ),

		fetchConnectedPlugins: () =>
			getRequest( `${ apiRoot }jetpack/v4/connection/plugins`, getParams )
				.then( checkStatus )
				.then( parseJsonResponse ),

		fetchModules: () =>
			getRequest( `${ apiRoot }jetpack/v4/module/all`, getParams )
				.then( checkStatus )
				.then( parseJsonResponse ),

		fetchModule: slug =>
			getRequest( `${ apiRoot }jetpack/v4/module/${ slug }`, getParams )
				.then( checkStatus )
				.then( parseJsonResponse ),

		activateModule: slug =>
			postRequest( `${ apiRoot }jetpack/v4/module/${ slug }/active`, postParams, {
				body: JSON.stringify( { active: true } ),
			} )
				.then( checkStatus )
				.then( parseJsonResponse ),

		deactivateModule: slug =>
			postRequest( `${ apiRoot }jetpack/v4/module/${ slug }/active`, postParams, {
				body: JSON.stringify( { active: false } ),
			} ),

		updateModuleOptions: ( slug, newOptionValues ) =>
			postRequest( `${ apiRoot }jetpack/v4/module/${ slug }`, postParams, {
				body: JSON.stringify( newOptionValues ),
			} )
				.then( checkStatus )
				.then( parseJsonResponse ),

		updateSettings: newOptionValues =>
			postRequest( `${ apiRoot }jetpack/v4/settings`, postParams, {
				body: JSON.stringify( newOptionValues ),
			} )
				.then( checkStatus )
				.then( parseJsonResponse ),

		getProtectCount: () =>
			getRequest( `${ apiRoot }jetpack/v4/module/protect/data`, getParams )
				.then( checkStatus )
				.then( parseJsonResponse ),

		resetOptions: options =>
			postRequest( `${ apiRoot }jetpack/v4/options/${ options }`, postParams, {
				body: JSON.stringify( { reset: true } ),
			} )
				.then( checkStatus )
				.then( parseJsonResponse ),

		activateVaultPress: () =>
			postRequest( `${ apiRoot }jetpack/v4/plugins`, postParams, {
				body: JSON.stringify( { slug: 'vaultpress', status: 'active' } ),
			} )
				.then( checkStatus )
				.then( parseJsonResponse ),

		getVaultPressData: () =>
			getRequest( `${ apiRoot }jetpack/v4/module/vaultpress/data`, getParams )
				.then( checkStatus )
				.then( parseJsonResponse ),

		installPlugin: ( slug, source ) => {
			const props = { slug, status: 'active' };

			if ( source ) {
				props.source = source;
			}

			return postRequest( `${ apiRoot }jetpack/v4/plugins`, postParams, {
				body: JSON.stringify( props ),
			} )
				.then( checkStatus )
				.then( parseJsonResponse );
		},

		activateAkismet: () =>
			postRequest( `${ apiRoot }jetpack/v4/plugins`, postParams, {
				body: JSON.stringify( { slug: 'akismet', status: 'active' } ),
			} )
				.then( checkStatus )
				.then( parseJsonResponse ),

		getAkismetData: () =>
			getRequest( `${ apiRoot }jetpack/v4/module/akismet/data`, getParams )
				.then( checkStatus )
				.then( parseJsonResponse ),

		checkAkismetKey: () =>
			getRequest( `${ apiRoot }jetpack/v4/module/akismet/key/check`, getParams )
				.then( checkStatus )
				.then( parseJsonResponse ),

		checkAkismetKeyTyped: apiKey =>
			postRequest( `${ apiRoot }jetpack/v4/module/akismet/key/check`, postParams, {
				body: JSON.stringify( { api_key: apiKey } ),
			} )
				.then( checkStatus )
				.then( parseJsonResponse ),

		fetchStatsData: range =>
			getRequest( statsDataUrl( range ), getParams )
				.then( checkStatus )
				.then( parseJsonResponse )
				.then( handleStatsResponseError ),

		getPluginUpdates: () =>
			getRequest( `${ apiRoot }jetpack/v4/updates/plugins`, getParams )
				.then( checkStatus )
				.then( parseJsonResponse ),

		getPlans: () =>
			getRequest( `${ apiRoot }jetpack/v4/plans`, getParams )
				.then( checkStatus )
				.then( parseJsonResponse ),

		fetchSettings: () =>
			getRequest( `${ apiRoot }jetpack/v4/settings`, getParams )
				.then( checkStatus )
				.then( parseJsonResponse ),

		updateSetting: updatedSetting =>
			postRequest( `${ apiRoot }jetpack/v4/settings`, postParams, {
				body: JSON.stringify( updatedSetting ),
			} )
				.then( checkStatus )
				.then( parseJsonResponse ),

		fetchSiteData: () =>
			getRequest( `${ apiRoot }jetpack/v4/site`, getParams )
				.then( checkStatus )
				.then( parseJsonResponse )
				.then( body => JSON.parse( body.data ) ),

		fetchSiteFeatures: () =>
			getRequest( `${ apiRoot }jetpack/v4/site/features`, getParams )
				.then( checkStatus )
				.then( parseJsonResponse )
				.then( body => JSON.parse( body.data ) ),

		fetchSiteProducts: () =>
			getRequest( `${ apiRoot }jetpack/v4/site/products`, getParams )
				.then( checkStatus )
				.then( parseJsonResponse ),

		fetchSitePurchases: () =>
			getRequest( `${ apiRoot }jetpack/v4/site/purchases`, getParams )
				.then( checkStatus )
				.then( parseJsonResponse )
				.then( body => JSON.parse( body.data ) ),

		fetchSiteBenefits: () =>
			getRequest( `${ apiRoot }jetpack/v4/site/benefits`, getParams )
				.then( checkStatus )
				.then( parseJsonResponse )
				.then( body => JSON.parse( body.data ) ),

		fetchSetupQuestionnaire: () =>
			getRequest( `${ apiRoot }jetpack/v4/setup/questionnaire`, getParams )
				.then( checkStatus )
				.then( parseJsonResponse ),

		fetchRecommendationsData: () =>
			getRequest( `${ apiRoot }jetpack/v4/recommendations/data`, getParams )
				.then( checkStatus )
				.then( parseJsonResponse ),

		fetchRecommendationsUpsell: () =>
			getRequest( `${ apiRoot }jetpack/v4/recommendations/upsell`, getParams )
				.then( checkStatus )
				.then( parseJsonResponse ),

		saveRecommendationsData: data =>
			postRequest( `${ apiRoot }jetpack/v4/recommendations/data`, postParams, {
				body: JSON.stringify( { data } ),
			} ).then( checkStatus ),

		fetchProducts: () =>
			getRequest( `${ apiRoot }jetpack/v4/products`, getParams )
				.then( checkStatus )
				.then( parseJsonResponse ),

		fetchRewindStatus: () =>
			getRequest( `${ apiRoot }jetpack/v4/rewind`, getParams )
				.then( checkStatus )
				.then( parseJsonResponse )
				.then( body => JSON.parse( body.data ) ),

		fetchScanStatus: () =>
			getRequest( `${ apiRoot }jetpack/v4/scan`, getParams )
				.then( checkStatus )
				.then( parseJsonResponse )
				.then( body => JSON.parse( body.data ) ),

		dismissJetpackNotice: notice =>
			postRequest( `${ apiRoot }jetpack/v4/notice/${ notice }`, postParams, {
				body: JSON.stringify( { dismissed: true } ),
			} )
				.then( checkStatus )
				.then( parseJsonResponse ),

		fetchPluginsData: () =>
			getRequest( `${ apiRoot }jetpack/v4/plugins`, getParams )
				.then( checkStatus )
				.then( parseJsonResponse ),

		fetchVerifySiteGoogleStatus: keyringId => {
			const request =
				keyringId !== null
					? getRequest( `${ apiRoot }jetpack/v4/verify-site/google/${ keyringId }`, getParams )
					: getRequest( `${ apiRoot }jetpack/v4/verify-site/google`, getParams );

			return request.then( checkStatus ).then( parseJsonResponse );
		},

		verifySiteGoogle: keyringId =>
			postRequest( `${ apiRoot }jetpack/v4/verify-site/google`, postParams, {
				body: JSON.stringify( { keyring_id: keyringId } ),
			} )
				.then( checkStatus )
				.then( parseJsonResponse ),

		sendMobileLoginEmail: () =>
			postRequest( `${ apiRoot }jetpack/v4/mobile/send-login-email`, postParams )
				.then( checkStatus )
				.then( parseJsonResponse ),

		submitSurvey: surveyResponse =>
			postRequest( `${ apiRoot }jetpack/v4/marketing/survey`, postParams, {
				body: JSON.stringify( surveyResponse ),
			} )
				.then( checkStatus )
				.then( parseJsonResponse ),

		saveSetupQuestionnaire: props =>
			postRequest( `${ apiRoot }jetpack/v4/setup/questionnaire`, postParams, {
				body: JSON.stringify( props ),
			} )
				.then( checkStatus )
				.then( parseJsonResponse ),

		updateLicensingError: props =>
			postRequest( `${ apiRoot }jetpack/v4/licensing/error`, postParams, {
				body: JSON.stringify( props ),
			} )
				.then( checkStatus )
				.then( parseJsonResponse ),

		updateLicenseKey: license =>
			postRequest( `${ apiRoot }jetpack/v4/licensing/set-license`, postParams, {
				body: JSON.stringify( { license } ),
			} )
				.then( checkStatus )
				.then( parseJsonResponse ),

		updateRecommendationsStep: step =>
			postRequest( `${ apiRoot }jetpack/v4/recommendations/step`, postParams, {
				body: JSON.stringify( { step } ),
			} ).then( checkStatus ),
	};

	/**
	 * The default callback to add a cachebuster parameter to route
	 *
	 * @param {string} route - the route
	 * @returns {string} - the route with the cachebuster appended
	 */
	function addCacheBuster( route ) {
		const parts = route.split( '?' ),
			query = parts.length > 1 ? parts[ 1 ] : '',
			args = query.length ? query.split( '&' ) : [];

		args.push( '_cacheBuster=' + new Date().getTime() );

		return parts[ 0 ] + '?' + args.join( '&' );
	}

	/**
	 * Generate a request promise for the route and params. Automatically adds a cachebuster.
	 *
	 * @param {string} route - the route
	 * @param {object} params - the params
	 * @returns {Promise<Response>} - the http request promise
	 */
	function getRequest( route, params ) {
		return fetch( cacheBusterCallback( route ), params );
	}

	/**
	 * Generate a POST request promise for the route and params. Automatically adds a cachebuster.
	 *
	 * @param {string} route - the route
	 * @param {object} params - the params
	 * @param {string} body - the body
	 * @returns {Promise<Response>} - the http response promise
	 */
	function postRequest( route, params, body ) {
		return fetch( route, assign( {}, params, body ) ).catch( catchNetworkErrors );
	}

	/**
	 * Returns the stats data URL for the given date range
	 *
	 * @param {string} range - the range
	 * @returns {string} - the stats URL
	 */
	function statsDataUrl( range ) {
		let url = `${ apiRoot }jetpack/v4/module/stats/data`;
		if ( url.indexOf( '?' ) !== -1 ) {
			url = url + `&range=${ encodeURIComponent( range ) }`;
		} else {
			url = url + `?range=${ encodeURIComponent( range ) }`;
		}
		return url;
	}

	/**
	 * Returns stats data if possible, otherwise an empty object
	 *
	 * @param {object} statsData - the stats data or error
	 * @returns {object} - the handled stats data
	 */
	function handleStatsResponseError( statsData ) {
		// If we get a .response property, it means that .com's response is errory.
		// Probably because the site does not have stats yet.
		const responseOk =
			( statsData.general && statsData.general.response === undefined ) ||
			( statsData.week && statsData.week.response === undefined ) ||
			( statsData.month && statsData.month.response === undefined );
		return responseOk ? statsData : {};
	}

	assign( this, methods );
}

const restApi = new JetpackRestApiClient();

export default restApi;

/**
 * Check the status of the response. Throw an error if it was not OK
 *
 * @param {Response} response - the API response
 * @returns {Promise<object>} - a promise to return the parsed JSON body as an object
 */
function checkStatus( response ) {
	// Regular success responses
	if ( response.status >= 200 && response.status < 300 ) {
		return response;
	}

	if ( response.status === 404 ) {
		return new Promise( () => {
			const err = response.redirected
				? new Api404AfterRedirectError( response.redirected )
				: new Api404Error();
			throw err;
		} );
	}

	return response
		.json()
		.catch( e => catchJsonParseError( e ) )
		.then( json => {
			const error = new Error( `${ json.message } (Status ${ response.status })` );
			error.response = json;
			error.name = 'ApiError';
			throw error;
		} );
}

/**
 * Parse the JSON response
 *
 * @param {Response} response - the response object
 * @returns {Promise<object>} - promise to return the parsed json object
 */
function parseJsonResponse( response ) {
	return response.json().catch( e => catchJsonParseError( e, response.redirected, response.url ) );
}

/**
 * Throw appropriate exception given an API error
 *
 * @param {Error} e - the error
 * @param {boolean} redirected - are we being redirected?
 * @param {string} url - the URL that returned the error
 */
function catchJsonParseError( e, redirected, url ) {
	const err = redirected ? new JsonParseAfterRedirectError( url ) : new JsonParseError();
	throw err;
}

/**
 * Catches TypeError coming from the Fetch API implementation
 */
function catchNetworkErrors() {
	//Either one of:
	// * A preflight error like a redirection to an external site (which results in a CORS)
	// * A preflight error like ERR_TOO_MANY_REDIRECTS
	throw new FetchNetworkError();
}