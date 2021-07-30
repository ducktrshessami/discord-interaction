const { Message, User, GuildMember, Collection, Role, Channel, MessageEmbed } = require("discord.js");
const MessageComponent = require("./MessageComponent");
const FollowupManager = require("./FollowupManager");
const FollowupMessage = require("./FollowupMessage");

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

const ResponseTypes = {
    PONG: 1,
    CHANNEL_MESSAGE_WITH_SOURCE: 4,
    DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5,
    DEFERRED_UPDATE_MESSAGE: 6,
    UPDATE_MESSAGE: 7
};

class Interaction {
    constructor(client, data) {
        let member;
        let userData = data.user || data.member.user;
        let guild = client.guilds.resolve(data.guild_id);
        let command = data.data ? parseCommandData(client, data.data, guild) : undefined;
        let component = data.data ? parseComponentData(data.data) : undefined
        Object.defineProperties(this, {
            _token: { value: data.token },
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
            followups: {
                value: new FollowupManager(client),
                enumerable: true
            },
            guild: {
                value: guild,
                enumerable: Boolean(guild)
            },
            channel: {
                value: client.channels.resolve(data.channel_id),
                enumerable: Boolean(data.channel_id)
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
                value: command,
                enumerable: Boolean(command && command.id)
            },
            copmonentData: {
                value: component,
                enumerable: Boolean(component && component.type)
            }
        });
        member = data.member ? (guild ? guild.members.resolve(this.message || userData.id) : undefined) || new GuildMember(client, data.member, guild) : undefined;
        Object.defineProperty(this, "member", {
            value: member,
            enumerable: Boolean(member)
        });
    }

    static parseResponseData(data) {
        return {
            type: ResponseTypes[data.type] || data.type,
            data: data.data ? FollowupMessage.parseFollowupData(data.data) : undefined
        };
    }
}

try {
    const phin = require("phin");
    const parseMessageOptions = require("../utils/parseMessageOptions");

    Interaction.prototype.pong = function () {
        return this.respond({ type: 1 });
    };

    Interaction.prototype.reply = function (content, options) {
        return this.respond({
            type: 4,
            data: parseMessageOptions(content, options)
        }, true);
    };

    Interaction.prototype.defer = function (ephemeral) {
        return this.respond({
            type: this.type === "MESSAGE_COMPONENT" ? 6 : 5,
            data: ephemeral ? { flags: "EPHEMERAL" } : undefined
        })
            .then(() => this.type === "MESSAGE_COMPONENT" ? this.message : this.originalResponse());
    };

    Interaction.prototype.updateMessage = function (content, options) {
        return this.respond({
            type: 7,
            data: parseMessageOptions(content, options)
        })
            .then(() => this.message);
    };

    Interaction.prototype.respond = function (data, fetch = false) {
        return phin({
            url: `https://discord.com/api/v8/interactions/${this.id}/${this._token}/callback`,
            method: "POST",
            data: Interaction.parseResponseData(data)
        })
            .then((res) => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    if (fetch) {
                        return this.originalResponse();
                    }
                }
                else {
                    throw new Error(`${res.statusCode} ${res.statusMessage}`);
                }
            });
    };

    Interaction.prototype.originalResponse = function () {
        return phin({
            url: `https://discord.com/api/v8/webhooks/${this.client.user.id}/${this._token}/messages/@original`,
            parse: "json"
        })
            .then(res => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    return this.followups.add(res.body, true, { extras: [this, this.channel] });
                }
                else {
                    throw new Error(`${res.statusCode} ${res.statusMessage}`);
                }
            });
    };

    Interaction.prototype.followup = function (content, options) {
        return phin({
            url: `https://discord.com/api/v8/webhooks/${this.client.user.id}/${this._token}`,
            method: "POST",
            data: FollowupMessage.parseFollowupData(parseMessageOptions(content, options)),
            parse: "json"
        })
            .then(res => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    return this.followups.add(res.body, true, { extras: [this, this.channel] });
                }
                else {
                    throw new Error(`${res.statusCode} ${res.statusMessage}`);
                }
            });
    };
}
catch {
    ;
}

function parseCommandData(client, data, guild) {
    const resolved = data.resolved || {};
    const command = {
        users: new Collection(
            Object.keys(resolved.users || {})
                .map(id => [id, client.users.resolve(id) || new User(client, resolved.users[id])])
        ),
        members: new Collection(
            Object.keys(resolved.members || {})
                .map(id => [id, guild.members.resolve(id) || new GuildMember(client, resolved.members[id], guild)])
        ),
        roles: new Collection(
            Object.keys(resolved.roles || {})
                .map(id => [id, guild.roles.resolve(id) || new Role(client, resolved.roles[id], guild)])
        ),
        channels: new Collection(
            Object.keys(resolved.channels || {})
                .map(id => [id, client.channels.resolve(id) || new Channel(client, resolved.channels[id])])
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

function parseComponentData(data) {
    const component = {};
    Object.defineProperties(component, {
        customID: {
            value: data.custom_id,
            enumerable: Boolean(data.custom_id)
        },
        type: {
            value: ComponentTypes[data.component_type - 1] || data.component_type,
            enumerable: Boolean(data.component_type)
        }
    });
    return component;
}

module.exports = Interaction;
