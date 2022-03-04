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

		await this.client.user.setActivity(`a!help | Unreleased Beta`, { type: 'WATCHING' });
	}

};
