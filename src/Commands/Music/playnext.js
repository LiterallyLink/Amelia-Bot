/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const { QueryType } = require('discord-player');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['pn'],
			description: 'Insert a song to play next',
			category: 'Music',
			usage: '(song name), playnext (song url)',
			botPerms: ['SPEAK', 'CONNECT'],
			args: true,
			guildOnly: true,
			voiceChannelOnly: true
		});
	}

	async run(message, args) {
		if (!this.client.music.canModifyQueue(message)) return;

		const { player, embed } = this.client;
		const queue = this.client.player.getQueue(message.guild.id);

		if (!queue || !queue.playing) {
			const noSongsInQueue = new MessageEmbed()
				.setDescription('There is no song currently playing\nTry using the play command instead!')
				.setThumbnail(this.client.embed.thumbnails.ameShake)
				.setColor(embed.color.error);
			return message.reply({ embeds: [noSongsInQueue] });
		}

		if (!args) {
			const noSongProvided = new MessageEmbed()
				.setDescription('Please provide a valid link or song name')
				.setThumbnail(this.client.embed.thumbnails.ameShake)
				.setColor(embed.color.error);
			return message.reply({ embeds: [noSongProvided] });
		}

		const searchResult = await player.search(args.join(' '), {
			requestedBy: message.author,
			searchEngine: QueryType.AUTO
		}).catch(() => {
			console.log('he');
		});

		if (!searchResult || !searchResult.tracks.length) {
			const songNotFound = new MessageEmbed()
				.setDescription('Please provide a valid link or song name')
				.setThumbnail(this.client.embed.thumbnails.ameShake)
				.setColor(embed.color.error);
			return message.reply({ embeds: [songNotFound] });
		}

		queue.insert(searchResult.tracks[0]);

		const queuedSong = new MessageEmbed()
			.setDescription(`${searchResult.tracks[0].title} has been queued to play next`)
			.setThumbnail(this.client.embed.thumbnails.ameGuitar)
			.setColor(embed.color.default);
		return message.reply({ embeds: [queuedSong] });
	}

};
