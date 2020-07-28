/**
 * WPAnalyticsDashboardWidgetOverview component.
 *
 * Site Kit by Google, Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import {
	getTimeInSeconds,
	prepareSecondsForDisplay,
	readableLargeNumber,
	changeToPercent,
} from '../../../../util';
import {
	calculateOverviewData,
	getAnalyticsErrorMessageFromData,
	isDataZeroForReporting,
	overviewReportDataDefaults,
	userReportDataDefaults,
} from '../../util';
import PreviewBlocks from '../../../../components/preview-blocks';
import DataBlock from '../../../../components/data-block';
import CTA from '../../../../components/notifications/cta';
import withData from '../../../../components/higherorder/withdata';
import { TYPE_MODULES } from '../../../../components/data';

class WPAnalyticsDashboardWidgetOverview extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			overview: false,
			directTotalUsers: false,
			previousTotalUsers: false,
		};
	}

	// When additional data is returned, componentDidUpdate will fire.
	componentDidUpdate() {
		this.processCallbackData();
	}

	componentDidMount() {
		this.processCallbackData();
	}

	/**
	 * Process callback data received from the API.
	 */
	processCallbackData() {
		const {
			data,
			requestDataToState,
		} = this.props;

		if ( data && ! data.error && 'function' === typeof requestDataToState ) {
			this.setState( requestDataToState );
		}
	}

	render() {
		const {
			overview,
			directTotalUsers,
			previousTotalUsers,
		} = this.state;

		if ( ! overview || ! directTotalUsers ) {
			return null;
		}

		const {
			averageSessionDuration,
			averageSessionDurationChange,
		} = overview;

		const totalUsersChange = changeToPercent( previousTotalUsers, directTotalUsers );

		return (
			<Fragment>
				{ 0 === directTotalUsers
					? <div className="googlesitekit-wp-dashboard-stats__cta">
						<CTA
							title={ __( 'Analytics Gathering Data', 'google-site-kit' ) }
							description={ __( 'Analytics data is not yet available, please check back later.', 'google-site-kit' ) }
							ctaLink={ '' }
							ctaLabel={ '' }
						/>
					</div>
					: <Fragment>
						<DataBlock
							className="googlesitekit-wp-dashboard-stats__data-table overview-total-users"
							title={ __( 'Total Unique Visitors', 'google-site-kit' ) }
							datapoint={ readableLargeNumber( directTotalUsers ) }
							change={ totalUsersChange }
							changeDataUnit="%"
						/>
						<DataBlock
							className="googlesitekit-wp-dashboard-stats__data-table overview-average-session-duration"
							title={ __( 'Avg. Time on Page', 'google-site-kit' ) }
							datapoint={ prepareSecondsForDisplay( averageSessionDuration ) }
							change={ averageSessionDurationChange }
							changeDataUnit="%"
						/>
					</Fragment>
				}
			</Fragment>
		);
	}
}

export default withData(
	WPAnalyticsDashboardWidgetOverview,
	[
		{
			type: TYPE_MODULES,
			identifier: 'analytics',
			datapoint: 'report',
			data: overviewReportDataDefaults,
			priority: 1,
			maxAge: getTimeInSeconds( 'day' ),
			context: 'WPDashboard',
			toState( state, { data } ) {
				if ( ! state.overview ) {
					return {
						overview: calculateOverviewData( data ),
					};
				}
			},
		},
		{
			type: TYPE_MODULES,
			identifier: 'analytics',
			datapoint: 'report',
			data: userReportDataDefaults,
			priority: 1,
			maxAge: getTimeInSeconds( 'day' ),
			context: 'WPDashboard',
			toState( state, { data } ) {
				if ( ! state.directTotalUsers ) {
					return {
						directTotalUsers: data?.[0]?.data?.totals?.[0]?.values?.[0],
						previousTotalUsers: data?.[0]?.data?.totals?.[1]?.values?.[0],
					};
				}
			},
		},
	],
	<PreviewBlocks
		width="23%"
		height="94px"
		count={ 2 }
	/>,
	{},
	isDataZeroForReporting,
	getAnalyticsErrorMessageFromData
);
