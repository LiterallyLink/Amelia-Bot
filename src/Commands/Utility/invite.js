const { MessageEmbed } = require('discord.js');
const config = require('../../../config.json');
const emote = require('../../../assets/jsons/emotes.json');
const Command = require('../../Structures/Command');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Provides a link to invite the bot to your guild',
			category: 'Utility'
		});
	}

	async run(message) {
		const inviteEmbed = new MessageEmbed()
			.setDescription(`${emote.link} To invite me to your server: [Click Here!](${config.invite})`)
			.setColor(this.client.embed.color.default);
		return message.reply({ embeds: [inviteEmbed] });
	}

};
