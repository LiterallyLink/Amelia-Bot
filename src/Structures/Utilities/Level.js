const Levels = require('../../Models/profileSchema');

module.exports = class Level {

	constructor(client) {
		this.client = client;
	}

	async distributeXP(message) {
		const { xpSettings, levelUpMsg } = await this.client.database.fetchGuild(message.guild);
		const randomXp = this.client.utils.randomRange(xpSettings.minXPGain, xpSettings.maxXPGain);
		const hasLeveledUp = await this.appendXp(message.author.id, message.guild.id, randomXp);

		if (hasLeveledUp && levelUpMsg === true) {
			const user = await this.fetch(message.author.id, message.guild.id);
			message.channel.send(`${message.author} has leveled up to level ${user.level}!`);
		}
	}

	async createUser(userId, guildId) {
		if (!userId) throw new TypeError('An user id was not provided.');
		if (!guildId) throw new TypeError('A guild id was not provided.');

		const isUser = await Levels.findOne({ userId: userId, guildId: guildId });
		if (isUser) return false;

		const newUser = new Levels({
			userId: userId,
			guildId: guildId
		});

		await newUser.save().catch(err => console.log(`Failed to create user: ${err}`));

		return newUser;
	}

	async deleteUser(userId, guildId) {
		if (!userId) throw new TypeError('An user id was not provided.');
		if (!guildId) throw new TypeError('A guild id was not provided.');

		const user = await Levels.findOne({ userId: userId, guildId: guildId });
		if (!user) return false;

		await Levels.findOneAndDelete({ userId: userId, guildId: guildId }).catch(err => console.log(`Failed to delete user: ${err}`));

		return user;
	}

	async appendXp(userId, guildId, xp) {
		if (!userId) throw new TypeError('An user id was not provided.');
		if (!guildId) throw new TypeError('A guild id was not provided.');
		if (xp === 0 || !xp || isNaN(parseInt(xp))) throw new TypeError('An amount of xp was not provided/was invalid.');

		const user = await Levels.findOne({ userId: userId, guildId: guildId });

		if (!user) {
			const newUser = new Levels({
				userId: userId,
				guildId: guildId,
				xp: xp,
				level: Math.floor(0.1 * Math.sqrt(xp))
			});

			await newUser.save().catch(console.log(`Failed to save new user.`));

			return Math.floor(0.1 * Math.sqrt(xp)) > 0;
		}

		user.xp += parseInt(xp, 10);
		user.level = Math.floor(0.1 * Math.sqrt(user.xp));
		user.lastUpdated = new Date();

		await user.save().catch(err => console.log(`Failed to append xp: ${err}`));

		return Math.floor(0.1 * Math.sqrt(user.xp -= xp)) < user.level;
	}

	async appendLevel(userId, guildId, levelss) {
		if (!userId) throw new TypeError('An user id was not provided.');
		if (!guildId) throw new TypeError('A guild id was not provided.');
		if (!levelss) throw new TypeError('An amount of levels was not provided.');

		const user = await Levels.findOne({ userId: userId, guildId: guildId });
		if (!user) return false;

		user.level += parseInt(levelss, 10);
		user.xp = user.level * user.level * 100;
		user.lastUpdated = new Date();

		user.save().catch(err => console.log(`Failed to append level: ${err}`));

		return user;
	}

	async setXp(userId, guildId, xp) {
		if (!userId) throw new TypeError('An user id was not provided.');
		if (!guildId) throw new TypeError('A guild id was not provided.');
		if (xp === 0 || !xp || isNaN(parseInt(xp))) throw new TypeError('An amount of xp was not provided/was invalid.');

		const user = await Levels.findOne({ userId: userId, guildId: guildId });
		if (!user) return false;

		user.xp = xp;
		user.level = Math.floor(0.1 * Math.sqrt(user.xp));
		user.lastUpdated = new Date();

		user.save().catch(err => console.log(`Failed to set xp: ${err}`));

		return user;
	}

	async setLevel(userId, guildId, level) {
		if (!userId) throw new TypeError('An user id was not provided.');
		if (!guildId) throw new TypeError('A guild id was not provided.');
		if (!level) throw new TypeError('A level was not provided.');

		const user = await Levels.findOne({ userId: userId, guildId: guildId });
		if (!user) return false;

		user.level = level;
		user.xp = level * level * 100;
		user.lastUpdated = new Date();

		user.save().catch(err => console.log(`Failed to set level: ${err}`));

		return user;
	}

	async fetch(userId, guildId, fetchPosition = false) {
		if (!userId) throw new TypeError('An user id was not provided.');
		if (!guildId) throw new TypeError('A guild id was not provided.');

		const user = await Levels.findOne({
			userId: userId,
			guildId: guildId
		});
		if (!user) return false;

		if (fetchPosition === true) {
			const leaderboard = await Levels.find({
				guildId: guildId
			}).sort([['xp', 'descending']]).exec();

			user.position = leaderboard.findIndex(i => i.userId === userId) + 1;
		}

		user.cleanXp = user.xp - this.xpFor(user.level);
		user.cleanNextLevelXp = this.xpFor(user.level + 1) - this.xpFor(user.level);

		return user;
	}

	async subtractXp(userId, guildId, xp) {
		if (!userId) throw new TypeError('An user id was not provided.');
		if (!guildId) throw new TypeError('A guild id was not provided.');
		if (xp === 0 || !xp || isNaN(parseInt(xp))) throw new TypeError('An amount of xp was not provided/was invalid.');

		const user = await Levels.findOne({ userId: userId, guildId: guildId });
		if (!user) return false;

		user.xp -= xp;
		user.level = Math.floor(0.1 * Math.sqrt(user.xp));
		user.lastUpdated = new Date();

		user.save().catch(err => console.log(`Failed to subtract xp: ${err}`));

		return user;
	}

	static async subtractLevel(userId, guildId, levelss) {
		if (!userId) throw new TypeError('An user id was not provided.');
		if (!guildId) throw new TypeError('A guild id was not provided.');
		if (!levelss) throw new TypeError('An amount of levels was not provided.');

		const user = await Levels.findOne({ userId: userId, guildId: guildId });
		if (!user) return false;

		user.level -= levelss;
		user.xp = user.level * user.level * 100;
		user.lastUpdated = new Date();

		user.save().catch(err => console.log(`Failed to subtract levels: ${err}`));

		return user;
	}

	async fetchLeaderboard(guildId, limit) {
		if (!guildId) throw new TypeError('A guild id was not provided.');
		if (!limit) throw new TypeError('A limit was not provided.');

		var users = await Levels.find({ guildId: guildId }).sort([['xp', 'descending']]).exec();

		return users.slice(0, limit);
	}

	async computeLeaderboard(client, leaderboard, fetchUsers = false) {
		if (!client) throw new TypeError('A client was not provided.');
		if (!leaderboard) throw new TypeError('A leaderboard id was not provided.');

		if (leaderboard.length < 1) return [];

		const computedArray = [];

		if (fetchUsers) {
			for (const key of leaderboard) {
				const user = await client.users.fetch(key.userId) || { username: 'Unknown', discriminator: '0000' };
				computedArray.push({
					guildId: key.guildId,
					userId: key.userId,
					xp: key.xp,
					level: key.level,
					position: leaderboard.findIndex(i => i.guildId === key.guildId && i.userId === key.userId) + 1,
					username: user.username,
					discriminator: user.discriminator
				});
			}
		} else {
			leaderboard.map(key => computedArray.push({
				guildId: key.guildId,
				userId: key.userId,
				xp: key.xp,
				level: key.level,
				position: leaderboard.findIndex(i => i.guildId === key.guildId && i.userId === key.userId) + 1,
				username: client.users.cache.get(key.userId) ? client.users.cache.get(key.userId).username : 'Unknown',
				discriminator: client.users.cache.get(key.userId) ? client.users.cache.get(key.userId).discriminator : '0000'
			}));
		}

		return computedArray;
	}

	xpFor(targetLevel) {
		if (isNaN(targetLevel) || isNaN(parseInt(targetLevel, 10))) throw new TypeError('Target level should be a valid number.');
		if (isNaN(targetLevel)) targetLevel = parseInt(targetLevel, 10);
		if (targetLevel < 0) throw new RangeError('Target level should be a positive number.');
		return targetLevel * targetLevel * 100;
	}

	async deleteGuild(guildId) {
		if (!guildId) throw new TypeError('A guild id was not provided.');

		const guild = await Levels.findOne({ guildId: guildId });
		if (!guild) return false;

		await Levels.deleteMany({ guildId: guildId }).catch(err => console.log(`Failed to delete guild: ${err}`));

		return guild;
	}

};
