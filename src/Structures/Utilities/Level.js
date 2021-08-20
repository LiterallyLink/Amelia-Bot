const Levels = require('../../Models/profileSchema');

module.exports = class Level {

	constructor(client) {
		this.client = client;
	}

	async assignXP(message) {
		const { xpSettings, levelUpMsg } = await this.client.database.fetchGuild(message.guild);
		const randomXp = this.client.utils.randomRange(xpSettings.minXPGain, xpSettings.maxXPGain);
		const leveledUp = await this.appendXP(message.author.id, message.guild.id, randomXp);

		if (leveledUp === true && levelUpMsg === true) {
			const user = await this.client.database.fetchUser(message.author.id, message.guild.id);
			message.channel.send(`Congrats ${message.author}, you've leveled up to level ${user.level}!`);
		}
	}

	async fetchLevel(userID, guildID) {
		const user = await this.client.database.fetchUser(userID, guildID);

		return user ? user.level : 0;
	}

	async levelUp(userID, guildID) {
		const user = await this.client.database.fetchUser(userID, guildID);

		const newLevel = Math.floor(0.1 * Math.sqrt(user.xp));
		user.xp = newLevel * newLevel * 100;
		user.lastUpdated = new Date();

		user.save().catch(err => console.log(err));

		return user;
	}

	async setLevel(userID, guildID, newLevel) {
		const user = await this.client.database.fetchUser(userID, guildID);

		user.level = newLevel;
		user.xp = newLevel * newLevel * 100;
		user.lastUpdated = new Date();

		user.save().catch(err => console.log(err));
		return user;
	}

	async setXP(userID, guildID, newXP) {
		const user = await this.client.database.fetchUser(userID, guildID);

		user.xp = newXP;
		user.level = Math.floor(0.1 * Math.sqrt(user.xp));
		user.lastUpdated = new Date();

		user.save().catch(err => console.log(err));
		return user;
	}

	async appendXP(userID, guildID, xp) {
		const user = await this.client.database.fetchUser(userID, guildID);

		user.xp += parseInt(xp, 10);
		user.level = Math.floor(0.1 * Math.sqrt(user.xp));
		user.lastUpdated = new Date();

		await user.save().catch(err => console.log(`Failed to append xp: ${err}`));

		return Math.floor(0.1 * Math.sqrt(user.xp -= xp)) < user.level;
	}

	async fetchLeaderboard(guild, limit) {
		const users = await Levels.find({ guildId: guild.id }).sort([['xp', 'descending']]).exec();

		return users.slice(0, limit);
	}

	async fetchRank(userID, guildID) {
		const rank = await Levels.find({ guildId: guildID }).sort([['xp', 'descending']]).exec();

		return rank.findIndex(i => i.userId === userID) + 1;
	}

	xpFor(targetLevel) {
		if (isNaN(targetLevel)) targetLevel = parseInt(targetLevel, 10);

		return targetLevel * targetLevel * 100;
	}

};
