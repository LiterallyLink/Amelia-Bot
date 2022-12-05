const { MessageEmbed } = require('discord.js');
const Command = require('../../Structures/Command');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Provides a detailed list of changes on the bot.',
			category: 'Miscellaneous',
			guildOnly: true
		});
	}

	async run(message, args, prefix) {
		const changeLogEmbed = new MessageEmbed()
			.setAuthor('Change Log: Moderation Update 11/26/2021 - Version: Unreleased Beta')
			.addField('New Commands', '__ __')
			.addField('Ban', `\`${prefix}ban\` will allow you to rid your server of pesky users\nYou can view a list of banned individuals in the ban log\nstored in our secure database.`)
			.addField('Kick', `\`${prefix}kick\` will allow you to kick users from your server.\nYou can view a list of kicked individuals in the kick log\nstored in our secure database.`)
			.addField('Slowmode', `\`${prefix}slowmode\` allows you to set the specified slowmode for the current channel!`)
			.addField('Clone', `\`${prefix}clone\` allows you to clone any channel specified!`)
			.addField('Future Changes', '__ __')
			.addField('Moderation', 'Word blacklisting, Discord invite filtering, and Link blacklisting\nalongside other powerful moderation features will be implemented\nin the coming updates!')
			.addField('Music', 'As of now, a full rework is being put into place\nswitching from Discord Player to Lavalink.')
			.addField('Economy', 'UI changes are to be expected! As well as more\ngambling commands to liven up your server!')
			.setFooter(`If you'd like to report an issue, or send in a suggestion.\nUse ${prefix}bugreport or ${prefix}suggest!\nThank you for using Amelia Bot!`, this.client.user.displayAvatarURL())
			.setColor(this.client.embed.color.default)
			.setTimestamp();
		return message.channel.send({ embeds: [changeLogEmbed] });
	}

};
