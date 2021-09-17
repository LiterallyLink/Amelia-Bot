const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: "Provides all guild's the bot is currently in.",
			category: 'Developer',
			devOnly: true
		});
	}

	async run(message) {
		const servers = message.client.guilds.cache.map(guild => `\`${guild.id}\` - **${guild.name}** - \`${guild.members.cache.size}\` members`);

		const guildListEmbed = new MessageEmbed()
			.setTitle('List Of Guilds:')
			.setDescription(`${servers.join('\n')}`)
			.setFooter(`Amelia is in a total of ${this.client.guilds.cache.size} guild(s)`)
			.setColor(this.client.embed.color.default)
			.setTimestamp();
		message.channel.send({ embeds: [guildListEmbed] });
	}

};
