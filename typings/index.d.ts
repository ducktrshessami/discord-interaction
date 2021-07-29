import {
    BaseManager,
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

    type FollowupMessageData = {
        content?: String,
        embeds?: MessageEmbed | Array<MessageEmbed>,
        allowedMentions?: MessageMentionOptions,
        components?: MessageComponent | Array<MessageComponent>
    };

    type FollowupMessageOptions = {
        embeds?: MessageEmbed | Array<MessageEmbed>,
        allowedMentions?: MessageMentionOptions,
        components?: MessageComponent | Array<MessageComponent>
    };

    type ResponseAdditions = MessageEmbed | MessageComponent | Array<MessageEmbed | MessageComponent>;

    type FollowupResolvable = Snowflake | FollowupMessage;

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

    export class MessageComponent {
        constructor(data: Object | MessageComponent);

        toJSON(): Object;
    }

    export class FollowupMessage {
        public readonly client: Client;
        public readonly interaction: Interaction;
        public readonly id: Snowflake;
        public deleted: Boolean;

        constructor(interaction: Interaction, data: Object);

        public edit(content?: StringResolvable | FollowupMessageData, options?: FollowupMessageOptions | ResponseAdditions): Promise<FollowupMessage>;
        public delete(): Promise<void>;

        public static parseFollowupData(data): Object;
    }

    export class FollowupManager extends BaseManager<Snowflake, FollowupMessage, FollowupResolvable> {
        constructor(client: Client, iterable?: Iterable<FollowupMessage>);
    }

    export class Interaction {
        public readonly client: Client;
        public readonly id: Snowflake;
        public readonly type: InteractionType;
        public readonly followups: FollowupManager;
        public readonly guild?: Guild;
        public readonly channel?: Channel;
        public readonly user?: User;
        public readonly member?: GuildMember;
        public readonly commandData?: CommandInteractionData;
        public readonly message?: Message;

        constructor(client: Client, data: Object);

        public pong?(): Promise<void>;
        public reply?(content?: StringResolvable | InteractionResponseMessageData, options?: ResponseOptions | ResponseAdditions): Promise<FollowupMessage>;
        public defer?(ephemeral?: Boolean): Promise<FollowupMessage | Message>;
        public updateMessage?(content?: StringResolvable | InteractionResponseMessageData, options?: ResponseOptions | ResponseAdditions): Promise<Message>;
        public respond?(data: InteractionResponse, fetch?: Boolean): Promise<void | FollowupMessage>;

        public originalResponse?(): Promise<FollowupMessage>;
        public followup?(content?: StringResolvable | InteractionResponseMessageData, options?: ResponseOptions | ResponseAdditions): Promise<FollowupMessage>;

        public static parseResponseData(data: InteractionResponse): Object;
    }
}
