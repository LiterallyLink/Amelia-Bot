const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const guildSchema = require('../../Models/guildSchema');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: "Set's a new server prefix",
			category: 'Server Settings',
			usage: '(new prefix)',
			userPerms: ['ADMINISTRATOR'],
			guildOnly: true
		});
	}

	async run(message, [prefix]) {
		const guild = await this.client.database.fetchGuild(message.guild);

		if (!prefix || prefix.length > 3) {
			const invalidPrefix = new MessageEmbed()
				.setDescription(`The current prefix for this guild is \`${guild.prefix}\``)
				.setFooter(`Prefixes cannot be longer than 3 characters`)
				.setColor(this.client.embed.color.default);
			return message.channel.send({ embeds: [invalidPrefix] });
		}

		await guildSchema.findOneAndUpdate({ guildID: message.guild.id }, { guildID: message.guild.id, prefix: prefix });

		const newServerPrefix = new MessageEmbed()
			.setDescription(`${message.guild.name}'s prefix has been changed to ${prefix}`)
			.setColor(this.client.embed.color.default);
		return message.reply({ embeds: [newServerPrefix] });
	}

};
