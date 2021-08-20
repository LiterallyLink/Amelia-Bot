/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['leave'],
			description: 'Disconnects from the voice channel and clears the queue.',
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
