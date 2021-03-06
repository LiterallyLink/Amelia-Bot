/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const emoji = require('../../../assets/jsons/emotes.json');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['slot'],
			description: 'Try your luck at the slot machine!',
			category: 'Gambling',
			usage: '<bet>',
			guildOnly: true
		});
	}

	async run(message, [bet]) {
		if (!bet) {
			const slotHelp = new MessageEmbed()
				.addField('Help', 'Slot Machine')
				.addField('Winnings', `**ššā - 0.5x\nššā - 2x\nššā - 2x\nššš - 2.5x\nššš - 3x\nššā - 3.5x\nššš - 4x\nššā - 7x\nššš - 7x\nššš - 15x**`)
				.addField('Usage', `${this.usage}`)
				.setColor(this.client.embed.color.default);
			return message.reply({ embeds: [slotHelp] });
		}

		const validPayment = await this.client.economy.isValidPayment(message, bet);
		if (!validPayment) return;

		const current = this.client.games.get(message.channel.id);

		if (current) {
			const inGame = new MessageEmbed()
				.setDescription(`Please wait until the current game of \`${current.name}\` is finished.`)
				.setColor(this.client.embed.color.error);
			return message.reply({ embeds: [inGame] });
		}

		const slot = [];
		const border = '---------------------';
		const symbols = ['š', 'š', 'š', 'š', 'š'];
		const doubles = {};
		doubles['š'] = 0.5;
		doubles['š'] = 2;
		doubles['š'] = 2;
		doubles['š'] = 3.5;
		doubles['š'] = 7;
		const triples = {};
		triples['š'] = 2.5;
		triples['š'] = 3;
		triples['š'] = 4;
		triples['š'] = 7;
		triples['š'] = 15;

		const randomSlots = new Array(3);
		randomSlots.fill(emoji.fruit);

		this.client.games.set(message.channel.id, { name: this.name });

		const slotEmbed = new MessageEmbed()
			.setTitle(`Slots | User: ${message.author.username} | Bet: ${bet}`)
			.setDescription(`**${border}\n| ${randomSlots.join(' | ')} |\n${border}\n--- SPINNING ---**`)
			.setColor(this.client.embed.color.default);
		const msg = await message.channel.send({ embeds: [slotEmbed] });

		for (let i = 0; i < 3; i++) {
			await this.client.utils.sleep(1700);

			slot.push(symbols[Math.floor(Math.random() * symbols.length)]);
			randomSlots[i] = slot[i];

			slotEmbed.setDescription(`**${border}\n| ${randomSlots.join(' | ')} |\n${border}\n--- SPINNING ---**`);
			msg.edit({ embeds: [slotEmbed] });
		}

		const triplesWin = slot[0] === slot[1] && slot[0] === slot[2];
		const doublesWin = slot[0] === slot[1] || slot[1] === slot[2];
		const triplesProfit = Math.floor(bet * triples[slot[0]]);
		const doublesProfit = Math.floor(bet * doubles[slot[1]]);
		const win = triplesWin || doublesWin;

		this.client.games.delete(message.channel.id);

		if (win) {
			const profit = triplesWin ? triplesProfit : doublesProfit;
			const newBalance = await this.client.economy.addCredits(message.author.id, message.guild.id, profit);

			slotEmbed.setDescription(`**${border}\n| ${randomSlots.join(' | ')} |\n${border}\n--- YOU WON ---**`);
			slotEmbed.addFields(
				{ name: 'Profit', value: `**${profit}** credits`, inline: true },
				{ name: 'Credits', value: `You have ${newBalance} credits`, inline: true });
			slotEmbed.setColor(this.client.embed.color.success);

			return msg.edit({ embeds: [slotEmbed] });
		} else {
			const newBalance = await this.client.economy.subtractCredits(message.author.id, message.guild.id, bet);

			slotEmbed.setDescription(`**${border}\n| ${randomSlots.join(' | ')} |\n${border}\n--- YOU LOSE ---**`);
			slotEmbed.addFields(
				{ name: 'Profit', value: `**-${bet}** credits`, inline: true },
				{ name: 'Credits', value: `You have ${newBalance} credits`, inline: true });
			slotEmbed.setColor(this.client.embed.color.error);

			return msg.edit({ embeds: [slotEmbed] });
		}
	}

};
