const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: "Provides all guild's the bot is currently in.",
			category: 'Developer',
			ownerOnly: true
		});
	}

	async run(message) {
		const servers = message.client.guilds.cache.array()
			.map(guild => `\`${guild.id}\` - **${guild.name}** - \`${guild.members.cache.size}\` members`);

		const embed = new MessageEmbed()
			.setTitle('List Of Guilds:')
			.setDescription(servers)
			.setFooter(`Amelia is in a total of ${this.client.guilds.cache.size} guild(s)`)
			.setColor(this.client.embed.color.default)
			.setTimestamp();
		message.channel.send(embed);
	}

};
