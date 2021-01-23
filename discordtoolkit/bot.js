const Discord = require("discord.js");

module.exports = class DiscordBot {
    constructor() {
        this.client = new Discord.Client();
        this.client.on('ready', () => {
            console.log(`Logged in as ${this.client.user.tag}`);
            this._ready = true;
        });
        this.client.on('error', (err) => console.log('Error: ' + err));
        this._ready = false;
        this._cooldown = 0;
        this._cache = new Discord.Collection();
    }

    /**
     * Login to Discord
     *
     * @param token bot user authentication token
     *
     * @returns Promise<void>
     */
    async start(token) {
        if (!this._ready) {
            await this.client.login(token);
        }
    }

    /**
     * Shutdown bot
     */
    destroy() {
        if (this._ready) {
            this.client.destroy();
            this._ready = false;
            this._cache = null;
            this._cooldown = 0;
        }
    }

    /**
     * Check if user is in the guild and has the role
     * It caches users and refreshes every 60 seconds (if called)
     *
     * @param guildId Snowflake of the guild
     * @param memberId Snowflake of the user
     * @param roleId Snowflake of the role
     *
     * @returns boolean if the user meets the requirements
     */
    async hasUserRole(guildId, memberId, roleId) {
        var result = false;
        if (this._ready) {
            try {
                const now = Date.now();
                var refreshCache = false;
                if (now - this._cooldown >= 60000) {
                    refreshCache = true;
                    this._cooldown = now;
                }

                var guild = await this.client.guilds.fetch(guildId, true, refreshCache);
                if (guild.available) {
                    var member;
                    if (this._cache.has(memberId)) {
                        const data = this._cache.get(memberId);
                        if (now - data.time >= 60000) {
                            data.member = await data.member.fetch(true);
                            data.time = now;
                        }
                        member = data.member;
                    } else {
                        member = await guild.members.fetch({user: memberId, cache: false, force: true});
                        this._cache.set(memberId, {time: now, member: member});
                    }
                    var result = null;
                    if (member && member.roles.cache.get(roleId)) result = true;
                }
                else if (refreshCache) console.log(`[${now}] Guild ${guildId} is currently unavailable`);
            } catch (error) {}
        }
        return result;
    }

    /**
     * Check if client entered into ready state
     *
     * @returns boolean if bot became active
     */
    isReady() {
        return this._ready;
    }
}
