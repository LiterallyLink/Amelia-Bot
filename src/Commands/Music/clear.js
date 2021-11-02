/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['cq'],
			description: "Clear's all tracks from the queue",
			category: 'Music',
			guildOnly: true,
			voiceChannelOnly: true
		});
	}

	async run(message) {
		if (!this.client.music.canModifyQueue(message)) return;

		const { player, embed } = this.client;

		const queue = player.getQueue(message.guild.id);

		if (!queue || !queue.playing || !queue.tracks[0]) {
			const noQueue = new MessageEmbed()
				.setDescription('There is no music in the queue to clear')
				.setColor(embed.color.default);
			return message.channel.send({ embeds: [noQueue] });
		}

		const clearedQueue = new MessageEmbed()
			.setDescription(`${queue.tracks.length} track(s) have been cleared from the queue`)
			.setColor(embed.color.default);
		message.channel.send({ embeds: [clearedQueue] });

		await queue.clear();
	}

};
