const { MessageEmbed } = require('discord.js');
const Command = require('../../Structures/Command');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['bugr'],
			description: 'Sends a detail bug report to the bot developer.',
			category: 'Miscellaneous',
			guildOnly: true
		});
	}

	async run(message, args) {
        console.log('unfinished');
	}

};
