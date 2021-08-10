const Event = require('../../Structures/Event');

module.exports = class extends Event {

	async run(guild) {
		const channel = guild.channels.cache.find(ch => ch.type === 'text' && channel.permissionsFor(guild.me).has('SEND_MESSAGES'));
		await this.client.database.fetchGuild(guild);

		console.log(`I joined ${guild.name}`);
	}

};
