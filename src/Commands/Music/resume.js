/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Resumes the queue',
			category: 'Music',
			guildOnly: true
		});
	}

	async run(message) {
		if (!this.client.music.isInChannel(message)) return;
		if (!this.client.music.canModifyQueue(message)) return;

		const { player, embed } = this.client;
		const queue = player.getQueue(message.guild.id);

		if (!queue || !queue.playing) {
			const noQueue = new MessageEmbed()
				.setDescription('The server queue is currently empty')
				.setColor(embed.color.default);
			return message.channel.send({ embeds: [noQueue] });
		}

		const queueIsPaused = queue.connection.paused;

		if (queueIsPaused) {
			queue.setPaused(false);
			const resumingSongEmbed = new MessageEmbed()
				.setDescription(`:play_pause: Resuming!`)
				.setColor(embed.color.default);
			return message.channel.send({ embeds: [resumingSongEmbed] });
		} else {
			const songIsntPausedEmbed = new MessageEmbed()
				.setDescription(`The current song is not paused!`)
				.setColor(embed.color.default);
			return message.channel.send({ embeds: [songIsntPausedEmbed] });
		}
	}

};

