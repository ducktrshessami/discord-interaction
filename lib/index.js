const { Message, User, GuildMember, Collection, Role, Channel } = require("discord.js");

const InteractionTypes = [
    "PING",
    "APPLICATION_COMMAND",
    "MESSAGE_COMPONENT"
];

const CommandOptionTypes = [
    "SUB_COMMAND",
    "SUB_COMMAND_GROUP",
    "STRING",
    "INTEGER",
    "BOOLEAN",
    "USER",
    "CHANNEL",
    "ROLE",
    "MENTIONABLE"
];

const ComponentTypes = [
    "ACTION_ROW",
    "BUTTON",
    "SELECT_MENU"
];

class Interaction {
    #token;

    constructor(client, data) {
        let member;
        let userData = data.user || data.member.user;
        let guild = client.guilds.resolve(data.guild_id);
        this.#token = data.token;
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
                value: InteractionTypes[data.type - 1],
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
            message: {
                value: data.message ? new Message(client, data.message) : undefined,
                enumerable: Boolean(data.message)
            },
            commandData: {
                value: data.data ? parseCommandData(client, data.data, guild) : undefined,
                enumerable: Boolean(data.data)
            }
        });
        member = data.member ? (guild ? guild.members.resolve(this.message || userData.id) : undefined) || new GuildMember(client, data.member, guild) : undefined;
        Object.defineProperty(this, "member", {
            value: member,
            enumerable: Boolean(member)
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

function parseCommandData(client, data, guild) {
    const command = {
        users: new Collection(
            Object.keys(data.resolved.users || {})
                .map(id => [id, client.users.resolve(id) || new User(client, data.resolved.users[id])])
        ),
        members: new Collection(
            Object.keys(data.resolved.members || {})
                .map(id => [id, guild.members.resolve(id) || new GuildMember(client, data.resolved.members[id], guild)])
        ),
        roles: new Collection(
            Object.keys(data.resolved.roles || {})
                .map(id => [id, guild.roles.resolve(id) || new Role(client, data.resolved.roles[id], guild)])
        ),
        channels: new Collection(
            Object.keys(data.resolved.channels || {})
                .map(id => [id, client.channels.resolve(id) || new Channel(client, data.resolved.channels[id])])
        )
    };
    command.options = (data.options || []).map(option => parseCommandOptionData(client, option, {
        users: command.users,
        roles: command.roles,
        channels: command.channels
    }));
    Object.defineProperties(command, {
        id: {
            value: data.id,
            enumerable: true
        },
        name: {
            value: data.name,
            enumerable: true
        },
        customID: {
            value: data.custom_id,
            enumerable: Boolean(data.custom_id)
        },
        componentType: {
            value: ComponentTypes[data.component_type - 1] || data.component_type,
            enumerable: Boolean(data.component_type)
        }
    });
    return command;
}

function parseCommandOptionData(client, data, resolved) {
    const option = {
        name: data.name,
        type: CommandOptionTypes[data.type - 1] || data.type,
        value: data.value,
        options: (data.options || []).map(option => parseCommandOptionData(client, option, resolved))
    };
    switch (data.type) {
        case 6: option.value = resolved.users.get(data.value); break;
        case 7: option.value = resolved.channels.get(data.value); break;
        case 8: option.value = resolved.roles.get(data.value); break;
        case 9: option.value = resolved.users.get(data.value) || resolved.roles.get(data.value); break;
        default:
    }
    return option;
}

module.exports = Interaction;
