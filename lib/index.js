const { Message, User, GuildMember } = require("discord.js");

const InteractionType = [
    "PING",
    "APPLICATION_COMMAND",
    "MESSAGE_COMPONENT"
];

class Interaction {
    #token;

    constructor(client, data) {
        this.#token = data.token;
        this.commandData;
        this.message = data.message ? new Message(client, data.message) : undefined;
        let userData = data.user || data.member.user;
        let guild = client.guilds.resolve(data.guild_id);
        let member = data.member ? (guild ? guild.members.resolve(this.message || userData.id) : undefined) || new GuildMember(client, data.member, guild) : undefined;
        Object.defineProperties(this, {
            client: {
                value: client,
                enumerable: true
            },
            id: {
                value: data.id,
                enumerable: true
            },
            type: {
                value: InteractionType[data.type],
                enumerable: true
            },
            guild: {
                value: guild,
                enumerable: Boolean(guild)
            },
            user: {
                value: client.users.resolve(userData.id) || new User(client, userData),
                enumerable: true
            },
            member: {
                value: member,
                enumerable: Boolean(member)
            }
        });
        if (data.channel_id) {
            let channel = client.channels.resolve(data.channel_id);
            if (channel) {
                Object.defineProperty(this, "channel", {
                    value: channel,
                    enumerable: true
                });
            }
            else {
                client.channels.fetch(data.channel_id)
                    .then(channel => Object.defineProperty(this, "channel", {
                        value: channel,
                        enumerable: Boolean(channel)
                    }))
                    .catch(err => client.emit("error", err));
            }
        }
    }
}

module.exports = Interaction;
