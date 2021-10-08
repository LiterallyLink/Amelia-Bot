/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const cupGif = require('../../../assets/jsons/ameCup.json');
const cupArr = ['Cup1', 'Cup2', 'Cup3'];

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			category: 'Gambling',
			usage: '(bet)',
			args: true,
			guildOnly: true
		});
	}

	async run(message, [bet]) {
		if (!bet) {
			const howToPlayEmbed = new MessageEmbed()
				.setTitle('How To Play')
				.setImage(cupGif.random)
				.setDescription(``)
				.addField('Usage', `${this.usage}`)
				.setColor(this.client.embed.color.default);
			return message.reply({ embeds: [howToPlayEmbed] });
		}

		const validBet = await this.client.economy.isValidPayment(message, bet);

		if (!validBet) {
			return;
		}

		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('Cup1')
					.setLabel('Cup 1')
					.setStyle('DANGER'),

				new MessageButton()
					.setCustomId('Cup2')
					.setLabel('Cup 2')
					.setStyle('DANGER'),

				new MessageButton()
					.setCustomId('Cup3')
					.setLabel('Cup 3')
					.setStyle('DANGER')
			);

		const cupEmbed = new MessageEmbed()
			.setImage(cupGif.random)
			.setFooter('Which cup is Ame hiding in?')
			.setColor(this.client.embed.color.default);
		const cupMsg = await message.channel.send({ embeds: [cupEmbed], components: [row] });

		const cupID = await this.client.utils.buttonCollector(message, cupMsg, 60000);
		const randomCup = cupArr[this.client.utils.randomRange(1, cupArr.length) - 1];

		if (!cupID) {
			return message.reply('The game has ended due to inactivity.');
		}

		if (cupID === randomCup) {
			await this.client.economy.addCredits(message.author.id, message.guild.id, bet);

			const youWonEmbed = new MessageEmbed()
				.setImage(cupGif[randomCup])
				.setDescription(`Congrats! Ame was hiding under ${randomCup}!`)
				.setFooter(`💸 You won ${bet} holocoins!`)
				.setColor(this.client.embed.color.success);
			return cupMsg.edit({ embeds: [youWonEmbed], components: [] });
		} else {
			await this.client.economy.subtractCredits(message.author.id, message.guild.id, bet);

			const youLostEmbed = new MessageEmbed()
				.setImage(cupGif[randomCup])
				.setDescription(`Too bad! Ame was hiding under ${randomCup}. . .`)
				.setFooter(`💸 You lost ${bet} holocoins. . .`)
				.setColor(this.client.embed.color.error);
			return cupMsg.edit({ embeds: [youLostEmbed], components: [] });
		}
	}

};
