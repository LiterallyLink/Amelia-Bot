const { MessageEmbed } = require('discord.js');
const Command = require('../../Structures/Command');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'See how much experience it takes to get to a certain level',
			category: 'Leveling',
			usage: '(number)',
			args: true
		});
	}

	async run(message, [number], prefix) {
		if (Number.isInteger(number) && number >= 0) {
			const xpToLevel = this.client.level.xpFor(number);
			const users = await this.client.database.fetchUser(message.author.id, message.guild.id);
			const xpToLevelAtCurrentLevel = xpToLevel - users.xp;
			const { xpSettings } = await this.client.database.fetchGuild(message.guild);

			const xpForEmbed = new MessageEmbed()
				.setAuthor(`Level Calculator`, message.author.displayAvatarURL())
				.setDescription(`Every minute, you earn ${xpSettings.minXPGain}-${xpSettings.maxXPGain} XP from chatting!`)
				.addField(`From Level 0`, `**Total XP needed to reach level ${number}:** ${this.client.utils.formatNumber(xpToLevel)}\n
            **Estimated Messages Needed**: `)
				.addField(`From your current level`, `**Total XP needed to reach level ${number}:** ${this.client.utils.formatNumber(xpToLevelAtCurrentLevel)}\n
            **Estimated Messages Needed**: `)
				.setColor(this.client.embed.color.default);
			return message.channel.send({ embeds: [xpForEmbed] });
		}

		const noNumberGivenEmbed = new MessageEmbed()
			.setAuthor(`Invalid Level Provided`, message.author.displayAvatarURL())
			.setDescription(`Please provide a valid number\n\nUsage: \`${prefix}${this.usage}\``)
			.setColor(this.client.embed.color.error);
		return message.channel.send({ embeds: [noNumberGivenEmbed] });
	}

};
