const { MessageEmbed } = require('discord.js');
const Profile = require('../../Models/profileSchema');

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
		addCredits = parseInt(addCredits);

		wallet.credits += addCredits;
		wallet.save().catch(err => console.log(err));

		return wallet.credits;
	}

	async subtractCredits(userID, guildID, addCredits) {
		const wallet = await this.client.database.fetchUser(userID, guildID);
		addCredits = parseInt(addCredits);

		wallet.credits -= addCredits;
		wallet.save().catch(err => console.log(err));

		return wallet.credits;
	}

	async setBalance(userID, guildID, newBalance) {
		const wallet = await this.client.database.fetchUser(userID, guildID);
		newBalance = parseInt(newBalance);

		wallet.credits = newBalance;
		wallet.save().catch(err => console.log(err));
	}

	async fetchLeaderboard(guildId, limit) {
		const users = await Profile.find({ guildId: guildId })
			.sort([['credits', 'descending']]).exec();

		return users.slice(0, limit);
	}

	async isValidPayment(message, bet) {
		const balance = await this.getCredits(message.author.id, message.guild.id);

		// eslint-disable-next-line no-bitwise
		const validPayment = bet > 0 && bet % 1 === 0 && balance >= bet;

		if (!bet || !validPayment) {
			const howToPlayEmbed = new MessageEmbed()
				.addField('Invalid Payment', 'Please provide a valid amount of holocoins.')
				.addField('Current Balance', `You have ${balance} holocoins`)
				.setColor(this.client.embed.color.error);
			message.reply({ embeds: [howToPlayEmbed] });
		}

		return validPayment;
	}

};
