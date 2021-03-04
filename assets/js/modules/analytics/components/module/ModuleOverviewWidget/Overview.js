/**
 * Overview component the ModuleOverviewWidget widget.
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
import PropTypes from 'prop-types';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { Grid, Row, Cell } from '../../../../../material-components';
import DataBlock from '../../../../../components/DataBlock';
import { calculateChange } from '../../../../../util';

export default function Overview( props ) {
	const {
		users,
		sessions,
		bounce,
		duration,
		selectedStat,
		handleStatSelection,
	} = props;

	const getDatapointAndChange = ( [ report ], divider = 1 ) => ( {
		datapoint: report?.data?.totals?.[0]?.values?.[0] / divider,
		change: calculateChange(
			report?.data?.totals?.[1]?.values?.[0],
			report?.data?.totals?.[0]?.values?.[0],
		),
	} );

	const dataBlocks = [
		{
			title: __( 'Users', 'google-site-kit' ),
			className: 'googlesitekit-data-block--users googlesitekit-data-block--button-1',
			...getDatapointAndChange( users ),
		},
		{
			title: __( 'Sessions', 'google-site-kit' ),
			className: 'googlesitekit-data-block--sessions googlesitekit-data-block--button-2',
			...getDatapointAndChange( sessions ),
		},
		{
			title: __( 'Bounce Rate', 'google-site-kit' ),
			className: 'googlesitekit-data-block--bounce googlesitekit-data-block--button-3',
			datapointUnit: '%',
			invertChangeColor: true,
			...getDatapointAndChange( bounce, 100 ),
		},
		{
			title: __( 'Session Duration', 'google-site-kit' ),
			className: 'googlesitekit-data-block--duration googlesitekit-data-block--button-4',
			datapointUnit: 's',
			...getDatapointAndChange( duration ),
		},
	];

	return (
		<Grid>
			<Row>
				{ dataBlocks.map( ( block, i ) => (
					<Cell key={ i } smSize={ 2 } mdSize={ 2 } lgSize={ 3 }>
						<DataBlock
							stat={ i }
							className={ block.className }
							title={ block.title }
							datapoint={ block.datapoint }
							change={ block.change }
							changeDataUnit="%"
							context="button"
							selected={ selectedStat === i }
							handleStatSelection={ handleStatSelection }
							datapointUnit={ block.datapointUnit }
							invertChangeColor={ block.invertChangeColor }
						/>
					</Cell>
				) ) }
			</Row>
		</Grid>
	);
}

Overview.propTypes = {
	users: PropTypes.arrayOf( PropTypes.object ).isRequired,
	sessions: PropTypes.arrayOf( PropTypes.object ).isRequired,
	bounce: PropTypes.arrayOf( PropTypes.object ).isRequired,
	duration: PropTypes.arrayOf( PropTypes.object ).isRequired,
	selectedStat: PropTypes.number.isRequired,
	handleStatSelection: PropTypes.func.isRequired,
};
