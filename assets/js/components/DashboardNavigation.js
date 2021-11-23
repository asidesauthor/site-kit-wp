/**
 * DashboardNavigation component.
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
 * External dependencies
 */
import { ChipSet, Chip } from '@material/react-chips';

/**
 * WordPress dependencies
 */
import { useCallback, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { removeQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import {
	ANCHOR_ID_CONTENT,
	ANCHOR_ID_MONETIZATION,
	ANCHOR_ID_SPEED,
	ANCHOR_ID_TRAFFIC,
} from '../googlesitekit/constants';
import { CORE_WIDGETS } from '../googlesitekit/widgets/datastore/constants';
import {
	CONTEXT_ENTITY_DASHBOARD_TRAFFIC,
	CONTEXT_ENTITY_DASHBOARD_CONTENT,
	CONTEXT_ENTITY_DASHBOARD_SPEED,
	CONTEXT_ENTITY_DASHBOARD_MONETIZATION,
	CONTEXT_MAIN_DASHBOARD_TRAFFIC,
	CONTEXT_MAIN_DASHBOARD_CONTENT,
	CONTEXT_MAIN_DASHBOARD_SPEED,
	CONTEXT_MAIN_DASHBOARD_MONETIZATION,
} from '../googlesitekit/widgets/default-contexts';
import useDashboardType, {
	DASHBOARD_TYPE_MAIN,
} from '../hooks/useDashboardType';
import { useBreakpoint } from '../hooks/useBreakpoint';

const { useSelect } = Data;

/**
 * Gets the y coordinate to scroll to the top of a context element, taking the sticky admin bar, header and navigation height into account.
 *
 * @since n.e.x.t
 *
 * @param {string} contextID  The ID of the context element to scroll to.
 * @param {string} breakpoint The current breakpoint.
 * @return {number} The offset to scroll to.
 */
const getContextScrollTop = ( contextID, breakpoint ) => {
	if ( contextID === 'traffic' ) {
		return 0;
	}

	const contextTop = document
		.getElementById( contextID )
		.getBoundingClientRect().top;

	const header = document.querySelector( '.googlesitekit-header' );

	const hasStickyAdminBar = breakpoint !== 'small';

	const headerHeight = hasStickyAdminBar
		? header.getBoundingClientRect().bottom
		: header.offsetHeight;

	const navigationHeight = document.querySelector(
		'.googlesitekit-navigation'
	).offsetHeight;

	return contextTop + global.scrollY - headerHeight - navigationHeight;
};

export default function DashboardNavigation() {
	const dashboardType = useDashboardType();

	const showTraffic = useSelect( ( select ) =>
		select( CORE_WIDGETS ).isWidgetContextActive(
			dashboardType === DASHBOARD_TYPE_MAIN
				? CONTEXT_MAIN_DASHBOARD_TRAFFIC
				: CONTEXT_ENTITY_DASHBOARD_TRAFFIC
		)
	);

	const showContent = useSelect( ( select ) =>
		select( CORE_WIDGETS ).isWidgetContextActive(
			dashboardType === DASHBOARD_TYPE_MAIN
				? CONTEXT_MAIN_DASHBOARD_CONTENT
				: CONTEXT_ENTITY_DASHBOARD_CONTENT
		)
	);

	const showSpeed = useSelect( ( select ) =>
		select( CORE_WIDGETS ).isWidgetContextActive(
			dashboardType === DASHBOARD_TYPE_MAIN
				? CONTEXT_MAIN_DASHBOARD_SPEED
				: CONTEXT_ENTITY_DASHBOARD_SPEED
		)
	);

	const showMonitization = useSelect( ( select ) =>
		select( CORE_WIDGETS ).isWidgetContextActive(
			dashboardType === DASHBOARD_TYPE_MAIN
				? CONTEXT_MAIN_DASHBOARD_MONETIZATION
				: CONTEXT_ENTITY_DASHBOARD_MONETIZATION
		)
	);

	const [ selectedIds, setSelectedIds ] = useState( [] );
	const breakpoint = useBreakpoint();

	const handleSelect = useCallback(
		( selections ) => {
			const [ hash ] = selections;
			if ( hash ) {
				global.history.replaceState( {}, '', `#${ hash }` );

				global.scrollTo( {
					top: getContextScrollTop( hash, breakpoint ),
					behavior: 'smooth',
				} );
			} else {
				global.history.replaceState(
					{},
					'',
					removeQueryArgs( global.location.href )
				);
			}
			setSelectedIds( selections );
		},
		[ breakpoint ]
	);

	return (
		<ChipSet
			className="googlesitekit-navigation"
			selectedChipIds={ selectedIds }
			handleSelect={ handleSelect }
			choice
		>
			{ showTraffic && (
				<Chip
					id={ ANCHOR_ID_TRAFFIC }
					label={ __( 'Traffic', 'google-site-kit' ) }
				/>
			) }
			{ showContent && (
				<Chip
					id={ ANCHOR_ID_CONTENT }
					label={ __( 'Content', 'google-site-kit' ) }
				/>
			) }
			{ showSpeed && (
				<Chip
					id={ ANCHOR_ID_SPEED }
					label={ __( 'Speed', 'google-site-kit' ) }
				/>
			) }
			{ showMonitization && (
				<Chip
					id={ ANCHOR_ID_MONETIZATION }
					label={ __( 'Monetization', 'google-site-kit' ) }
				/>
			) }
		</ChipSet>
	);
}