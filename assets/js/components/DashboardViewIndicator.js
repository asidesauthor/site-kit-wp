/**
 * DashboardViewIndicator component.
 *
 * Site Kit by Google, Copyright 2023 Google LLC
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

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import Badge from './Badge';
import { MODULES_ANALYTICS } from '../modules/analytics/datastore/constants';
import whenActive from '../util/when-active';
import { useFeature } from '../hooks/useFeature';
const { useSelect } = Data;

const DashboardViewIndicator = () => {
	const ga4ReportingEnabled = useFeature( 'ga4Reporting' );
	const isGA4DashboardView = useSelect( ( select ) =>
		select( MODULES_ANALYTICS ).isGA4DashboardView()
	);

	if ( ! ga4ReportingEnabled || isGA4DashboardView === undefined ) {
		return null;
	}

	const badgeLabel = isGA4DashboardView
		? __( 'Google Analytics 4 view', 'google-site-kit' )
		: __( 'Universal Analytics view', 'google-site-kit' );

	return (
		<div className="googlesitekit-dashboard-view-indicator__wrapper">
			<Badge
				className="googlesitekit-dashboard-view-indicator__badge"
				label={ badgeLabel }
			/>
		</div>
	);
};

export default whenActive( { moduleName: 'analytics' } )(
	DashboardViewIndicator
);
