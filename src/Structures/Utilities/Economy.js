const { MessageEmbed } = require('discord.js');

module.exports = class Economy {

	constructor(client) {
		this.client = client;
	}

	async getCredits(userID, guildID) {
		const wallet = await this.client.database.fetchUser(userID, guildID);

		return wallet ? wallet.credits : 0;
	}


	async addCredits(userID, guildID, addCredits) {
		const wallet = await this.client.database.fetchUser(userID, guildID);

		wallet.credits += addCredits;
		wallet.save().catch(err => console.log(err));

		return wallet.credits;
	}

	async subtractCredits(userID, guildID, addCredits) {
		const wallet = await this.client.database.fetchUser(userID, guildID);

		wallet.credits -= addCredits;
		wallet.save().catch(err => console.log(err));

		return wallet.credits;
	}

	async setBalance(userID, guildID, newBalance) {
		const wallet = await this.client.database.fetchUser(userID, guildID);

		wallet.credits = newBalance;
		wallet.save().catch(err => console.log(err));
	}

	async isValidPayment(message, bet) {
		if (!bet) bet = 0.5;

		const balance = await this.getCredits(message.author.id, message.guild.id);

		// eslint-disable-next-line no-bitwise
		const validPayment = !!(bet >>> 0 === parseFloat(bet) && bet <= balance);

		if (!validPayment) {
			const howToPlayEmbed = new MessageEmbed()
				.addField('Invalid Payment', 'Please provide a valid amount of credits.')
				.addField('Current Balance', `You have ${balance} credits`)
				.setColor(this.client.embed.color.error);
			message.reply({ embeds: [howToPlayEmbed] });
		}

		return validPayment;
	}

};
