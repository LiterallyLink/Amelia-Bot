const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Retrieves the most recently deleted message.',
			category: 'Moderation',
			userPerms: ['ADMINISTRATOR'],
			guildOnly: true
		});
	}

	async run(message) {
		const msg = this.client.snipes.get(message.channel.id);

		if (!msg) {
			const noSnipeToRetrieve = new MessageEmbed()
				.setDescription('No messages to retrieve.')
				.setColor(this.client.embed.color.error);
			return message.channel.send({ embeds: [noSnipeToRetrieve] });
		}

		const snipedMessage = new MessageEmbed()
			.setAuthor(`Sniped Message:`)
			.setDescription(`${msg.content}\nUser: ${msg.author} | ID: ${msg.author.id}`)
			.setColor(this.client.embed.color.default);

		if (msg.image) {
			snipedMessage.setImage(msg.image);
		}

		return message.channel.send({ embeds: [snipedMessage] });
	}

};
