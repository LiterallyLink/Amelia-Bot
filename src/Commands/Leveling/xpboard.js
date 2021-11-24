const { MessageEmbed } = require('discord.js');
const Command = require('../../Structures/Command');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['xplb'],
			description: 'Provides a leaderboard of the highest level members',
			category: 'Leveling'
		});
	}

	async run(message) {
		const rawLeaderBoardData = await this.client.level.fetchLeaderboard(message.guild.id, 10);
		const mappedLeaderBoardData = rawLeaderBoardData.map((user, i) => `${i + 1}. <@${user.userId}> ${user.xp} XP - Level ${user.level}\n\n`);

		const leaderBoardEmbed = new MessageEmbed()
			.setAuthor(`${message.guild.name} XP Leaderboard`, message.guild.iconURL())
			.setDescription(`__ __\n${mappedLeaderBoardData.join('')}`)
			.setColor(this.client.embed.color.default);
		message.channel.send({ embeds: [leaderBoardEmbed] });
	}

};
