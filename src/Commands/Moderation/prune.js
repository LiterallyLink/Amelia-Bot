const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['purge', 'clear'],
			description: "Clear's a specified amount of messages from the designated channel",
			category: 'Moderation',
			usage: '(amount)',
			userPerms: ['MANAGE_MESSAGES'],
			botPerms: ['MANAGE_MESSAGES'],
			args: true,
			guildOnly: true
		});
	}

	async run(message, [toClear]) {
		if (!this.client.utils.isInt(toClear) || toClear < 1 || toClear > 100) {
			const invalidNumEmbed = new MessageEmbed()
				.setTitle('Youch! I bumped into an error!')
				.setDescription('Please provide a valid number of messages to clear!')
				.setThumbnail(this.client.embed.thumbnails.ameShake)
				.setColor(this.client.embed.color.error);
			return message.channel.send({ embeds: [invalidNumEmbed] });
		}

		await message.delete();

		await message.channel.bulkDelete(toClear);

		return message.channel.send(`${toClear} message(s) were cleared!`);
	}

};
