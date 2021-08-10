/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['filterlist'],
			description: 'Provides a list of active filters',
			category: 'Music',
			guildOnly: true
		});
	}

	async run(message) {
		const { player } = this.client;
		const queue = player.getQueue(message.guild.id);

		if (!this.client.music.isInChannel(message)) return;
		if (!this.client.music.canModifyQueue(message)) return;

		queue.destroy({ disconnect: true });
	}

};
