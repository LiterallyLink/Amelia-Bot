/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Shuffles the current queue',
			category: 'Music',
			guildOnly: true
		});
	}

	async run(message) {
		if (!this.client.music.isInChannel(message)) return;
		if (!this.client.music.canModifyQueue(message)) return;

		const { player, embed } = this.client;
		const queue = player.getQueue(message.guild.id);

		if (!queue || queue.tracks.length < 1) {
			const noQueue = new MessageEmbed()
				.setDescription('There are not enough songs in the queue to shuffle!')
				.setThumbnail(embed.thumbnails.ameShake)
				.setColor(embed.color.default);
			return message.channel.send({ embeds: [noQueue] });
		}

		await queue.shuffle();

		const queueShuffledEmbed = new MessageEmbed()
			.setDescription('Shuffled the Queue!')
			.setThumbnail(embed.thumbnails.ameSpin)
			.setColor(embed.color.default);
		return message.channel.send({ embeds: [queueShuffledEmbed] });
	}

};
