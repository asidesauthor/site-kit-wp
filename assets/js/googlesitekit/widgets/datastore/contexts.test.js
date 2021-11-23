/**
 * `core/widgets` data store: widget context tests.
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
import { createTestRegistry } from '../../../../../tests/js/utils';
import { CORE_WIDGETS } from './constants';
import Null from '../../../components/Null';

describe( 'core/widgets Widget contexts', () => {
	let registry;

	beforeEach( () => {
		registry = createTestRegistry();
	} );

	describe( 'selectors', () => {
		describe( 'isWidgetContextActive', () => {
			beforeEach( () => {
				// Setup the first test area.
				registry
					.dispatch( CORE_WIDGETS )
					.registerWidgetArea( 'TestArea1', {
						title: 'Test Header 1',
						subtitle: 'Cool stuff for yoursite.com',
						style: 'composite',
					} );

				registry
					.dispatch( CORE_WIDGETS )
					.assignWidgetArea( 'TestArea1', 'TestContext' );

				registry
					.dispatch( CORE_WIDGETS )
					.registerWidget( 'TestWidget1', {
						Component: () => <div>Test Widget 1</div>,
					} );

				registry
					.dispatch( CORE_WIDGETS )
					.assignWidget( 'TestWidget1', 'TestArea1' );

				// Setup the second test area.
				registry
					.dispatch( CORE_WIDGETS )
					.registerWidgetArea( 'TestArea2', {
						title: 'Test Header 2',
						subtitle: 'More cool stuff for yoursite.com',
						style: 'composite',
					} );

				registry
					.dispatch( CORE_WIDGETS )
					.assignWidgetArea( 'TestArea2', 'TestContext' );

				registry
					.dispatch( CORE_WIDGETS )
					.registerWidget( 'TestWidget2', {
						Component: () => <div>Test Widget 2</div>,
					} );

				registry
					.dispatch( CORE_WIDGETS )
					.assignWidget( 'TestWidget2', 'TestArea2' );
			} );

			it( 'requires a contextSlug', () => {
				expect( () => {
					registry.select( CORE_WIDGETS ).isWidgetContextActive();
				} ).toThrow(
					'contextSlug is required to check a widget context is active.'
				);
			} );

			it( 'returns false if there are no areas registered for the context', () => {
				expect(
					registry
						.select( CORE_WIDGETS )
						.isWidgetContextActive( 'UnregisteredTestContext' )
				).toBe( false );
			} );

			it( 'returns true when the context areas are active', () => {
				expect(
					registry
						.select( CORE_WIDGETS )
						.isWidgetContextActive( 'TestContext' )
				).toBe( true );
			} );

			it( 'returns true when at least one context area is active', () => {
				registry
					.dispatch( CORE_WIDGETS )
					.setWidgetState( 'TestWidget1', Null, {} );

				expect(
					registry
						.select( CORE_WIDGETS )
						.isWidgetContextActive( 'TestContext' )
				).toBe( true );
			} );

			it( 'returns false when none of the context areas are active', () => {
				registry
					.dispatch( CORE_WIDGETS )
					.setWidgetState( 'TestWidget1', Null, {} );

				registry
					.dispatch( CORE_WIDGETS )
					.setWidgetState( 'TestWidget2', Null, {} );

				expect(
					registry
						.select( CORE_WIDGETS )
						.isWidgetContextActive( 'TestContext' )
				).toBe( false );
			} );
		} );
	} );
} );