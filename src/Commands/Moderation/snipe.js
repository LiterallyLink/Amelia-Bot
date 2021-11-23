const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Retrieves the most recently deleted message.',
			category: 'Moderation',
			userPerms: ['MANAGE_MESSAGES'],
			guildOnly: true
		});
	}

	async run(message) {
		const msg = this.client.snipes.get(message.channel.id);

		if (!msg) {
			const noSnipeToRetrieve = new MessageEmbed()
				.setDescription('No messages to retrieve.')
				.setThumbnail(this.client.embed.thumbnails.ameShake)
				.setColor(this.client.embed.color.error);
			return message.channel.send({ embeds: [noSnipeToRetrieve] });
		}

		const snipedMessage = new MessageEmbed()
			.setAuthor(`Sniped Message:`)
			.addField(`Message`, `${msg.content ? msg.content : 'No Message'}`)
			.addField(`Sender`, `User: ${msg.author} | ID: ${msg.author.id}`)
			.setColor(this.client.embed.color.default);

		if (msg.image) {
			snipedMessage.setImage(msg.image);
		}

		return message.channel.send({ embeds: [snipedMessage] });
	}

};
