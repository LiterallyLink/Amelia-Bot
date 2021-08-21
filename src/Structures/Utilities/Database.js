const GuildSchema = require('../../Models/guildSchema');
const Profile = require('../../Models/profileSchema');

module.exports = class Database {

	constructor(client) {
		this.client = client;
	}


	// Fetches the prefix for guild and DMs
	async getPrefix(message) {
		let clientPrefix = this.client.prefix;

		if (!message.guild) return clientPrefix;

		const settings = await this.fetchGuild(message.guild).catch(err => console.log(err));

		if (settings) clientPrefix = settings.prefix;

		return clientPrefix;
	}

	async fetchUser(userID, guildID) {
		const userProfile = await Profile.findOne({ userId: userID, guildId: guildID });

		if (!userProfile) await this.createUserProfile(userID, guildID).catch(err => console.log(err));

		return userProfile;
	}

	async createUserProfile(userID, guildID) {
		const newUser = new Profile({
			userId: userID,
			guildId: guildID
		});

		await newUser.save().catch(err => console.log(`Failed to create user: ${err}`));
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

};
