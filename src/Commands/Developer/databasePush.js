const Command = require('../../Structures/Command');
// const guildDatabase = require('../../Models/guildSchema');
// const profileDatabase = require('../../Models/profileSchema');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Pushes new properties to database documents',
			category: 'Developer',
			ownerOnly: true
		});
	}

	async run() {
		// const database = await guildDatabase.updateMany({}, { $rename: { "economyDailies": "dailyAmount" } });
		// const updateDoc = { $set: { dailyClaimed: new Date().getTime() } };
		// const database = await profileDatabase.updateMany({}, updateDoc);
		// console.log(database);
	}

};
