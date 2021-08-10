/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['previous'],
			description: 'Plays the previous song',
			category: 'Music',
			guildOnly: true
		});
	}

	async run(message) {
		if (!this.client.music.isInChannel(message)) return;
		if (!this.client.music.canModifyQueue(message)) return;

		const { player, embed } = this.client;

		const queue = player.getQueue(message.guild.id);

		if (!queue && !queue.previousTracks[0]) {
			const noQueue = new MessageEmbed()
				.setDescription('There is no previous song to play')
				.setColor(embed.color.default);
			return message.channel.send({ embeds: [noQueue] });
		}

		queue.back();

		const previousSongEmbed = new MessageEmbed()
			.setDescription('Successfully playing the previous song!')
			.setColor(embed.color.default);
		return message.channel.send({ embeds: [previousSongEmbed] });
	}

};
