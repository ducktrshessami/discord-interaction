const { Message } = require("discord.js");
const phin = require("phin");
const parseMessageOptions = require("../utils/parseMessageOptions");

const ResponseDataFlags = {
    EPHEMERAL: 1 << 6
}

class FollowupMessage extends Message {
    constructor(client, data, interaction, channel) {
        super(client, data, channel);
        Object.defineProperty(this, "interaction", {
            value: interaction,
            enumerable: true
        });
    }

    async edit(content, options) {
        if (!this.deleted) {
            return phin({
                url: `https://discord.com/api/v8/webhooks/${this.client.user.id}/${this.interaction._token}/messages/${this.id}`,
                method: "PATCH",
                data: FollowupMessage.parseFollowupData(parseMessageOptions(content, options)),
                parse: "json"
            })
                .then(res => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        Object.assign(this, new Message(this.client, res.body, this.channel));
                        return this;
                    }
                    else {
                        throw new Error(`${res.statusCode} ${res.statusMessage}`);
                    }
                });
        }
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

    static parseFollowupData(data) {
        return {
            tts: Boolean(data.tts),
            content: data.content || "",
            embeds: [].concat(data.embeds || [])
                .map(embed => embed.toJSON()),
            allowed_mentions: data.allowedMentions,
            flags: [].concat(data.flags)
                .reduce((value, flag) => (ResponseDataFlags[flag] || flag) | value, 0),
            components: [].concat(data.components || [])
                .map(component => component.toJSON())
        };
    }
}

module.exports = FollowupMessage;
