const Event = require('../Structures/Event');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, {
			once: true
		});
	}

	async run() {
		console.log([
			`Logged in as ${this.client.user.tag}`,
			`Loaded ${this.client.commands.size} commands!`,
			`Loaded ${this.client.events.size} discord events!`,
			`Loaded ${this.client.player._eventsCount} player events!`
		].join('\n'));

		const guilds = this.client.guilds.cache.map(guild => guild);
		for (let i = 0; i < guilds.length; i++) {
			await this.client.database.fetchGuild(guilds[i]);
		}
	}

};
