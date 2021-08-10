/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Skips to a specified track',
			category: 'Music',
			usage: '1',
			guildOnly: true
		});
	}

	async run(message, [trackNum]) {
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

		if (!trackNum && !queue.tracks[trackNum]) {
			const noTrackGiven = new MessageEmbed()
				.setDescription('Please provide a valid track to skip to.')
				.setColor(embed.color.error);
			return message.channel.send({ embeds: [noTrackGiven] });
		}

		const trackToJumpTo = queue.tracks[trackNum];

		queue.jump(trackToJumpTo);

		const skippedSong = new MessageEmbed()
			.setDescription(`Skipped to [${trackToJumpTo.title}](${trackToJumpTo.url})`)
			.setThumbnail(embed.thumbnails.ameLongJump)
			.setColor(embed.color.default);
		return message.channel.send({ embeds: [skippedSong] });
	}

};
