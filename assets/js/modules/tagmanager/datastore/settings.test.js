/**
 * modules/tagmanager data store: settings tests.
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
import API from 'googlesitekit-api';
import { STORE_NAME, ACCOUNT_CREATE, CONTAINER_CREATE, CONTEXT_WEB, CONTEXT_AMP } from './constants';
import { STORE_NAME as CORE_SITE, AMP_MODE_SECONDARY, AMP_MODE_PRIMARY } from '../../../googlesitekit/datastore/site/constants';
import * as fixtures from './__fixtures__';
import { accountBuilder, containerBuilder } from './__factories__';
import {
	createTestRegistry,
	unsubscribeFromAll,
	muteConsole,
	muteFetch,
} from '../../../../../tests/js/utils';
import { getItem, setItem } from '../../../googlesitekit/api/cache';
import { createCacheKey } from '../../../googlesitekit/api';

describe( 'modules/tagmanager settings', () => {
	let registry;
	// selectors
	let canSubmitChanges;

	// actions
	let setSettings;
	let submitChanges;
	let receiveGetSettings;
	let receiveGetExistingTag;
	let receiveGetTagPermission;

	const validSettings = {
		accountID: '100',
		containerID: 'GTM-WEB1234',
		internalContainerID: '300',
		// ampContainerID: '',
		// internalAMPContainerID: '',
		useSnippet: true,
	};

	const validSettingsAMP = {
		accountID: '100',
		// containerID: '',
		// internalContainerID: '',
		ampContainerID: 'GTM-AMP1234',
		internalAMPContainerID: '399',
		useSnippet: true,
	};

	const WPError = {
		code: 'internal_error',
		message: 'Something wrong happened.',
		data: { status: 500 },
	};

	beforeAll( () => {
		API.setUsingCache( false );
	} );

	beforeEach( () => {
		registry = createTestRegistry();
		registry.dispatch( CORE_SITE ).receiveSiteInfo( {} );
		( {
			canSubmitChanges,
		} = registry.select( STORE_NAME ) );
		( {
			receiveGetSettings,
			receiveGetExistingTag,
			receiveGetTagPermission,
			setSettings,
			submitChanges,
		} = registry.dispatch( STORE_NAME ) );
	} );

	afterEach( () => {
		unsubscribeFromAll( registry );
	} );

	afterAll( () => {
		API.setUsingCache( true );
	} );

	function setPrimaryAMP() {
		registry.dispatch( CORE_SITE ).receiveSiteInfo( { ampMode: AMP_MODE_PRIMARY } );
	}
	function setSecondaryAMP() {
		registry.dispatch( CORE_SITE ).receiveSiteInfo( { ampMode: AMP_MODE_SECONDARY } );
	}

	describe( 'actions', () => {
		beforeEach( () => {
			// Receive empty settings to prevent unexpected fetch by resolver.
			receiveGetSettings( {} );
		} );

		describe( 'submitChanges', () => {
			describe( 'with no AMP', () => {
				it( 'dispatches fetchCreateContainer if the "set up a new container" option is chosen', async () => {
					setSettings( {
						...validSettings,
						accountID: '12345',
						containerID: CONTAINER_CREATE,
					} );
					const createdContainer = {
						...fixtures.fetchCreateContainer,
					};

					fetchMock.postOnce(
						/^\/google-site-kit\/v1\/modules\/tagmanager\/data\/create-container/,
						{ body: createdContainer, status: 200 }
					);
					fetchMock.postOnce(
						/^\/google-site-kit\/v1\/modules\/tagmanager\/data\/settings/,
						( url, opts ) => {
							const { data } = JSON.parse( opts.body );
							// Return the same settings passed to the API.
							return { body: data, status: 200 };
						}
					);

					const result = await submitChanges();

					expect( fetchMock ).toHaveFetched(
						/^\/google-site-kit\/v1\/modules\/tagmanager\/data\/create-container/,
						{
							body: {
								data: { accountID: '12345', usageContext: CONTEXT_WEB },
							},
						}
					);

					expect( result.error ).toBeFalsy();
					expect( registry.select( STORE_NAME ).getContainerID() ).toBe( createdContainer.publicId );
					expect( registry.select( STORE_NAME ).getInternalContainerID() ).toBe( createdContainer.containerId );
				} );

				it( 'handles an error if set while creating a container', async () => {
					setSettings( {
						...validSettings,
						accountID: '12345',
						containerID: CONTAINER_CREATE,
					} );

					fetchMock.postOnce(
						/^\/google-site-kit\/v1\/modules\/tagmanager\/data\/create-container/,
						{ body: WPError, status: 500 }
					);

					muteConsole( 'error' );
					await submitChanges();

					expect( fetchMock ).toHaveFetched(
						/^\/google-site-kit\/v1\/modules\/tagmanager\/data\/create-container/,
						{
							body: {
								data: { accountID: '12345', usageContext: CONTEXT_WEB },
							},
						}
					);

					expect( registry.select( STORE_NAME ).getContainerID() ).toBe( CONTAINER_CREATE );
					expect( registry.select( STORE_NAME ).getError() ).toEqual( WPError );
				} );

				it( 'dispatches saveSettings', async () => {
					setSettings( validSettings );

					fetchMock.postOnce(
						/^\/google-site-kit\/v1\/modules\/tagmanager\/data\/settings/,
						{ body: validSettings, status: 200 }
					);

					await submitChanges();

					expect( fetchMock ).toHaveFetched(
						/^\/google-site-kit\/v1\/modules\/tagmanager\/data\/settings/,
						{
							body: { data: validSettings },
						}
					);

					expect( registry.select( STORE_NAME ).haveSettingsChanged() ).toBe( false );
				} );

				it( 'returns an error if saveSettings fails', async () => {
					setSettings( validSettings );

					fetchMock.postOnce(
						/^\/google-site-kit\/v1\/modules\/tagmanager\/data\/settings/,
						{ body: WPError, status: 500 }
					);

					muteConsole( 'error' );
					const result = await submitChanges();

					expect( fetchMock ).toHaveFetched(
						/^\/google-site-kit\/v1\/modules\/tagmanager\/data\/settings/,
						{
							body: { data: validSettings },
						}
					);
					expect( result.error ).toEqual( WPError );
				} );

				it( 'invalidates module cache on success', async () => {
					setSettings( validSettings );

					muteFetch( /^\/google-site-kit\/v1\/modules\/tagmanager\/data\/settings/ );
					const cacheKey = createCacheKey( 'modules', 'tagmanager', 'arbitrary-datapoint' );
					expect( await setItem( cacheKey, 'test-value' ) ).toBe( true );
					expect( ( await getItem( cacheKey ) ).value ).not.toBeFalsy();

					await submitChanges();

					expect( ( await getItem( cacheKey ) ).value ).toBeFalsy();
				} );
			} );

			describe( 'with primary AMP', () => {
				beforeEach( () => setPrimaryAMP() );

				it( 'dispatches fetchCreateContainer if the "set up a new container" option is chosen', async () => {
					setSettings( {
						...validSettings,
						accountID: '12345',
						ampContainerID: CONTAINER_CREATE,
					} );
					const createdAMPContainer = containerBuilder( { accountId: '12345', usageContext: [ CONTEXT_AMP ] } );

					fetchMock.postOnce(
						/^\/google-site-kit\/v1\/modules\/tagmanager\/data\/create-container/,
						{ body: createdAMPContainer, status: 200 }
					);

					fetchMock.postOnce(
						/^\/google-site-kit\/v1\/modules\/tagmanager\/data\/settings/,
						( url, opts ) => {
							const { data } = JSON.parse( opts.body );
							// Return the same settings passed to the API.
							return { body: data, status: 200 };
						}
					);

					await submitChanges();

					expect( fetchMock ).toHaveFetched(
						/^\/google-site-kit\/v1\/modules\/tagmanager\/data\/create-container/,
						{
							body: {
								data: { accountID: '12345', usageContext: CONTEXT_AMP },
							},
						}
					);

					expect( registry.select( STORE_NAME ).getAMPContainerID() ).toBe( createdAMPContainer.publicId );
				} );
			} );

			describe( 'with secondary AMP', () => {
				beforeEach( () => setSecondaryAMP() );

				it( 'dispatches fetchCreateContainer for both web and AMP containers when selected', async () => {
					const account = accountBuilder();
					registry.dispatch( STORE_NAME ).setSettings( {
						...validSettings,
						containerID: CONTAINER_CREATE,
						ampContainerID: CONTAINER_CREATE,
					} );
					const createdWebContainer = containerBuilder( { accountId: account.accountId, usageContext: [ CONTEXT_WEB ] } );
					const createdAMPContainer = containerBuilder( { accountId: account.accountId, usageContext: [ CONTEXT_AMP ] } );

					fetchMock.postOnce(
						{
							url: /^\/google-site-kit\/v1\/modules\/tagmanager\/data\/create-container/,
							body: { data: { usageContext: CONTEXT_WEB } },
						},
						{ body: createdWebContainer, status: 200 },
						{ matchPartialBody: true }
					);
					fetchMock.postOnce(
						{
							url: /^\/google-site-kit\/v1\/modules\/tagmanager\/data\/create-container/,
							body: { data: { usageContext: CONTEXT_AMP } },
						},
						{ body: createdAMPContainer, status: 200 },
						{ matchPartialBody: true }
					);
					fetchMock.postOnce(
						/^\/google-site-kit\/v1\/modules\/tagmanager\/data\/settings/,
						( url, opts ) => {
							const { data } = JSON.parse( opts.body );
							// Return the same settings passed to the API.
							return { body: data, status: 200 };
						}
					);

					const { error } = await submitChanges();

					expect( error ).toBe( undefined );
					expect( registry.select( STORE_NAME ).getContainerID() ).toBe( createdWebContainer.publicId );
					expect( registry.select( STORE_NAME ).getAMPContainerID() ).toBe( createdAMPContainer.publicId );
				} );
			} );
		} );
	} );

	describe( 'selectors', () => {
		describe( 'isDoingSubmitChanges', () => {
			it( 'returns true while submitting changes', async () => {
				const { haveSettingsChanged, isDoingSubmitChanges } = registry.select( STORE_NAME );
				receiveGetSettings( validSettings );

				expect( haveSettingsChanged() ).toBe( false );
				expect( isDoingSubmitChanges() ).toBe( false );

				const promise = submitChanges();

				expect( isDoingSubmitChanges() ).toBe( true );

				await promise;

				expect( isDoingSubmitChanges() ).toBe( false );
			} );
		} );

		describe( 'canSubmitChanges', () => {
			describe( 'with no AMP', () => {
				beforeEach( () => {
					setSettings( validSettings );
					receiveGetExistingTag( null );
				} );

				it( 'requires a valid accountID', () => {
					expect( canSubmitChanges() ).toBe( true );

					registry.dispatch( STORE_NAME ).setAccountID( '0' );

					expect( canSubmitChanges() ).toBe( false );
				} );

				it( 'requires a valid containerID', () => {
					expect( canSubmitChanges() ).toBe( true );

					registry.dispatch( STORE_NAME ).setContainerID( '0' );

					expect( canSubmitChanges() ).toBe( false );
				} );

				it( 'requires a valid internal container ID', () => {
					expect( canSubmitChanges() ).toBe( true );

					registry.dispatch( STORE_NAME ).setInternalContainerID( '0' );

					expect( canSubmitChanges() ).toBe( false );
				} );

				it( 'requires permissions for an existing tag when present', () => {
					receiveGetExistingTag( validSettings.containerID );
					receiveGetTagPermission( { permission: true }, { containerID: validSettings.containerID } );

					expect( registry.select( STORE_NAME ).canSubmitChanges() ).toBe( true );

					receiveGetTagPermission( { permission: false }, { containerID: validSettings.containerID } );

					expect( canSubmitChanges() ).toBe( false );
				} );

				it( 'supports creating a web container', () => {
					registry.dispatch( STORE_NAME ).setContainerID( CONTAINER_CREATE );

					expect( canSubmitChanges() ).toBe( true );
				} );

				it( 'does not support creating an account', () => {
					registry.dispatch( STORE_NAME ).setAccountID( ACCOUNT_CREATE );

					expect( canSubmitChanges() ).toBe( false );
				} );
			} );

			describe( 'with primary AMP', () => {
				beforeEach( () => {
					setPrimaryAMP();
					setSettings( validSettingsAMP );
					receiveGetExistingTag( null );
				} );

				it( 'requires a valid accountID', () => {
					expect( canSubmitChanges() ).toBe( true );

					registry.dispatch( STORE_NAME ).setAccountID( '0' );

					expect( canSubmitChanges() ).toBe( false );
				} );

				it( 'requires a valid AMP containerID', () => {
					expect( canSubmitChanges() ).toBe( true );

					// Invalid web container ID is allowed (although technically not possible).
					registry.dispatch( STORE_NAME ).setContainerID( '0' );
					expect( canSubmitChanges() ).toBe( true );

					registry.dispatch( STORE_NAME ).setAMPContainerID( '0' );

					expect( canSubmitChanges() ).toBe( false );
				} );

				it( 'requires a valid internal AMP container ID', () => {
					expect( canSubmitChanges() ).toBe( true );

					// Invalid internal web container ID is allowed (although technically not possible).
					registry.dispatch( STORE_NAME ).setInternalContainerID( '0' );
					expect( canSubmitChanges() ).toBe( true );

					registry.dispatch( STORE_NAME ).setInternalAMPContainerID( '0' );

					expect( canSubmitChanges() ).toBe( false );
				} );

				it( 'supports creating an AMP container', () => {
					registry.dispatch( STORE_NAME ).setAMPContainerID( CONTAINER_CREATE );
					registry.dispatch( STORE_NAME ).setInternalAMPContainerID( '' );

					expect( canSubmitChanges() ).toBe( true );
				} );

				it( 'requires permissions for an existing tag when present', () => {
					receiveGetExistingTag( validSettings.containerID );
					receiveGetTagPermission( { permission: true }, { containerID: validSettings.containerID } );

					expect( registry.select( STORE_NAME ).canSubmitChanges() ).toBe( true );

					receiveGetTagPermission( { permission: false }, { containerID: validSettings.containerID } );

					expect( canSubmitChanges() ).toBe( false );
				} );

				it( 'does not support creating an account', () => {
					registry.dispatch( STORE_NAME ).setAccountID( ACCOUNT_CREATE );

					expect( canSubmitChanges() ).toBe( false );
				} );
			} );

			describe( 'with secondary AMP', () => {
				beforeEach( () => {
					setSecondaryAMP();
					setSettings( {
						...validSettings,
						...validSettingsAMP,
					} );
					receiveGetExistingTag( null );
				} );

				it( 'requires a valid accountID', () => {
					expect( canSubmitChanges() ).toBe( true );

					registry.dispatch( STORE_NAME ).setAccountID( '0' );

					expect( canSubmitChanges() ).toBe( false );
				} );

				it( 'requires valid containerID', () => {
					expect( canSubmitChanges() ).toBe( true );

					registry.dispatch( STORE_NAME ).setContainerID( '0' );

					expect( canSubmitChanges() ).toBe( false );
				} );

				it( 'requires a valid AMP containerID', () => {
					expect( canSubmitChanges() ).toBe( true );

					registry.dispatch( STORE_NAME ).setAMPContainerID( '0' );

					expect( canSubmitChanges() ).toBe( false );
				} );

				it( 'requires a valid internal container ID', () => {
					expect( canSubmitChanges() ).toBe( true );

					registry.dispatch( STORE_NAME ).setInternalContainerID( '0' );

					expect( canSubmitChanges() ).toBe( false );
				} );

				it( 'requires a valid internal AMP container ID', () => {
					expect( canSubmitChanges() ).toBe( true );

					registry.dispatch( STORE_NAME ).setInternalAMPContainerID( '0' );

					expect( canSubmitChanges() ).toBe( false );
				} );

				it( 'supports creating a web container', () => {
					registry.dispatch( STORE_NAME ).setContainerID( CONTAINER_CREATE );
					registry.dispatch( STORE_NAME ).setInternalContainerID( '' );

					expect( canSubmitChanges() ).toBe( true );
				} );

				it( 'supports creating an AMP container', () => {
					registry.dispatch( STORE_NAME ).setAMPContainerID( CONTAINER_CREATE );
					registry.dispatch( STORE_NAME ).setInternalAMPContainerID( '' );

					expect( canSubmitChanges() ).toBe( true );
				} );

				it( 'supports creating an AMP container and a web container', () => {
					registry.dispatch( STORE_NAME ).setContainerID( CONTAINER_CREATE );
					registry.dispatch( STORE_NAME ).setInternalContainerID( '' );
					registry.dispatch( STORE_NAME ).setAMPContainerID( CONTAINER_CREATE );
					registry.dispatch( STORE_NAME ).setInternalAMPContainerID( '' );

					expect( canSubmitChanges() ).toBe( true );
				} );

				it( 'requires permissions for an existing tag when present', () => {
					receiveGetExistingTag( validSettings.containerID );
					receiveGetTagPermission( { permission: true }, { containerID: validSettings.containerID } );

					expect( registry.select( STORE_NAME ).canSubmitChanges() ).toBe( true );

					receiveGetTagPermission( { permission: false }, { containerID: validSettings.containerID } );

					expect( canSubmitChanges() ).toBe( false );
				} );

				it( 'does not support creating an account', () => {
					registry.dispatch( STORE_NAME ).setAccountID( ACCOUNT_CREATE );

					expect( canSubmitChanges() ).toBe( false );
				} );
			} );
		} );
	} );
} );
