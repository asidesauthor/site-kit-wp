/**
 * DashboardSharingSettings Footer component.
 *
 * Site Kit by Google, Copyright 2022 Google LLC
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
import { useCallback, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import Link from '../../Link';
import Button from '../../Button';
import Notice from './Notice';
import { CORE_MODULES } from '../../../googlesitekit/modules/datastore/constants';
import { CORE_UI } from '../../../googlesitekit/datastore/ui/constants';
import Spinner from '../../Spinner';
import {
	EDITING_MANAGEMENT_KEY,
	EDITING_USER_ROLES_KEY,
	SHARING_SETINGS_SAVING_KEY,
	SHARING_SETTINGS_SLUG_KEY,
} from './constants';
import ErrorText from '../../ErrorText';
const { useSelect, useDispatch } = Data;

export default function Footer( { closeDialog } ) {
	const [ errorNotice, setErrorNotice ] = useState( null );
	const canSubmitSharingChanges = useSelect( ( select ) =>
		select( CORE_MODULES ).canSubmitSharingChanges()
	);
	const isSaving = useSelect( ( select ) =>
		select( CORE_UI ).getValue( SHARING_SETINGS_SAVING_KEY )
	);

	const { saveSharingSettings } = useDispatch( CORE_MODULES );
	const { setValue } = useDispatch( CORE_UI );

	const onApply = useCallback( async () => {
		setValue( SHARING_SETINGS_SAVING_KEY, true );
		const { error } = await saveSharingSettings();

		if ( error ) {
			setErrorNotice( error.message );
		} else {
			// Reset the state to enable modules in when not editing or saving.
			setValue( SHARING_SETTINGS_SLUG_KEY, undefined );
			setValue( EDITING_USER_ROLES_KEY, false );
			setValue( EDITING_MANAGEMENT_KEY, false );

			closeDialog();
		}
		// Reset saving state when there is an error or not.
		setValue( SHARING_SETINGS_SAVING_KEY, false );
	}, [ saveSharingSettings, setValue, closeDialog ] );

	// TODO: Clear error state after another change has been made.

	return (
		<div className="googlesitekit-dashboard-sharing-settings__footer">
			<div className="googlesitekit-dashboard-sharing-settings__footer-notice">
				{ errorNotice && <ErrorText message={ errorNotice } /> }
				{ ! errorNotice && <Notice /> }
			</div>

			<div className="googlesitekit-dashboard-sharing-settings__footer-actions">
				<Link onClick={ closeDialog }>
					{ __( 'Cancel', 'google-site-kit' ) }
				</Link>

				<Button
					onClick={ onApply }
					disabled={ isSaving || ! canSubmitSharingChanges }
				>
					{ __( 'Apply', 'google-site-kit' ) }
					{ isSaving && <Spinner isSaving={ isSaving } /> }
				</Button>
			</div>
		</div>
	);
}

Footer.propTypes = {
	closeDialog: PropTypes.func.isRequired,
};
