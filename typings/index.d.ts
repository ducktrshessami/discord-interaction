import { Channel, Client, Guild, GuildMember, Message, Role, Snowflake, User } from "discord.js";

declare module "discord-interaction" {
    type InteractionType =
        | "PING"
        | "APPLICATION_COMMAND"
        | "MESSAGE_COMPONENT";

    type CommandOptionType =
        | "SUB_COMMAND"
        | "SUB_COMMAND_GROUP"
        | "STRING"
        | "INTEGER"
        | "BOOLEAN"
        | "USER"
        | "CHANNEL"
        | "ROLE"
        | "MENTIONABLE";

    type CommandOptionData = {
        name: String,
        type: CommandOptionType,
        value?: String | Number | Boolean | User | Channel | Role,
        options?: Array<CommandOptionData>
    };

    class CommandInteractionData {
        public readonly id: Snowflake;
        public readonly name: String;
        public options?: Array<CommandOptionData>;
        public customID?: String;
        public componentType: Number;
    }

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

        constructor(client: Client, data: Object);

        public respond(data: Object): Promise<void>;
    }

    export = Interaction;
}
