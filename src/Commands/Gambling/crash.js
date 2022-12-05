/* eslint-disable max-len */
/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Bet a certain amount and stop the multiplier before it crashes!',
			usage: '<bet>',
			category: 'Fun',
			guildOnly: true
		});
	}

	async run(message, [bet]) {
		if (!bet) {
			const embed = new MessageEmbed()
				.addField('Help', 'Multiplier will go up and you have to stop before crash. If you win you get your **bet * multiplier**')
				.addField('Winnings', 'Up to 50x')
				.addField('Usage', 'crash <bet>')
				.setColor(this.client.utils.embed.color.default);
			return message.channel.send(embed);
		}

		const validPayment = await this.client.economy.isValidPayment(message, bet);

		if (!validPayment) return;

		let multiplier = 1.0;
		let profit = Math.round(bet * multiplier.toFixed(1)) - bet;
		const filter = (msg) => msg.content.includes('stop') && msg.author.id === message.author.id;

		const embed = new MessageEmbed()
			.setTitle(`Crash | User: ${message.author.username} | Bet: ${bet}`, message.author.displayAvatarURL({ dynamic: true }))
			.setDescription(`**Multiplier**\n1.0\n**Profit**\n ${profit} credits`)
			.setColor('fce3b7')
			.setFooter(`Reply with stop to stop`);
		const msg = await message.channel.send(embed);

		const collector = message.channel.createMessageCollector(filter, { max: 1 });
		collector.on('collect', async () => {
			clearInterval(gameLoop);
			this.client.games.delete(message.channel.id);
			const newBalance = await this.client.economy.addCredits(message.guild.id, message.author.id, profit);
			return msg.edit(embed
				.setDescription(`**Stopped at**\n${multiplier.toFixed(1)}x\n**Profit**\n ${profit} credits\n**Credits**\nYou have ${this.client.utils.formatNumber(newBalance)} credits`)
				.setColor('GREEN'));
		});

		const gameLoop = setInterval(async () => {
			const probability = Math.random();
			multiplier += 0.2;
			profit = Math.round(bet * multiplier.toFixed(1)) - bet;

			if (probability > 0.90) {
				collector.stop();
				this.client.games.delete(message.channel.id);
				const newBalance = await this.client.economy.addCredits(message.guild.id, message.author.id, -bet);
				msg.edit(embed
					.setDescription(`**Crashed at**\n${multiplier.toFixed(1)}x\n**Profit**\n-${this.client.utils.formatNumber(bet)} credits\nCredits\nYou have ${this.client.utils.formatNumber(newBalance)} credits`)
					.setColor(this.client.embed.color.error));
				return clearInterval(gameLoop);
			}

			msg.edit(embed.setDescription(`**Multiplier**\n${multiplier.toFixed(1)}x\n**Profit**\n ${this.client.utils.formatNumber(profit)} credits`));

			if (multiplier === 50) {
				this.client.games.delete(message.channel.id);
				const newBalance = await this.client.economy.addCredits(message.guild.id, message.author.id, profit);
				msg.edit(embed.setDescription(`**🎉JACKPOT🎉**\n${multiplier.toFixed(1)}x\n**Profit**\n-${this.client.utils.formatNumber(profit)} credits\nCredits\nYou have ${this.client.utils.formatNumber(newBalance)} credits`));
				return clearInterval(gameLoop);
			}
		}, 1500);
	}

};
