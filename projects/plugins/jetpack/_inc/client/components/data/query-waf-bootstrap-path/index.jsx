/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchWafSettings, isFetchingWafSettings } from 'state/waf';
import { isOfflineMode } from 'state/connection';

class QueryWafSettings extends Component {
	static propTypes = {
		isFetchingWafSettings: PropTypes.bool,
		isOfflineMode: PropTypes.bool,
	};

	static defaultProps = {
		isFetchingWafSettings: false,
		isOfflineMode: false,
	};

	componentDidMount() {
		if ( ! this.props.isFetchingWafSettings && ! this.props.isOfflineMode ) {
			this.props.fetchWafSettings();
		}
	}

	render() {
		return null;
	}
}

export default connect(
	state => {
		return {
			isFetchingWafSettings: isFetchingWafSettings( state ),
			isOfflineMode: isOfflineMode( state ),
		};
	},
	dispatch => {
		return {
			fetchWafSettings: () => dispatch( fetchWafSettings() ),
		};
	}
)( QueryWafSettings );
