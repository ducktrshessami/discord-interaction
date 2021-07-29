const phin = require("phin");

class FollowupMessage {
    constructor(interaction, data) {
        Object.defineProperties(this, {
            client: {
                value: interaction.client,
                enumerable: true
            },
            interaction: {
                value: interaction,
                enumerable: true
            },
            id: {
                value: data.id,
                enumerable: true
            }
        });
        interaction.followups.cache.set(data.id, this);
    }

    edit(content, options) {

    }

    async delete() {
        if (!this.deleted) {
            return phin({
                url: `https://discord.com/api/v8/webhooks/${this.client.user.id}/${this.interaction._token}/messages/${this.id}`,
                method: "DELETE"
            })
                .then(res => {
                    if ((res.statusCode >= 200 && res.statusCode < 300) || res.statusCode === 404) {
                        this.deleted = true;
                    }
                    else {
                        throw new Error(`${res.statusCode} ${res.statusMessage}`);
                    }
                });
        }
    }
}

module.exports = FollowupMessage;
