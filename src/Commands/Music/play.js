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
			guildOnly: true
		});
	}

	async run(message, args) {
		if (!this.client.music.isInChannel(message)) return;
		if (!this.client.music.canModifyQueue(message)) return;
		const { player, embed } = this.client;

		const searchResult = await player.search(args.join(' '), {
			requestedBy: message.author,
			searchEngine: QueryType.AUTO
		}).catch(() => {
			console.log('he');
		});

		if (!searchResult || !searchResult.tracks.length) {
			const songNotFound = new MessageEmbed()
				.setDescription('Please provide a valid link or song name')
				.setColor(embed.color.error);
			return message.reply({ embeds: [songNotFound] });
		}

		const queue = await player.createQueue(message.guild, {
			enableLive: true,
			leaveOnEnd: false,
			leaveOnEmptyCooldown: 200000,
			metadata: { channel: message.channel }
		});

		try {
			if (!queue.connection) await queue.connect(message.member.voice.channel);
		} catch {
			queue.deleteQueue(message.guild.id);

			const unableToJoinVC = new MessageEmbed()
				.setDescription('I was unable to join your voice channel.')
				.setColor(embed.color.error);
			return await message.reply({ embeds: [unableToJoinVC] });
		}

		// eslint-disable-next-line no-unused-expressions
		searchResult.playlist ? queue.addTracks(searchResult.tracks) : queue.addTrack(searchResult.tracks[0]);

		if (!queue.playing) await queue.play();
	}

};
