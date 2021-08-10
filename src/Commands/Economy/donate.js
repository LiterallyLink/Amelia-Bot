const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['pay'],
			description: 'Donate currency to a specified user',
			category: 'Economy',
			usage: '<user>',
			guildOnly: true,
			args: true
		});
	}

	async run(message, [target, payment]) {
		target = message.mentions.users.first();

		if (!target) {
			const invalidTarget = new MessageEmbed()
				.setDescription(`Please mention a valid user to donate to.`)
				.setColor(this.client.embed.color.error);
			return message.channel.send({ embeds: [invalidTarget] });
		}

		const validPayment = await this.client.economy.isValidPayment(message, payment);
		// eslint-disable-next-line consistent-return
		if (!validPayment) return;

		const targetBal = await this.client.economy.addCredits(message.guild.id, target.id, payment);
		const newUserBal = await this.client.economy.addCredits(message.guild.id, message.author.id, -payment);

		const successfulPaymentEmbed = new MessageEmbed()
			.setTitle('Donation Successful')
			.setDescription(`From: ${message.author}, To: ${target}, Amount: ${payment}`)
			.addFields({ name: 'You have:', value: `${newUserBal} credits` },
				{ name: `${target.username} has:`, value: `${targetBal} credits` })
			.setColor(this.client.embed.color.default);

		return message.channel.send({ embeds: [successfulPaymentEmbed] });
	}

};
