/**
 * Data mock tests.
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
 * Internal dependencies
 */
import { getAnalytics4MockResponse } from './data-mock';

describe( 'getAnalytics4MockResponse', () => {
	it( 'throws if called without report options', () => {
		expect( () => getAnalytics4MockResponse() ).toThrow(
			'report options are required'
		);
	} );

	it( 'throws if called without a valid startDate', () => {
		expect( () =>
			getAnalytics4MockResponse( { startDate: 'not-a-date' } )
		).toThrow( 'a valid startDate is required' );
	} );

	it( 'throws if called without a valid endDate', () => {
		expect( () =>
			getAnalytics4MockResponse( {
				endDate: 'not-a-date',
				startDate: '2020-12-31',
			} )
		).toThrow( 'a valid endDate is required' );
	} );

	it( 'generates a valid report with no compare dates', () => {
		const report = getAnalytics4MockResponse( {
			startDate: '2020-12-31',
			endDate: '2021-01-27',
			metrics: [
				{
					expression: 'sessions',
				},
				{
					expression: 'newUsers',
				},
			],
			dimensions: [ 'date' ],
		} );

		expect( report[ 0 ].rows ).toHaveLength( 28 );
	} );

	it( 'generates a valid report', () => {
		const report = getAnalytics4MockResponse( {
			startDate: '2020-12-31',
			endDate: '2021-01-27',
			compareStartDate: '2020-12-03',
			compareEndDate: '2020-12-30',
			metrics: [
				{
					expression: 'totalUsers',
					alias: 'Total Users',
				},
			],
			dimensions: [ 'date' ],
		} );

		expect( report[ 0 ].rows ).toHaveLength( 56 );
	} );
} );
