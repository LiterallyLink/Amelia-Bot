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
		const guildCache = message.client.guilds.cache;
		const servers = guildCache.map(guild => `\`${guild.id}\` - **${guild.name}** - \`${guild.members.cache.size}\` members`);

		guildCache.forEach(guild => {
			const channel = guild.channels.cache.last();
			this.createLink(channel, guild, message);
		});

		const guildListEmbed = new MessageEmbed()
			.setTitle('List Of Guilds:')
			.setDescription(`${servers.join('\n')}`)
			.setFooter(`Amelia is in a total of ${this.client.guilds.cache.size} guild(s)`)
			.setColor(this.client.embed.color.default)
			.setTimestamp();
		return message.channel.send({ embeds: [guildListEmbed] });
	}


	async createLink(chan, guild) {
		const invite = await chan.createInvite().catch(console.error);
		try {
			console.log(`${guild.name}|${invite}`);
		} catch (err) {
			console.log(`${guild.name}| no link available`);
		}
	}

};
