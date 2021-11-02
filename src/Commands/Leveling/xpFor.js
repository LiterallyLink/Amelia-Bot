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
		if (Number.isInteger(parseInt(number)) && number >= 0) {
			const guildData = await this.client.database.fetchGuild(message.guild);
			const user = await this.client.database.fetchUser(message.author.id, message.guild.id);

			const { xpSettings } = guildData;
			const { maxXPGain, minXPGain } = xpSettings;
			const xpToLevel = this.client.level.xpFor(number);
			const xpDifference = xpToLevel - user.xp;
			const xpMedian = Math.round((maxXPGain + minXPGain) / 2);
			const averageXPFromCurrentLevel = Math.round(xpDifference / xpMedian);

			const xpForEmbed = new MessageEmbed()
				.setTitle(`XP Calculations for level ${number}`)
				.setDescription(`Every minute, you earn ${xpSettings.minXPGain}-${xpSettings.maxXPGain} XP from chatting!`)
				.addField(`From Level 0 to ${number}`, `**Total XP needed to reach level ${number}:** ${xpToLevel}`)
				.addField(`Estimated messages needed:`, `${Math.round(xpToLevel / xpMedian)} average, ${Math.round(xpToLevel / maxXPGain)} min, ${Math.round(xpToLevel / minXPGain)} max.`)
				.addField(`From your current level to ${number}`, `**Total XP needed to reach level ${number}:** ${xpDifference}`)
				.addField(`Estimated messages needed:`, `${averageXPFromCurrentLevel} average, ${Math.round(xpDifference / maxXPGain)} min, ${Math.round(xpDifference / minXPGain)} max.`)
				.setColor(this.client.embed.color.default);
			return message.channel.send({ embeds: [xpForEmbed] });
		}

		const noNumberGivenEmbed = new MessageEmbed()
			.setAuthor(`Invalid Level Provided`, message.author.displayAvatarURL())
			.setDescription(`Please provide a valid number\n\nUsage: \`${prefix}${this.usage}\``)
			.setThumbnail(this.client.embed.thumbnails.ameShake)
			.setColor(this.client.embed.color.error);
		return message.channel.send({ embeds: [noNumberGivenEmbed] });
	}

};
