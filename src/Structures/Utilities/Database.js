/* eslint-disable consistent-return */
const GuildSchema = require('../../Models/guildSchema');
const custom = require('../../Models/customCommand');
const profile = require('../../Models/profileSchema');

module.exports = class Database {

	constructor(client) {
		this.client = client;
	}


	async getPrefix(message) {
		let clientPrefix = this.client.prefix;

		if (!message.guild) return clientPrefix;

		const settings = await this.fetchGuild(message.guild);

		if (settings) clientPrefix = settings.prefix;

		return clientPrefix;
	}

	async fetchGuild(guild) {
		const server = await GuildSchema.findOne({ guildID: guild.id }, (err) => {
			if (err) console.error(err);
		});

		if (!server) await this.guildSchemaCreate(guild);

		return server;
	}

	async guildSchemaCreate(guild) {
		const newGuild = new GuildSchema({
			guildID: guild.id,
			guildName: guild.name
		});

		newGuild.save()
			.then(result => console.log(result))
			.catch(error => console.error(error));
	}

	async customCommand(message, prefix) {
		if (!message.guild) return;

		custom.findOne({
			guildID: message.guild.id,
			Command: message.content.slice(prefix.length)
		},
		(err, data) => {
			if (err) throw err;
			if (data) return message.channel.send(data.Content);
		});
	}

	async isUserBlacklisted(message) {
		const user = await this.fetchUser(message.guild.id, message.author.id);
		console.log(user);

		return false;
	}

	async fetchBlacklisted() {
		const blacklisted = await profile.find({ isBlacklisted: true });
		const blacklistedUsers = blacklisted.map(user => `<@${user.userId}> - ${user.userId}`);
		return blacklistedUsers;
	}

	async blacklist(message, user, boolean) {
		const blacklisted = await this.fetchUser(message.guild.id, user.id);
		if (blacklisted.isBlacklisted === boolean) {
			const booleanState = boolean ? 'already' : 'not';
			return message.reply(`This user is ${booleanState} blacklisted`)
				.then(msg => msg.delete({ timeout: 10000 }));
		}
		blacklisted.isBlacklisted = boolean;
		await blacklisted.save().catch(err => console.log(`Failed to blacklist ${user} ${err}`));
	}

	async fetchUser(guildID, userID) {
		const userProfile = await profile.findOne({ guildId: guildID, userId: userID });
		return userProfile;
	}

};
