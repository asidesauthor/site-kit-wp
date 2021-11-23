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
import { render } from '../../../tests/js/test-utils';
import DashboardNavigation from './DashboardNavigation';

describe( 'Dashboard Navigation', () => {
	const { container } = render( <DashboardNavigation /> );

	it( 'is a choices chip set', () => {
		expect( container.firstChild ).toHaveClass( 'mdc-chip-set--choice' );
	} );

	it( 'has no default selection', () => {
		expect( container.querySelector( '.mdc-chip--selected' ) ).toBeNull();
	} );
} );