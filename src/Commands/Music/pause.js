/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['stop'],
			description: 'Pauses the current song',
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

		if (!queueIsPaused) {
			queue.setPaused(true);
			const queuePausedEmbed = new MessageEmbed()
				.setDescription(`:pause_button: Successfully paused the current song`)
				.setFooter('To unpause, use the resume command!')
				.setColor(embed.color.default);
			return message.channel.send({ embeds: [queuePausedEmbed] });
		} else {
			const queueIsAlreadyPausedEmbed = new MessageEmbed()
				.setDescription(`The current song is already paused`)
				.setFooter('To unpause, use the resume command!')
				.setColor(embed.color.default);
			return message.channel.send({ embeds: [queueIsAlreadyPausedEmbed] });
		}
	}

};
