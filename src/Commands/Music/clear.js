/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: "Clear's all tracks from the queue",
			category: 'Music',
			guildOnly: true
		});
	}

	async run(message) {
		if (!this.client.music.isInChannel(message)) return;
		if (!this.client.music.canModifyQueue(message)) return;

		const { player, embed } = this.client;

		const queue = player.getQueue(message.guild.id);

		if (!queue) {
			const noQueue = new MessageEmbed()
				.setDescription('The server queue is currently empty')
				.setColor(embed.color.default);
			return message.channel.send({ embeds: [noQueue] });
		}

		const clearedQueue = new MessageEmbed()
			.setDescription(`${queue.tracks.length} track(s) have been cleared from the queue`)
			.setColor(embed.color.default);
		message.channel.send({ embeds: [clearedQueue] });

		return queue.clear();
	}

};
