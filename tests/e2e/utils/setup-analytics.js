/**
 * Internal dependencies
 */
import { wpApiFetch } from './wp-api-fetch';

const defaultSettings = {
	accountId: 100,
	propertyId: 200,
	profileId: 300,
	internalWebPropertyId: 400,
	useSnippet: true,
	// ampClientIdOptIn: (bool)
};

/**
 * Activate and set up the Analytics module.
 * @param {Object} settingsOverrides Optional settings to override the defaults.
 */
export async function setupAnalytics( settingsOverrides = {} ) {
	const settings = {
		...defaultSettings,
		...settingsOverrides,
	};
	// Activate the module.
	await wpApiFetch( {
		method: 'post',
		path: 'google-site-kit/v1/modules/analytics',
		data: { active: true },
	} );
	// Set dummy connection data.
	await wpApiFetch( {
		method: 'post',
		path: 'google-site-kit/v1/modules/analytics/data/settings',
		data: {
			data: settings,
		},
		parse: false,
	} );
}