const { Client, Collection, Permissions, Intents } = require('discord.js');
const Util = require('./Utilities/Util.js');
const Economy = require('./Utilities/Economy.js');
const Level = require('./Utilities/Level.js');
const Music = require('./Utilities/Music.js');
const Database = require('./Utilities/Database');
const Canvas = require('./Utilities/Canvas');

module.exports = class AmeliaClient extends Client {

	constructor(options = {}) {
		super({
			intents: new Intents(14287),
			allowedMentions: {
				parse: ['users']
			}
		});

		this.validate(options);

		this.commands = new Collection();

		this.slashCommands = new Collection();

		this.aliases = new Collection();

		this.events = new Collection();

		this.games = new Collection();

		this.snipes = new Collection();

		this.utils = new Util(this);

		this.economy = new Economy(this);

		this.music = new Music(this);

		this.database = new Database(this);

		this.level = new Level(this);

		this.canvas = new Canvas(this);

		this.cooldowns = new Map();

		this.devs = options.developers;

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

		await super.login(token);
	}

};
