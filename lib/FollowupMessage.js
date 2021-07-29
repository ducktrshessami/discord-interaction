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
    }

    edit(content, options) {

    }

    delete() {

    }
}

module.exports = FollowupMessage;
