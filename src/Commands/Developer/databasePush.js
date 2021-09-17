const Command = require('../../Structures/Command');
const guildDatabase = require('../../Models/guildSchema');
// const profileDatabase = require('../../Models/profileSchema');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Pushes new properties to database documents',
			category: 'Developer',
			devOnly: true
		});
	}

	async run() {
		// await this.addNewItemToDocuments();
	}

	async addNewItemToDocuments() {
		try {
			const guildUpdateLog = await guildDatabase.updateMany({}, { $set: { customCommands: [] } });
			console.log(guildUpdateLog);
		} catch (err) {
			console.log(err);
		}
	}

};
