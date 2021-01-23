const { AuthorizationCode } = require('simple-oauth2');
const Wreck = require('@hapi/wreck');

async function HttpGet(token, url) {
	const httpOptions = {
		json: 'strict',
		redirects: 0,
		timeout: 10000,
		headers: {
			Authorization: `Bearer ${token}`
		}
	};

	const client = Wreck.defaults(httpOptions);
    const response = await client.get(url);
    return response.payload;
}

class DiscordResources {
	constructor(accessToken) {
		this.accessToken = accessToken;
	}

	async getUser() {
		var response;
		try {
			response = await HttpGet(this.accessToken.token.access_token, "https://discord.com/api/users/@me");
		} catch (error) {}
		return response;
	}

	async revokeAccess() {
		try {
			await this.accessToken.revokeAll();
		} catch (error) {}
	}
}

module.exports = class DiscordApi {
	constructor(config, callback) {
		this.callback = callback;
		this.client = Object.freeze(new AuthorizationCode({
			client: config,
			auth: {
				tokenHost: 'https://discord.com/api',
				tokenPath: '/api/oauth2/token',
				revokePath: '/api/oauth2/token/revoke',
				authorizePath: '/oauth2/authorize'
			},
			options: {
				authorizationMethod: "body"
			}
		}));
	}

	createRequest(id) {
		const authUrl = this.client.authorizeURL({
			redirect_uri: this.callback,
			scope: 'identify',
			state: id
		});
		return authUrl;
	}

	async continueRequest(code) {
		const response = {
			result: true,
			object: null
		};

		try {
			const accessToken = await this.client.getToken({
				code,
				redirect_uri: this.callback,
				scope: 'identify'
			});
			response.object = new DiscordResources(accessToken);
		} catch (error) {
			response.object = error;
			response.result = false;
		}

		return response;
	}
}
