const Discord = require("discord.js");
const { Interaction } = require("../lib");
require("dotenv").config();

const client = new Discord.Client();

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
})

client.ws.on("INTERACTION_CREATE", data => {
    const interaction = new Interaction(client, data);
    if (interaction.type === "PING") {
        interaction.pong()
            .catch(console.error);
    }
    else {
        // test here
    }
});

client.login()
    .catch(console.error);
