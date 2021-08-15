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
				.addField('Winnings', `**🍋🍋❔ - 0.5x\n🍎🍎❔ - 2x\n🍀🍀❔ - 2x\n🍋🍋🍋 - 2.5x\n🍎🍎🍎 - 3x\n🍇🍇❔ - 3.5x\n🍀🍀🍀 - 4x\n💎💎❔ - 7x\n🍇🍇🍇 - 7x\n💎💎💎 - 15x**`)
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
		const symbols = ['🍋', '🍇', '💎', '🍀', '🍎'];
		const doubles = {};
		doubles['🍋'] = 0.5;
		doubles['🍎'] = 2;
		doubles['🍀'] = 2;
		doubles['🍇'] = 3.5;
		doubles['💎'] = 7;
		const triples = {};
		triples['🍋'] = 2.5;
		triples['🍎'] = 3;
		triples['🍀'] = 4;
		triples['🍇'] = 7;
		triples['💎'] = 15;

		const randomSlots = new Array(3);
		randomSlots.fill(emoji.fruit);
		const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

		this.client.games.set(message.channel.id, { name: this.name });

		const slotEmbed = new MessageEmbed()
			.setTitle(`Slots | User: ${message.author.username} | Bet: ${bet}`)
			.setDescription(`**${border}\n| ${randomSlots.join(' | ')} |\n${border}\n--- SPINNING ---**`)
			.setColor(this.client.embed.color.default);
		const msg = await message.channel.send({ embeds: [slotEmbed] });

		for (let i = 0; i < 3; i++) {
			await sleep(1700);

			slot.push(symbols[Math.floor(Math.random() * symbols.length)]);
			randomSlots[i] = slot[i];

			slotEmbed.setDescription(`**${border}\n| ${randomSlots.join(' | ')} |\n${border}\n--- SPINNING ---**`);
			msg.edit({ embeds: [slotEmbed] });
		}

		const triplesWin = slot[0] === slot[1] && slot[0] === slot[2];
		const doublesWin = slot[0] === slot[1] || slot[1] === slot[2];
		const triplesProfit = Math.floor(bet * triples[slot[0]]);
		const doublesProfit = Math.floor(bet * doubles[slot[1]]);
		this.client.games.delete(message.channel.id);
		const win = triplesWin || doublesWin;

		if (win) {
			const profit = triplesWin ? triplesProfit : doublesProfit;
			const newBalance = await this.client.economy.addCredits(message.guild.id, message.author.id, profit);

			slotEmbed.setDescription(`**${border}\n| ${randomSlots.join(' | ')} |\n${border}\n--- YOU WON ---**`);
			slotEmbed.addFields(
				{ name: 'Profit', value: `**${profit}** credits`, inline: true },
				{ name: 'Credits', value: `You have ${newBalance} credits`, inline: true });
			slotEmbed.setColor(this.client.embed.color.success);

			return msg.edit({ embeds: [slotEmbed] });
		} else {
			const newBalance = await this.client.economy.addCredits(message.guild.id, message.author.id, -bet);

			slotEmbed.setDescription(`**${border}\n| ${randomSlots.join(' | ')} |\n${border}\n--- YOU LOSE ---**`);
			slotEmbed.addFields(
				{ name: 'Profit', value: `**${-bet}** credits`, inline: true },
				{ name: 'Credits', value: `You have ${newBalance} credits`, inline: true });
			slotEmbed.setColor(this.client.embed.color.error);

			return msg.edit({ embeds: [slotEmbed] });
		}
	}

};
