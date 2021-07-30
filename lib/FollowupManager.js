const { BaseManager } = require("discord.js");
const FollowupMessage = require("./FollowupMessage");

class FollowupManager extends BaseManager {
    constructor(client, iterable) {
        super(client, iterable, FollowupMessage);
    }
}

module.exports = FollowupManager;
