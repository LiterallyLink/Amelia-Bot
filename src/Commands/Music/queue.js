/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['q'],
			description: 'Displays the list of songs in the queue',
			category: 'Music',
			guildOnly: true
		});
	}

	async run(message) {
		if (!this.client.music.isInChannel(message)) return;
		if (!this.client.music.canModifyQueue(message)) return;

		const { player, embed } = this.client;

		const queue = player.getQueue(message.guild.id);

		if (!queue || queue.tracks.length < 0) {
			const noQueue = new MessageEmbed()
				.setDescription('The server queue is currently empty')
				.setColor(embed.color.default);
			return message.channel.send({ embeds: [noQueue] });
		}

		const currentSong = queue.current;
		const nowPlaying = currentSong ? `[${currentSong.title}](${currentSong.url}) | Requested by: ${currentSong.requestedBy}` : 'No song is currently playing.';
		const tracks = queue.tracks.slice(0, 10).map((track, i) => `**${i + 1}.** [${track.title}](${track.url}) | Requested by: ${track.requestedBy}`);
		const musicQueue = `__Now Playing:__\n${nowPlaying}\n\n__Up Next:__\n${tracks.join('\n\n')}`;
		const totalPages = Math.ceil(queue.tracks.length / 10);
		const currentPageCount = 1;

		const queueEmbed = new MessageEmbed()
			.setAuthor(`Queue for ${message.guild.name}`, message.guild.iconURL())
			.setDescription(musicQueue)
			.setFooter(`Page: ${currentPageCount}/${totalPages} | Song Loop: ${queue.repeatMode ? '✅' : '❌'} | Queue Loop: ${queue.loopMode ? '✅' : '❌'}`)
			.setColor(embed.color.default);
		return message.channel.send({ embeds: [queueEmbed] });
	}

};
