/**
 * WidgetRenderer component tests.
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
import WidgetRenderer from './WidgetRenderer';
import {
	VIEW_CONTEXT_DASHBOARD,
	VIEW_CONTEXT_DASHBOARD_VIEW_ONLY,
} from '../../../googlesitekit/constants';
import { CORE_WIDGETS } from '../datastore/constants';
import { provideModules, render } from '../../../../../tests/js/test-utils';

const setupRegistry = ( {
	Component = () => <div>Test</div>,
	wrapWidget = false,
	recoverableModules = [],
} = {} ) => {
	return ( registry ) => {
		const { dispatch } = registry;

		provideModules(
			registry,
			recoverableModules.map( ( slug ) => ( {
				slug,
				recoverable: true,
			} ) )
		);

		dispatch( CORE_WIDGETS ).registerWidgetArea( 'dashboard-header', {
			title: 'Dashboard Header',
			subtitle: 'Cool stuff for yoursite.com',
			style: 'boxes',
		} );
		dispatch( CORE_WIDGETS ).assignWidgetArea(
			'dashboard-header',
			'dashboard'
		);
		dispatch( CORE_WIDGETS ).registerWidget( 'TestWidget', {
			Component,
			wrapWidget,
			modules: [ 'search-console', 'pagespeed-insights' ],
		} );
		dispatch( CORE_WIDGETS ).assignWidget(
			'TestWidget',
			'dashboard-header'
		);
	};
};

describe( 'WidgetRenderer', () => {
	it( 'should output children directly', async () => {
		const { container } = render( <WidgetRenderer slug="TestWidget" />, {
			setupRegistry: setupRegistry(),
		} );

		expect( Object.values( container.firstChild.classList ) ).toEqual( [] );
		expect( container.firstChild ).toMatchSnapshot();
	} );

	it( 'should wrap children when wrapWidget is true', () => {
		const { container } = render( <WidgetRenderer slug="TestWidget" />, {
			setupRegistry: setupRegistry( { wrapWidget: true } ),
		} );

		expect( Object.values( container.firstChild.classList ) ).toEqual( [
			'googlesitekit-widget',
			'googlesitekit-widget--TestWidget',
		] );

		expect( container.firstChild ).toMatchSnapshot();
	} );

	it( 'should output null when no slug is found', async () => {
		const { container } = render( <WidgetRenderer slug="NotFound" />, {
			setupRegistry: setupRegistry(),
		} );

		expect( container.firstChild ).toEqual( null );
	} );

	it( 'should output the recoverable modules component when the widget depends on a recoverable module in view-only mode', async () => {
		const { getByText, waitForRegistry } = render(
			<WidgetRenderer slug="TestWidget" />,
			{
				setupRegistry: setupRegistry( {
					recoverableModules: [ 'search-console' ],
				} ),
				viewContext: VIEW_CONTEXT_DASHBOARD_VIEW_ONLY,
				features: [ 'dashboardSharing' ],
			}
		);

		await waitForRegistry();

		expect(
			getByText(
				/Search Console data was previously shared by an admin who no longer has access/
			)
		).toBeInTheDocument();
	} );

	it( 'should output the recoverable modules component when the widget depends on multiple recoverable modules in view-only mode', async () => {
		const { getByText, waitForRegistry } = render(
			<WidgetRenderer slug="TestWidget" />,
			{
				setupRegistry: setupRegistry( {
					recoverableModules: [
						'search-console',
						'pagespeed-insights',
					],
				} ),
				viewContext: VIEW_CONTEXT_DASHBOARD_VIEW_ONLY,
				features: [ 'dashboardSharing' ],
			}
		);

		await waitForRegistry();

		expect(
			getByText(
				/The data for the following modules was previously shared by an admin who no longer has access: Search Console, PageSpeed Insights/
			)
		).toBeInTheDocument();
	} );

	it( 'should not output the recoverable modules component when the widget depends on a recoverable module and is not in view-only mode ', async () => {
		const { getByText, queryByText, waitForRegistry } = render(
			<WidgetRenderer slug="TestWidget" />,
			{
				setupRegistry: setupRegistry( {
					recoverableModules: [ 'search-console' ],
				} ),
				viewContext: VIEW_CONTEXT_DASHBOARD,
				features: [ 'dashboardSharing' ],
			}
		);

		await waitForRegistry();

		expect(
			queryByText(
				/Search Console data was previously shared by an admin who no longer has access/
			)
		).toBeNull();

		expect( getByText( 'Test' ) ).toBeInTheDocument();
	} );
} );
