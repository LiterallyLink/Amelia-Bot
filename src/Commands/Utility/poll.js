const { MessageEmbed } = require('discord.js');
const Command = require('../../Structures/Command');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Create a simple poll for users to vote on.',
			category: 'Utility'
		});
	}

	async run(message, args) {
		const noQuotes = args.split('"').join('');

        console.log(noQuoutes);
		const pollEmbed = new MessageEmbed()
			.setColor(this.client.embed.color.default);
		return message.channel.send();
	}

};
