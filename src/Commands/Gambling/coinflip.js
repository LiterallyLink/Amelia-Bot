/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const coinChoice = ['heads', 'tails'];

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['coin', 'flip'],
			description: 'Place your bet and flip a coin to win or lose it all!',
			category: 'Gambling',
			usage: '(heads or tails) (bet)',
			args: true,
			guildOnly: true
		});
	}

	async run(message, [choice, bet]) {
		if (!bet || !choice || !coinChoice.includes(choice.toLowerCase())) {
			const howToPlayEmbed = new MessageEmbed()
				.setTitle('How To Play Coinflip!')
				.addField('Usage', `\`${this.usage}\``)
				.setColor(this.client.embed.color.default);
			return message.reply({ embeds: [howToPlayEmbed] });
		}

		const validBet = await this.client.economy.isValidPayment(message, bet);
		if (!validBet) return;

		const headsOrTails = this.client.utils.randomRange(1, 2) < 1 ? 'heads' : 'tails';

		if (choice.toLowerCase() === headsOrTails) {
			await this.client.economy.addCredits(message.author.id, message.guild.id, bet * 2);

			const userWonEmbed = new MessageEmbed()
				.setDescription(`Congrats! You flipped ${headsOrTails}`)
				.setFooter(`💸 You won ${bet} holocoins`)
				.setColor(this.client.embed.color.success);
			return message.channel.send({ embeds: [userWonEmbed] });
		} else {
			await this.client.economy.subtractCredits(message.author.id, message.guild.id, bet);

			const userLostEmbed = new MessageEmbed()
				.setDescription(`Uh oh. . .the coin landed on ${headsOrTails}`)
				.setFooter(`You lost ${bet} holocoins`)
				.setColor(this.client.embed.color.error);
			return message.channel.send({ embeds: [userLostEmbed] });
		}
	}

};
