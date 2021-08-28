/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['voiceping', 'voicechannelping'],
			description: "Provides the latency and ws of the Ame's voice connection!",
			category: 'Utility',
			guildOnly: true
		});
	}

	async run(message) {
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

		const wsLatency = queue.connection.voiceConnection.ping.ws;
		const udpLatency = queue.connection.voiceConnection.ping.udp;

		const voicePingEmbed = new MessageEmbed()
			.setDescription(`Websocket Latency: \`${wsLatency}ms\`\n UDP Latency: \`${udpLatency}ms\``)
			.setThumbnail(embed.thumbnails.ameZoom)
			.setColor(embed.color.default);
		return message.reply({ embeds: [voicePingEmbed] });
	}

};
