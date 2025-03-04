/**
 * BannerNotifications component.
 *
 * Site Kit by Google, Copyright 2021 Google LLC
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
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import { useFeature } from '../../hooks/useFeature';
import { CORE_MODULES } from '../../googlesitekit/modules/datastore/constants';
import { CORE_USER } from '../../googlesitekit/datastore/user/constants';
import {
	GTM_SCOPE,
	MODULES_ANALYTICS_4,
} from '../../modules/analytics-4/datastore/constants';
import useQueryArg from '../../hooks/useQueryArg';
import SetupSuccessBannerNotification from './SetupSuccessBannerNotification';
import CoreSiteBannerNotifications from './CoreSiteBannerNotifications';
import ModuleRecoveryAlert from '../dashboard-sharing/ModuleRecoveryAlert';
import AdSenseAlerts from './AdSenseAlerts';
import ActivationBanner from '../../modules/analytics-4/components/dashboard/ActivationBanner';
import EnhancedMeasurementActivationBanner from '../../modules/analytics-4/components/dashboard/EnhancedMeasurementActivationBanner';
import useViewOnly from '../../hooks/useViewOnly';
import ZeroDataStateNotifications from './ZeroDataStateNotifications';
import EnableAutoUpdateBannerNotification from './EnableAutoUpdateBannerNotification';
import GoogleTagIDMismatchNotification from './GoogleTagIDMismatchNotification';
import SwitchedToGA4Banner from './SwitchedToGA4Banner';
import WebDataStreamNotAvailableNotification from './WebDataStreamNotAvailableNotification';
import AdBlockingRecoverySetupSuccessBannerNotification from './AdBlockingRecoverySetupSuccessBannerNotification';

const { useSelect } = Data;

export default function BannerNotifications() {
	const enhancedMeasurementEnabled = useFeature( 'enhancedMeasurement' );
	const ga4ReportingEnabled = useFeature( 'ga4Reporting' );

	const viewOnly = useViewOnly();

	const isAuthenticated = useSelect( ( select ) =>
		select( CORE_USER ).isAuthenticated()
	);
	const adSenseModuleActive = useSelect( ( select ) =>
		select( CORE_MODULES ).isModuleActive( 'adsense' )
	);

	const analyticsModuleConnected = useSelect( ( select ) =>
		select( CORE_MODULES ).isModuleConnected( 'analytics' )
	);
	const ga4ModuleConnected = useSelect( ( select ) =>
		select( CORE_MODULES ).isModuleConnected( 'analytics-4' )
	);
	const hasGTMScope = useSelect( ( select ) =>
		select( CORE_USER ).hasScope( GTM_SCOPE )
	);

	const hasMismatchedGoogleTagID = useSelect( ( select ) =>
		select( MODULES_ANALYTICS_4 ).hasMismatchedGoogleTagID()
	);

	const isGA4ModuleOwner = useSelect( ( select ) => {
		// Bail early if we're in view-only dashboard or the GA4 module is not connected.
		if ( viewOnly || ! ga4ModuleConnected ) {
			return false;
		}

		const ga4OwnerID = select( MODULES_ANALYTICS_4 ).getOwnerID();

		const loggedInUserID = select( CORE_USER ).getID();

		if ( ga4OwnerID === undefined || loggedInUserID === undefined ) {
			return undefined;
		}

		return ga4OwnerID === loggedInUserID;
	} );

	const [ notification ] = useQueryArg( 'notification' );

	if ( viewOnly ) {
		return <ZeroDataStateNotifications />;
	}

	return (
		<Fragment>
			{ 'authentication_success' === notification && (
				<SetupSuccessBannerNotification />
			) }
			{ 'ad_blocking_recovery_setup_success' === notification && (
				<AdBlockingRecoverySetupSuccessBannerNotification />
			) }
			<EnableAutoUpdateBannerNotification />
			{ isAuthenticated && <CoreSiteBannerNotifications /> }
			<ModuleRecoveryAlert />
			{ ga4ReportingEnabled &&
				analyticsModuleConnected &&
				ga4ModuleConnected && <SwitchedToGA4Banner /> }
			<ActivationBanner />
			{ enhancedMeasurementEnabled && (
				<EnhancedMeasurementActivationBanner />
			) }
			{ ga4ModuleConnected && hasGTMScope && isGA4ModuleOwner && (
				<Fragment>
					{ hasMismatchedGoogleTagID && (
						<GoogleTagIDMismatchNotification />
					) }
					<WebDataStreamNotAvailableNotification />
				</Fragment>
			) }
			<ZeroDataStateNotifications />
			{ adSenseModuleActive && <AdSenseAlerts /> }
		</Fragment>
	);
}
