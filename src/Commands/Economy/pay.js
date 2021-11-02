const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Donate holocoins to a specified user',
			category: 'Economy',
			usage: '(user) (amount)',
			guildOnly: true,
			args: true
		});
	}

	async run(message, [target, payment]) {
		target = message.mentions.users.first();

		if (!target) {
			const invalidTarget = new MessageEmbed()
				.setDescription(`Please mention a valid user to donate to.`)
				.setThumbnail(this.client.embed.thumbnails.ameShake)
				.setColor(this.client.embed.color.error);
			return message.channel.send({ embeds: [invalidTarget] });
		}

		const validPayment = await this.client.economy.isValidPayment(message, payment);
		// eslint-disable-next-line consistent-return
		if (!validPayment) return;

		const targetBal = await this.client.economy.addCredits(target.id, message.guild.id, payment);
		const newUserBal = await this.client.economy.subtractCredits(message.author.id, message.guild.id, payment);

		const successfulPaymentEmbed = new MessageEmbed()
			.setTitle('Donation Successful')
			.setDescription(`From: ${message.author}, To: ${target}, Amount: ${payment}`)
			.addFields({ name: 'You have:', value: `${newUserBal} holocoins` },
				{ name: `${target.username} has:`, value: `${targetBal} holocoins` })
			.setColor(this.client.embed.color.default);

		return message.channel.send({ embeds: [successfulPaymentEmbed] });
	}

};
