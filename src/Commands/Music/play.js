/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const { QueryType } = require('discord-player');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['p'],
			description: 'Play any song of your choosing!',
			category: 'Music',
			usage: '(song name), play (song url)',
			botPerms: ['SPEAK', 'CONNECT'],
			args: true,
			guildOnly: true,
			voiceChannelOnly: true
		});
	}

	async run(message, args) {
		if (!this.client.music.canModifyQueue(message)) return;
		const { player, embed } = this.client;

		if (!args) {
			const songNotFound = new MessageEmbed()
				.setDescription('Please provide a valid link or song name')
				.setThumbnail(this.client.embed.thumbnails.ameShake)
				.setColor(embed.color.error);
			return message.reply({ embeds: [songNotFound] });
		}

		const searchResult = await player.search(args.join(' '), {
			requestedBy: message.author,
			searchEngine: QueryType.AUTO
		}).catch(() => {
			console.log('he');
		});

		if (!searchResult.tracks.length) {
			const songNotFound = new MessageEmbed()
				.setDescription('Please provide a valid link or song name')
				.setThumbnail(this.client.embed.thumbnails.ameShake)
				.setColor(embed.color.error);
			return message.reply({ embeds: [songNotFound] });
		}

		const queue = await player.createQueue(message.guild, {
			fetchBeforeQueued: true,
			leaveOnEnd: false,
			leaveOnEmpty: true,
			ytdlOptions: {
				quality: 'highest',
				filter: 'audioonly',
				dlChunkSize: 0
			},
			initialVolume: 85,
			leaveOnEmptyCooldown: 200000,
			bufferingTimeout: 2000,
			metadata: { channel: message.channel }
		});

		try {
			if (!queue.connection) await queue.connect(message.member.voice.channel);
		} catch {
			await player.deleteQueue(message.guild.id);

			const unableToJoinVC = new MessageEmbed()
				.setDescription('I was unable to join your voice channel.')
				.setThumbnail(this.client.embed.thumbnails.ameShake)
				.setColor(embed.color.error);
			return message.reply({ embeds: [unableToJoinVC] });
		}

		if (searchResult.playlist) {
			await queue.addTracks(searchResult.tracks);
		} else {
			await queue.addTrack(searchResult.tracks[0]);
		}

		if (!queue.playing) await queue.play();
	}

};
