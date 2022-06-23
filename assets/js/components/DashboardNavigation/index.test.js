/**
 * DashboardNavigation component tests.
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
 * Internal dependencies
 */
import { render } from '../../../../tests/js/test-utils';
import {
	VIEW_CONTEXT_DASHBOARD,
	VIEW_CONTEXT_DASHBOARD_VIEW_ONLY,
} from '../../googlesitekit/constants';
import { CORE_MODULES } from '../../googlesitekit/modules/datastore/constants';
import { CORE_WIDGETS } from '../../googlesitekit/widgets/datastore/constants';
import {
	CONTEXT_MAIN_DASHBOARD_CONTENT,
	CONTEXT_MAIN_DASHBOARD_SPEED,
	CONTEXT_MAIN_DASHBOARD_TRAFFIC,
} from '../../googlesitekit/widgets/default-contexts';
import DashboardNavigation from './';

/**
 * Dispatches required actions to registry to make sure widget contexts for Traffic, Content & Speed are active.
 *
 * @since 1.47.0
 *
 * @param {Object} registry The registry object.
 */
export const setupDefaultChips = ( registry ) => {
	// Traffic
	registry.dispatch( CORE_WIDGETS ).registerWidgetArea( 'TrafficArea', {
		title: 'Traffic',
		subtitle: 'Traffic Widget Area',
		style: 'composite',
	} );
	registry
		.dispatch( CORE_WIDGETS )
		.assignWidgetArea( 'TrafficArea', CONTEXT_MAIN_DASHBOARD_TRAFFIC );
	registry.dispatch( CORE_WIDGETS ).registerWidget( 'TrafficWidget', {
		Component: () => <div>Traffic Widget</div>,
	} );
	registry
		.dispatch( CORE_WIDGETS )
		.assignWidget( 'TrafficWidget', 'TrafficArea' );

	// Content
	registry.dispatch( CORE_WIDGETS ).registerWidgetArea( 'ContentArea', {
		title: 'Content',
		subtitle: 'Content Widget Area',
		style: 'composite',
	} );
	registry
		.dispatch( CORE_WIDGETS )
		.assignWidgetArea( 'ContentArea', CONTEXT_MAIN_DASHBOARD_CONTENT );
	registry.dispatch( CORE_WIDGETS ).registerWidget( 'ContentWidget', {
		Component: () => <div>Content Widget</div>,
	} );
	registry
		.dispatch( CORE_WIDGETS )
		.assignWidget( 'ContentWidget', 'ContentArea' );

	// Speed
	registry.dispatch( CORE_WIDGETS ).registerWidgetArea( 'SpeedArea', {
		title: 'Speed',
		subtitle: 'Speed Widget Area',
		style: 'composite',
	} );
	registry
		.dispatch( CORE_WIDGETS )
		.assignWidgetArea( 'SpeedArea', CONTEXT_MAIN_DASHBOARD_SPEED );
	registry.dispatch( CORE_WIDGETS ).registerWidget( 'SpeedWidget', {
		Component: () => <div>Speed Widget</div>,
	} );
	registry
		.dispatch( CORE_WIDGETS )
		.assignWidget( 'SpeedWidget', 'SpeedArea' );
};

describe( 'Dashboard Navigation', () => {
	it( 'has a chip set', () => {
		const { container } = render( <DashboardNavigation /> );

		expect( container.firstChild ).toHaveClass( 'mdc-chip-set' );
	} );

	it( 'has no default selection', () => {
		const { container } = render( <DashboardNavigation /> );

		expect( container.querySelector( '.mdc-chip--selected' ) ).toBeNull();
	} );

	it( 'always uses `ANCHOR_ID_TRAFFIC` as the default chip when not viewing a shared dashboard', async () => {
		global._googlesitekitUserData = {
			permissions: {
				googlesitekit_view_dashboard: true,
				googlesitekit_manage_options: true,
				'googlesitekit_manage_module_sharing_options::["search-console"]': true,
				'googlesitekit_read_shared_module_data::["search-console"]': true,
				'googlesitekit_read_shared_module_data::["analytics"]': false,
			},
		};

		const { container } = render( <DashboardNavigation />, {
			setupRegistry: ( registry ) => {
				registry.dispatch( CORE_MODULES ).receiveGetModules( [
					{
						slug: 'search-console',
						name: 'Search Console',
						shareable: true,
					},
					{
						slug: 'pagespeed-insights',
						name: 'PageSpeed Insights',
						shareable: true,
					},
				] );

				setupDefaultChips( registry );
			},
			viewContext: VIEW_CONTEXT_DASHBOARD,
		} );

		expect(
			container.querySelector( '.mdc-chip--selected' )
		).toHaveTextContent( 'Traffic' );
	} );

	it( 'uses `ANCHOR_ID_TRAFFIC` as the chip viewing a shared dashboard with the traffic section enabled', () => {
		global._googlesitekitUserData = {
			permissions: {
				googlesitekit_view_dashboard: true,
				googlesitekit_manage_options: true,
				'googlesitekit_manage_module_sharing_options::["search-console"]': true,
				'googlesitekit_read_shared_module_data::["search-console"]': true,
				'googlesitekit_read_shared_module_data::["analytics"]': false,
			},
		};

		const { container } = render( <DashboardNavigation />, {
			setupRegistry: ( registry ) => {
				registry.dispatch( CORE_MODULES ).receiveGetModules( [
					{
						slug: 'search-console',
						name: 'Search Console',
						shareable: true,
					},
					{
						slug: 'pagespeed-insights',
						name: 'PageSpeed Insights',
						shareable: true,
					},
				] );

				setupDefaultChips( registry );
			},
			viewContext: VIEW_CONTEXT_DASHBOARD_VIEW_ONLY,
		} );

		expect(
			container.querySelector( '.mdc-chip--selected' )
		).toHaveTextContent( 'Traffic' );
	} );
} );
