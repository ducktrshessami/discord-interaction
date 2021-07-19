import { Channel, Client, Guild, GuildMember, Message, Snowflake, User } from "discord.js";

declare module "discord-interaction" {
    type InteractionType =
        | "PING"
        | "APPLICATION_COMMAND"
        | "MESSAGE_COMPONENT";

    type CommandInteractionData = {

    };

    class Interaction {
        public readonly client: Client;
        public readonly id: Snowflake;
        public readonly type: InteractionType;
        public readonly guild?: Guild;
        public readonly channel?: Channel;
        public readonly user?: User;
        public readonly member?: GuildMember;
        public commandData?: CommandInteractionData;
        public message?: Message;

        private token: String;

        constructor(data: Object);

        public respond(data: Object): Promise<void>;
    }
}
