const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['bal'],
			description: 'Returns the balance of a specified user',
			category: 'Economy',
			usage: '<optional user>',
			guildOnly: true
		});
	}

	async run(message, [target]) {
		target = message.mentions.users.first() || message.author;
		const credits = await this.client.economy.getCredits(message.guild.id, target.id);

		const balanceEmbed = new MessageEmbed()
			.setAuthor(target.username, target.displayAvatarURL())
			.setDescription(`Balance: ${this.client.utils.formatNumber(credits)}`)
			.setColor(this.client.embed.color.default);

		return message.channel.send({ embeds: [balanceEmbed] });
	}

};
