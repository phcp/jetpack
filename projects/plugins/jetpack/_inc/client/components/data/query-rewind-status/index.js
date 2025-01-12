/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchRewindStatus, isFetchingRewindStatus } from 'state/rewind';
import { isOfflineMode } from 'state/connection';

class QueryRewindStatus extends Component {
	static propTypes = {
		isFetchingRewindStatus: PropTypes.bool,
		isOfflineMode: PropTypes.bool,
	};

	static defaultProps = {
		isFetchingRewindStatus: false,
		isOfflineMode: false,
	};

	UNSAFE_componentWillMount() {
		if ( ! this.props.isFetchingRewindStatus && ! this.props.isOfflineMode ) {
			this.props.fetchRewind();
		}
	}

	render() {
		return null;
	}
}

export default connect(
	state => {
		return {
			isFetchingRewindStatus: isFetchingRewindStatus( state ),
			isOfflineMode: isOfflineMode( state ),
		};
	},
	dispatch => {
		return {
			fetchRewind: () => dispatch( fetchRewindStatus() ),
		};
	}
)( QueryRewindStatus );
