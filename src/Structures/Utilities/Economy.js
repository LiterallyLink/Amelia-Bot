const Profile = require('../../Models/profileSchema');
const { MessageEmbed } = require('discord.js');

module.exports = class Economy {

	constructor(client) {
		this.client = client;
	}

	async getCredits(guildID, userID) {
		const wallet = await Profile.findOne({ guildId: guildID, userId: userID });

		if (!wallet) {
			const newData = new Profile({
				guildId: guildID,
				userId: userID,
				credits: 0
			});

			await newData.save()
				.catch(err => console.log(err));
		}

		return wallet ? wallet.credits : 0;
	}


	async addCredits(guildID, userID, credits) {
		const result = await Profile.findOneAndUpdate({
			guildId: guildID,
			userId: userID
		}, {
			guildId: guildID,
			userId: userID,
			$inc: {
				credits
			}
		}, {
			upsert: true,
			new: true,
			useFindAndModify: false
		});
		return result.credits;
	}

	async setCredits(guildId, userId, credits) {
		const bal = await this.getCredits(guildId, userId);
		await this.addCredits(guildId, userId, -bal);
		const newBal = await this.addCredits(guildId, userId, credits);
		return newBal;
	}

	async fetchLeaderboard(guildId, limit) {
		const users = await Profile.find({ guildId: guildId })
			.sort([['credits', 'descending']])
			.exec();

		return users.slice(0, limit);
	}

	async isValidPayment(message, bet) {
		if (!bet) bet = 0.5;

		const balance = await this.getCredits(message.guild.id, message.author.id);
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
