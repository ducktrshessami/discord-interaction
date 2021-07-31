const phin = require("phin");
const parseMessageOptions = require("../utils/parseMessageOptions");
const FollowupMessage = require("./FollowupMessage");

class EphemeralResponse extends FollowupMessage {
    constructor(client, interaction, channel) {
        super(client, {
            id: interaction.id,
            author: client.user
        }, interaction, channel);
    }

    edit(content, options) {
        return phin({
            url: `https://discord.com/api/v8/webhooks/${this.client.user.id}/${this.interaction._token}/messages/@original`,
            method: "PATCH",
            data: FollowupMessage.parseFollowupData(parseMessageOptions(content, options, true)),
            parse: "json"
        })
            .then(res => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    this.interaction.followups.cache.delete(this.id);
                    return this.interaction.followups.add(res.body, true, { extras: [this.interaction, this.channel] });
                }
                else {
                    throw new Error(`${res.statusCode} ${res.statusMessage}`);
                }
            });
    }

    async delete() {
        if (this.deletable) {
            this.deleted = true;
        }
        console.warn("A deferred ephemeral response cannot be deleted before being edited");
        return this;
    }
}

module.exports = EphemeralResponse;
