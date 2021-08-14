/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const { Lyrics } = require('@discord-player/extractor');
const lyricsClient = Lyrics.init();

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['ly'],
			description: 'Provides lyrics for the current song',
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

		const song = await lyricsClient.search(queue.current.title);

		if (song === null) {
			const noLyrics = new MessageEmbed()
				.setDescription(`I couldn't find lyrics for this track!`)
				.setColor(embed.color.error);
			return message.channel.send({ embeds: [noLyrics] });
		}

		const lyricsEmbed = new MessageEmbed()
			.setTitle(queue.current.title)
			.setThumbnail(queue.thumbnail)
			.setColor(embed.color.default)
			.setDescription(`${song.lyrics}`);
		return message.channel.send({ embeds: [lyricsEmbed] });
	}

};

