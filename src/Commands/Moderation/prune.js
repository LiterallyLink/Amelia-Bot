const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['purge', 'clear'],
			description: "Clear's a specified amount of messages from the designated channel",
			category: 'Moderation',
			usage: '(amount)',
			userPerms: ['ADMINISTRATOR'],
			botPerms: ['ADMINISTRATOR'],
			args: true,
			guildOnly: true
		});
	}

	async run(message, [toClear]) {
		if (!toClear || toClear <= 0 || toClear > 100) {
			const ErrorEmbed = new MessageEmbed()
				.setTitle('Youch! I bumped into an error!')
				.setColor(0xff0000)
				.addField('Error', `\`\`\`Please specify how many messages you would like to delete 1-100\`\`\``)
				.setTimestamp();

			return message.channel.send(ErrorEmbed);
		}

		await message.delete();
		return message.channel.bulkDelete(toClear)
			.then(() => message.channel.send(`${toClear} message(s) were cleared!`));
	}

};
