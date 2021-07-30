const { MessageEmbed } = require("discord.js");
const MessageComponent = require("../lib/MessageComponent");

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

module.exports = parseMessageOptions;
