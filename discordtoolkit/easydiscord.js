const DiscordApi = require('./discordapi');

module.exports = class EasyDiscord {
    /**
     *
     * @param config configuration table ({id, secret})
     * @param callback server authorize url callback
     *
     */
    constructor(config, callback) {
        this.discord = new DiscordApi(config, callback);
    }

    /**
     * Redirect to Discord authorization site
     *
     * @param req Request object (from express package)
     * @param res Response object (from express package)
     *
     */
    request(req, res) {
        res.redirect(this.discord.createRequest(req.sessionID));
    }

    /**
     * Redirect to Discord authorization site
     *
     * @param req Request object (from express package)
     *
     * @returns full response information
     */
    async response(req) {
        const { code, state, error, error_description } = req.query;
        const result = {
            result: false,
            cancel_by_user: false,
            invalid_state: false,
            no_code: false,
            auth: false,
			object: null
        };
        if (error) {
            if (error === 'access_denied')
                result.cancel_by_user = true;
            else {
                result.auth = true;
                result.object = {error, error_description};
            }
        } else if (!code) result.no_code = true;
        else if (state === req.sessionID) {
            const response = await this.discord.continueRequest(code);
            if (response.result) {
                const user = await response.object.getUser();
                await response.object.revokeAccess();
                result.result = true;
                result.object = user;
            }
        } else result.invalid_state = true;
        return result;
    }
}
