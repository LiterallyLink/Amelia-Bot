/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			category: 'Gambling',
			guildOnly: true
		});
	}

	async run(message, [bet]) {
		if (!bet) {
			const howToPlayEmbed = new MessageEmbed()
				.setTitle('How To Play')
				.addField('Usage', `${this.usage}`)
				.setColor(this.client.embed.color.default);
			return message.reply({ embeds: [howToPlayEmbed] });
		}

		const validBet = await this.client.economy.isValidPayment(message, bet);
		if (!validBet) return;

		const current = this.client.games.get(message.channel.id);

		if (current) {
			const gameInProgress = new MessageEmbed()
				.setDescription(`Please wait until the current game of \`${current.name}\` is finished.`)
				.setColor(this.client.embed.color.error);
			return message.reply({ embeds: [gameInProgress] });
		}

		this.client.games.set(message.channel.id, { name: this.name });
	}

};
