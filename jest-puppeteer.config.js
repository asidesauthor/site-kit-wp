/**
 * Puppeteer config.
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

const config = require( '@wordpress/scripts/config/puppeteer.config.js' );

const coreConfig = config || {};
const coreLaunch = coreConfig.launch || {};
const coreLaunchArgs = coreLaunch.args || [];

module.exports = {
	...coreConfig,
	launch: {
		...coreLaunch,
		args: [
			// https://peter.sh/experiments/chromium-command-line-switches/
			...coreLaunchArgs,
			'--disable-gpu',
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-dev-shm-usage',
			'--disable-web-security', // Fixes SSL issues that may happen on when you run e2e localy.
		],
	},
};
