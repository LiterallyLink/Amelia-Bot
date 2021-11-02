/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['track-remove'],
			description: 'Removes a song from the queue',
			category: 'Music',
			guildOnly: true,
			voiceChannelOnly: true
		});
	}

	async run(message, [trackNum]) {
		if (!this.client.music.canModifyQueue(message)) return;

		const { player, embed } = this.client;

		const queue = player.getQueue(message.guild.id);

		if (!queue) {
			const noQueue = new MessageEmbed()
				.setDescription('The server queue is currently empty')
				.setColor(embed.color.default);
			return message.channel.send({ embeds: [noQueue] });
		}

		if (!trackNum && !queue.tracks[trackNum]) {
			const noTrackGiven = new MessageEmbed()
				.setDescription('Please provide a valid track to remove!')
				.setThumbnail(this.client.embed.thumbnails.ameShake)
				.setColor(embed.color.error);
			return message.channel.send({ embeds: [noTrackGiven] });
		}

		queue.remove(trackNum);

		const trackRemoved = new MessageEmbed()
			.setDescription(`Successfully removed ${trackNum} from the queue!`)
			.setColor(embed.color.default);
		return message.channel.send({ embeds: [trackRemoved] });
	}

};
