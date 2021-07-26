const { Message, User, GuildMember, Collection, Role, Channel, MessageEmbed } = require("discord.js");
const MessageComponent = require("./MessageComponent");

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

const ResponseDataFlags = {
    EPHEMERAL: 1 << 6
}

class Interaction {
    constructor(client, data) {
        let member;
        let userData = data.user || data.member.user;
        let guild = client.guilds.resolve(data.guild_id);
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

    static parseResponseData(data) {
        return {
            type: ResponseTypes[data.type] || data.type,
            data: data.data ? {
                tts: Boolean(data.data.tts),
                content: data.data.content || "",
                embeds: [].concat(data.data.embeds || [])
                    .map(embed => embed.toJSON()),
                allowed_mentions: data.data.allowedMentions,
                flags: [].concat(data.data.flags)
                    .reduce((value, flag) => (ResponseDataFlags[flag] || flag) | value, 0),
                components: [].concat(data.data.components || [])
                    .map(component => component.toJSON())
            } : undefined
        };
    }
}

try {
    const phin = require("phin");

    Interaction.prototype.pong = function () {
        return this.respond({ type: 1 });
    };

    Interaction.prototype.reply = function (content, options) {
        return this.respond({
            type: 4,
            data: parseMessageOptions(content, options)
        });
    };

    Interaction.prototype.defer = function (ephemeral) {
        return this.respond({
            type: this.type === "MESSAGE_COMPONENT" ? 6 : 5,
            data: ephemeral ? { flags: "EPHEMERAL" } : undefined
        });
    };

    Interaction.prototype.updateMessage = function (content, options) {
        return this.respond({
            type: 7,
            data: parseMessageOptions(content, options)
        });
    };

    Interaction.prototype.respond = function (data) {
        return phin({
            url: `https://discord.com/api/v8/interactions/${this.id}/${this._token}/callback`,
            method: "POST",
            data: Interaction.parseResponseData(data)
        })
            .then((res) => {
                if (res.statusCode !== 204) {
                    throw new Error(`${res.statusCode} ${res.statusMessage}`);
                }
            });
    };

    function parseMessageOptions(content, options = {}) {
        const data = {};
        let embeds = [];
        let components = [];

        // Parse options
        if (Array.isArray(options)) {
            options.forEach(addition => {
                if (addition instanceof MessageComponent) {
                    components.push(addition);
                }
                else {
                    embeds.push(new MessageEmbed(addition));
                }
            });
        }
        else if (options instanceof MessageComponent) {
            components.push(options);
        }
        else if (options instanceof MessageEmbed) {
            embeds.push(options);
        }
        else if (typeof options === "object") {
            data.tts = options.tts;
            data.allowedMentions = options.allowedMentions;
            embeds = embeds.concat(options.embeds);
            components = components.concat(options.components);
        }

        // Parse content
        if (Array.isArray(content)) {
            data.content = content.join("\n");
        }
        else if (typeof content === "object") {
            data.tts = content.tts;
            data.content = content.content;
            data.allowedMentions = content.allowedMentions;
            embeds = embeds.concat(content.embeds);
            components = components.concat(content.components);
        }
        else {
            data.content = content.toString();
        }

        // Handle additions
        embeds = embeds.filter(item => item);
        components = components.filter(item => item);
        if (embeds.length) {
            data.embeds = embeds;
        }
        if (components.length) {
            data.components = components;
        }
        return data;
    }
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
