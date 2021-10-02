/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');
const emoji = require('../../../assets/jsons/emotes.json');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['np', 'current'],
			description: 'Provides the current song playing',
			category: 'Music',
			guildOnly: true
		});
	}

	async run(message) {
		if (!this.client.music.isInChannel(message)) return;
		if (!this.client.music.canModifyQueue(message)) return;

		const { player, embed, user } = this.client;

		const queue = player.getQueue(message.guild.id);

		if (!queue || !queue.playing) {
			const noQueue = new MessageEmbed()
				.setDescription('No music is currently playing!')
				.setColor(embed.color.default);
			return message.channel.send({ embeds: [noQueue] });
		}

		const currentSong = queue.current;
		const progressBar = queue.createProgressBar({ timecodes: true, indicator: emoji.bubba });
		const { requestedBy, title, url, thumbnail } = currentSong;
		const isSongLooped = queue.repeatMode === 1;
		const isQueueLooped = queue.repeatMode === 2;

		const nowPlayingEmbed = new MessageEmbed()
			.setAuthor(`Now Playing ♪`, user.displayAvatarURL())
			.setThumbnail(thumbnail)
			.setDescription(`[${title}](${url})\n\n${progressBar}\n\nRequested by: ${requestedBy}`)
			.setFooter(`Queue Loop Status: ${isQueueLooped ? '✅' : '❌'}\nSong Loop Status: ${isSongLooped ? '✅' : '❌'}`)
			.setColor(embed.color.default);
		return message.channel.send({ embeds: [nowPlayingEmbed] });
	}

};
