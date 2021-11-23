const { MessageEmbed } = require('discord.js');
const Command = require('../../Structures/Command');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Provides the current uptime, api latency and bot latency',
			category: 'Utility'
		});
	}

	async run(message) {
		const botLatency = `\`${Date.now() - message.createdTimestamp}ms\``;
		const apiLatency = `\`${Math.round(this.client.ws.ping)}ms\``;
		const uptime = `\`${this.client.utils.msToTime(this.client.uptime, { long: true })}\``;

		const pingResponseEmbed = new MessageEmbed()
			.setDescription(`Bot Latency: ${botLatency}\n API Latency: ${apiLatency}\n Uptime: ${uptime}`)
			.setThumbnail(this.client.embed.thumbnails.ameZoom)
			.setColor(this.client.embed.color.default);
		return message.reply({ embeds: [pingResponseEmbed] });
	}

};
