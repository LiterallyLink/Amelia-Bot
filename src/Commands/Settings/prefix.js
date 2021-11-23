const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const guildSchema = require('../../Models/guildSchema');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: "Change Amelia's command prefix",
			category: 'Settings',
			usage: '[optional prefix], prefix reset',
			userPerms: ['MANAGE_GUILD'],
			guildOnly: true
		});
	}

	async run(message, [prefix]) {
		const guild = await this.client.database.fetchGuild(message.guild);

		if (!prefix) {
			const invalidPrefix = new MessageEmbed()
				.setDescription(`The current prefix for this guild is \`${guild.prefix}\``)
				.setColor(this.client.embed.color.default);
			return message.channel.send({ embeds: [invalidPrefix] });
		}

		if (prefix === 'reset') {
			await guildSchema.findOneAndUpdate({ guildID: message.guild.id }, { guildID: message.guild.id, prefix: this.client.prefix });

			const resetPrefix = new MessageEmbed()
				.setDescription(`The command prefix has been reset to \`${this.client.prefix}\``)
				.setColor(this.client.embed.color.default);
			return message.channel.send({ embeds: [resetPrefix] });
		}

		await guildSchema.findOneAndUpdate({ guildID: message.guild.id }, { guildID: message.guild.id, prefix: prefix });

		const newPrefixEmbed = new MessageEmbed()
			.setDescription(`${message.guild.name}'s prefix has been changed to ${prefix}`)
			.setColor(this.client.embed.color.default);
		return message.reply({ embeds: [newPrefixEmbed] });
	}

};
