/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['s'],
			description: 'Skips the current song',
			category: 'Music',
			guildOnly: true,
			voiceChannelOnly: true
		});
	}

	async run(message) {
		if (!this.client.music.canModifyQueue(message)) return;

		const { player, embed } = this.client;

		const queue = player.getQueue(message.guild.id);

		if (!queue || !queue.playing) {
			const noQueue = new MessageEmbed()
				.setDescription('The server queue is currently empty')
				.setColor(embed.color.default);
			return message.channel.send({ embeds: [noQueue] });
		}

		const currentTrack = queue.current;

		queue.skip();

		const skippedSong = new MessageEmbed()
			.setDescription(`[${currentTrack}](${currentTrack.url}) has been skipped!`)
			.setThumbnail(currentTrack.thumbnail)
			.setColor(embed.color.default);
		return message.channel.send({ embeds: [skippedSong] });
	}

};
