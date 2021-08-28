const { MessageEmbed } = require('discord.js');
const Command = require('../../Structures/Command');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Provides the icon of the guild.',
			category: 'Miscellaneous',
			guildOnly: true
		});
	}

	async run(message) {
		const guildIconEmbed = new MessageEmbed()
			.setTitle(`${message.guild.name} Guild Icon`)
			.setDescription(`[Guild Icon URL](${message.guild.iconURL()})`)
			.setImage(message.guild.iconURL())
			.setColor(this.client.embed.color.default);
		return message.channel.send({ embeds: [guildIconEmbed] });
	}

};
