const { Client, Collection, Permissions, Intents } = require('discord.js');
const Util = require('./Utilities/Util.js');
const Economy = require('./Utilities/Economy.js');
const Level = require('./Utilities/Level.js');
const Music = require('./Utilities/Music.js');
const Database = require('./Utilities/Database');

module.exports = class AmeliaClient extends Client {

	constructor(options = {}) {
		super({
			intents: [
				Intents.FLAGS.GUILDS,
				Intents.FLAGS.GUILD_MEMBERS,
				Intents.FLAGS.GUILD_BANS,
				Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
				Intents.FLAGS.GUILD_INTEGRATIONS,
				Intents.FLAGS.GUILD_WEBHOOKS,
				Intents.FLAGS.GUILD_INVITES,
				Intents.FLAGS.GUILD_VOICE_STATES,
				Intents.FLAGS.GUILD_PRESENCES,
				Intents.FLAGS.GUILD_MESSAGES,
				Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
				Intents.FLAGS.GUILD_MESSAGE_TYPING,
				Intents.FLAGS.DIRECT_MESSAGES,
				Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
				Intents.FLAGS.DIRECT_MESSAGE_TYPING
			],
			allowedMentions: {
				parse: ['users']
			}
		});

		this.validate(options);

		this.commands = new Collection();

		this.aliases = new Collection();

		this.events = new Collection();

		this.games = new Collection();

		this.snipes = new Collection();

		this.utils = new Util(this);

		this.economy = new Economy(this);

		this.music = new Music(this);

		this.database = new Database(this);

		this.level = new Level(this);

		this.cooldowns = new Map();

		this.owners = options.owners;

		this.embed = require('../../assets/jsons/embed.json');

		this.mongoose = require('./Mongo');
	}

	validate(options) {
		if (typeof options !== 'object') throw new TypeError('Options should be a type of Object.');

		if (!options.token) throw new Error('You must pass the token for the client.');
		this.token = options.token;

		if (!options.prefix) throw new Error('You must pass a prefix for the client.');
		if (typeof options.prefix !== 'string') throw new TypeError('Prefix should be a type of String.');
		this.prefix = options.prefix;

		if (!options.defaultPerms) throw new Error('You must pass default perm(s) for the Client.');
		this.defaultPerms = new Permissions(options.defaultPerms).freeze();
	}

	async start(token = this.token) {
		this.utils.loadCommands();
		this.utils.loadEvents();
		this.utils.loadPlayerEvents();
		this.mongoose.init();

		await super.login(token);
	}

};
