import { Channel, Client, Collection, Guild, GuildMember, Message, Role, Snowflake, User } from "discord.js";

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

    type ComponentType =
        | "ACTION_ROW"
        | "BUTTON"
        | "SELECT_MENU";

    type CommandOptionData = {
        name: String,
        type: CommandOptionType,
        value?: String | Number | Boolean | User | Channel | Role,
        options?: Array<CommandOptionData>
    };

    class CommandInteractionData {
        public readonly id: Snowflake;
        public readonly name: String;
        public readonly users: Collection<Snowflake, User>;
        public readonly members: Collection<Snowflake, GuildMember>;
        public readonly roles: Collection<Snowflake, Role>;
        public readonly channels: Collection<Snowflake, Channel>;
        public readonly customID?: String;
        public readonly componentType?: ComponentType;
        public options: Array<CommandOptionData>;
    }

    class Interaction {
        public readonly client: Client;
        public readonly id: Snowflake;
        public readonly type: InteractionType;
        public readonly guild?: Guild;
        public readonly channel?: Channel;
        public readonly user?: User;
        public readonly member?: GuildMember;
        public readonly commandData?: CommandInteractionData;
        public readonly message?: Message;

        constructor(client: Client, data: Object);

        public respond?(data: Object): Promise<void>;
    }

    export = Interaction;
}
