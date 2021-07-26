import {
    Channel,
    Client,
    Collection,
    Guild,
    GuildMember,
    Message,
    MessageEmbed,
    MessageMentionOptions,
    Role,
    Snowflake,
    StringResolvable,
    User
} from "discord.js";

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

    type InteractionResponseType =
        | "PONG"
        | "CHANNEL_MESSAGE_WITH_SOURCE"
        | "DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE"
        | "DEFERRED_UPDATE_MESSAGE"
        | "UPDATE_MESSAGE";

    type InteractionResponseFlag =
        | "EPHEMERAL";

    type CommandOptionData = {
        name: String,
        type: CommandOptionType,
        value?: String | Number | Boolean | User | Channel | Role,
        options?: Array<CommandOptionData>
    };

    type InteractionResponseData = {
        tts?: Boolean,
        content?: String,
        embeds?: MessageEmbed | Array<MessageEmbed>,
        allowedMentions?: MessageMentionOptions,
        flags?: InteractionResponseFlag | Array<InteractionResponseFlag>,
        components?: MessageComponent | Array<MessageComponent>
    };

    type InteractionResponseMessageData = {
        tts?: Boolean,
        content?: String,
        embeds?: MessageEmbed | Array<MessageEmbed>,
        allowedMentions?: MessageMentionOptions,
        components?: MessageComponent | Array<MessageComponent>
    };

    type InteractionResponse = {
        type: InteractionResponseType,
        data?: InteractionResponseData
    };

    type ResponseOptions = {
        tts?: Boolean,
        embeds?: MessageEmbed | Array<MessageEmbed>,
        allowedMentions?: MessageMentionOptions,
        components?: MessageComponent | Array<MessageComponent>
    };

    type ResponseAdditions = MessageEmbed | MessageComponent | Array<MessageEmbed | MessageComponent>;

    export class MessageComponent {
        constructor(data: Object | MessageComponent);

        toJSON(): Object;
    }

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

    export class Interaction {
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

        public pong?(): Promise<void>;
        public reply?(content?: StringResolvable | InteractionResponseMessageData, options?: ResponseOptions | ResponseAdditions): Promise<void>;
        public defer?(ephemeral?: Boolean): Promise<void>;
        public updateMessage?(content?: StringResolvable | InteractionResponseMessageData, options?: ResponseOptions | ResponseAdditions): Promise<void>;
        public respond?(data: InteractionResponse): Promise<void>;

        public static parseResponseData(data: InteractionResponse): Object;
    }
}
