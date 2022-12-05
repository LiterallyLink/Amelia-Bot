const { MessageEmbed } = require('discord.js');
const Command = require('../../Structures/Command');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Send a suggestion to the bot developer!',
			category: 'Miscellaneous',
			guildOnly: true
		});
	}

	async run(message, args) {
        console.log('unfinished');
    }
}