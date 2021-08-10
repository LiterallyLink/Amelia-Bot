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

		const { lyrics } = await lyricsClient.search(queue.current.title);

		if (lyrics === null) {
			const noLyrics = new MessageEmbed()
				.setDescription(`The current song has no lyrics!`)
				.setColor(embed.color.error);
			return message.channel.send({ embed: [noLyrics] });
		}

		const lyricsEmbed = new MessageEmbed()
			.setTitle(queue.current.title)
			.setThumbnail(embed.thumbnails.ameRead)
			.setColor(embed.color.default)
			.setDescription(`${lyrics}`);
		return message.channel.send({ embeds: [lyricsEmbed] });
	}

};

