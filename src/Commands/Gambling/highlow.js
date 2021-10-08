/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			category: 'Gambling',
			usage: '(bet)',
			guildOnly: true
		});
	}

	async run(message, [bet]) {
		if (!bet) {
			const howToPlayEmbed = new MessageEmbed()
				.setTitle('How To Play')
				.setDescription(`Guess if the number is high or low (low = 1-5, high = 6-10)`)
				.addField('Usage', `${this.usage}`)
				.setColor(this.client.embed.color.default);
			return message.reply({ embeds: [howToPlayEmbed] });
		}

		const validBet = await this.client.economy.isValidPayment(message, bet);

		if (!validBet) {
			return;
		}

		const current = this.client.games.get(message.channel.id);

		if (current) {
			const gameInProgress = new MessageEmbed()
				.setDescription(`Please wait until the current game of \`${current.name}\` is finished.`)
				.setColor(this.client.embed.color.error);
			return message.reply({ embeds: [gameInProgress] });
		}

		this.client.games.set(message.channel.id, { name: this.name });

		const highOrLowButtons = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('high')
					.setLabel('High')
					.setStyle('SUCCESS'),

				new MessageButton()
					.setCustomId('low')
					.setLabel('Low')
					.setStyle('DANGER'),

				new MessageButton()
					.setCustomId('stop')
					.setLabel('Stop')
					.setStyle('PRIMARY')
			);


		const highOrLowEmbed = new MessageEmbed()
			.setAuthor(`Highlow - Bet ${bet}`, message.author.displayAvatarURL())
			.setDescription('Guess if the number is high or low.')
			.setFooter('low (1-5), high (6-10)')
			.setColor(this.client.embed.color.default);
		const initialMsg = await message.channel.send({ embeds: [highOrLowEmbed], components: [highOrLowButtons] });

		let multiplier = 0;
		let gameOver = false;
		let collectorMsg = initialMsg;

		while (!gameOver) {
			const randomNumber = this.client.utils.randomRange(1, 10);
			const highOrLowNumber = randomNumber > 5 ? 'high' : 'low';
			const highOrLowChoice = await this.client.utils.buttonCollector(message, collectorMsg, 60000);

			if (!highOrLowChoice) {
				gameOver = true;
				message.reply({ content: `The game has ended due to inactivity` });
				break;
			}

			const balance = await this.client.economy.getCredits(message.author.id, message.guild.id);

			if (highOrLowChoice === highOrLowNumber) {
				multiplier += 2;

				const youWonEmbed = new MessageEmbed()
					.setTitle(`Highlow - Bet ${bet}`, message.author.displayAvatarURL())
					.addField(`Correct!`, `Number: **${randomNumber}**`, true)
					.addField(`Multiplier`, `${multiplier}x`, true)
					.addField(`Guess again?`, `Select **high** or **low**`, true)
					.setFooter('Select stop to end the current game')
					.setColor(this.client.embed.color.success);
				const youWonMsg = await message.channel.send({ embeds: [youWonEmbed], components: [highOrLowButtons] });

				collectorMsg = youWonMsg;
			} else if (highOrLowChoice === 'stop') {
				const profit = bet * multiplier;

				if (multiplier > 0) {
					await this.client.economy.addCredits(message.author.id, message.guild.id, profit);
				}

				const gameOverEmbed = new MessageEmbed()
					.setTitle(`Highlow - Bet ${bet}`, message.author.displayAvatarURL())
					.addField('Stopped At', `${multiplier}x`, true)
					.addField('Profit', `${multiplier * bet} holocoins`, true)
					.addField('Balance', `You have ${balance + profit} holocoins`)
					.setColor(this.client.embed.color.default);
				message.channel.send({ embeds: [gameOverEmbed] });

				gameOver = true;
			} else {
				await this.client.economy.subtractCredits(message.author.id, message.guild.id, bet);

				const youLoseEmbed = new MessageEmbed()
					.setTitle(`Highlow - Bet ${bet}`, message.author.displayAvatarURL())
					.addField(`Incorrect!`, `Number: **${randomNumber}**`, true)
					.addField(`Profit`, `-${bet} holocoins`, true)
					.addField(`Balance`, `You have ${balance - bet} holocoins`, true)
					.setFooter('Better luck next time!')
					.setColor(this.client.embed.color.error);
				message.channel.send({ embeds: [youLoseEmbed] });

				gameOver = true;
			}
		}

		this.client.games.delete(message.channel.id);
	}

};
