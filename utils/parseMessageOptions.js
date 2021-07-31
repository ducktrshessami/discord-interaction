const { MessageEmbed } = require("discord.js");
const MessageComponent = require("../lib/MessageComponent");

function parseMessageOptions(content, options = {}, editing = false) {
    const data = {};
    let flags = [];
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
        if (!editing) {
            flags = flags.concat(options.flags);
        }
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
        if (!editing) {
            flags = flags.concat(content.flags);
        }
    }
    else {
        data.content = content.toString();
    }

    // Handle arrays
    flags = flags.filter(item => item);
    embeds = embeds.filter(item => item);
    components = components.filter(item => item);
    if (!editing && flags.length) {
        data.flags = flags;
    }
    if (embeds.length) {
        data.embeds = embeds;
    }
    if (components.length) {
        data.components = components;
    }
    return data;
}

module.exports = parseMessageOptions;
