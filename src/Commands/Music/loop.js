/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['repeat'],
			description: 'Toggle the queue loop',
			category: 'Music',
			usage: ', loop queue, loop song',
			guildOnly: true
		});
	}

	async run(message, [loopOption]) {
		if (!this.client.music.isInChannel(message)) return;
		if (!this.client.music.canModifyQueue(message)) return;

		const { player, embed } = this.client;

		const queue = player.getQueue(message.guild.id);

		if (!queue) {
			const noQueue = new MessageEmbed()
				.setDescription('The server queue is currently empty')
				.setColor(embed.color.default);
			return message.channel.send({ embeds: [noQueue] });
		}


		if (loopOption === 'queue') {
			const queueLoopStatus = this.setLoopedStatus(queue, 2);

			const queueLoopEmbed = new MessageEmbed()
				.setDescription(`Queue Loop ${queueLoopStatus ? 'Disabled' : 'Enabled'}`)
				.setThumbnail(embed.thumbnails.ameRoll)
				.setColor(embed.color.default);
			return message.channel.send({ embeds: [queueLoopEmbed] });
		} else if (loopOption === 'song') {
			const queueSongStatus = this.setLoopedStatus(queue, 1);

			const songLoopEmbed = new MessageEmbed()
				.setDescription(`Song Loop ${queueSongStatus ? 'Disabled' : 'Enabled'}`)
				.setThumbnail(embed.thumbnails.ameRoll)
				.setColor(embed.color.default);
			return message.channel.send({ embeds: [songLoopEmbed] });
		} else {
			const isSongLooped = queue.repeatMode === 1;
			const isQueueLooped = queue.repeatMode === 2;

			const loopStatus = new MessageEmbed()
				.setTitle(`Loop Status`, message.author.displayAvatarURL())
				.setDescription(`Queue Loop Status: ${isQueueLooped ? '✅' : '❌'}\n\nSong Loop Status: ${isSongLooped ? '✅' : '❌'}`)
				.setFooter('Use help loop for more information!')
				.setColor(embed.color.default);
			return message.channel.send({ embeds: [loopStatus] });
		}
	}

	setLoopedStatus(queue, loopMode) {
		const queueRepeatMode = queue.repeatMode;

		if (queueRepeatMode === loopMode) {
			queue.setRepeatMode(0);
		} else {
			queue.setRepeatMode(loopMode);
		}

		return queueRepeatMode === loopMode;
	}

};
