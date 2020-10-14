/**
 * Tag Manager container names component.
 *
 * Site Kit by Google, Copyright 2020 Google LLC
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
import Data from 'googlesitekit-data';
import { AMPContainerNameTextField, WebContainerNameTextField } from '../common';
import { CONTAINER_CREATE, STORE_NAME } from '../../datastore/constants';
const { useSelect } = Data;

export default function ContainerNames() {
	const containerID = useSelect( ( select ) => select( STORE_NAME ).getContainerID() );
	const ampContainerID = useSelect( ( select ) => select( STORE_NAME ).getAMPContainerID() );

	if ( containerID !== CONTAINER_CREATE && ampContainerID !== CONTAINER_CREATE ) {
		return null;
	}

	return (
		<div className="googlesitekit-setup-module__inputs">
			{ containerID === CONTAINER_CREATE && <WebContainerNameTextField /> }
			{ ampContainerID === CONTAINER_CREATE && <AMPContainerNameTextField /> }
		</div>
	);
}
