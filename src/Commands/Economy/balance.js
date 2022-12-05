const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['bal', 'credits'],
			description: 'Returns the balance of a specified user',
			category: 'Economy',
			usage: '<optional user>',
			guildOnly: true
		});
	}

	async run(message, [target]) {
		target = message.mentions.users.first() || message.author;
		const holocoins = await this.client.economy.getCredits(target.id, message.guild.id);

		const balanceEmbed = new MessageEmbed()
			.setAuthor(target.username, target.displayAvatarURL())
			.setDescription(`Balance: ${this.client.utils.formatNumber(holocoins)}`)
			.setColor(this.client.embed.color.default);

		return message.channel.send({ embeds: [balanceEmbed] });
	}

};
