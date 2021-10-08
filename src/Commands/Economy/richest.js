const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Displays the server economy leaderboard',
			category: 'Economy',
			guildOnly: true
		});
	}

	async run(message) {
		const rawLeaderboard = await this.client.economy.fetchLeaderboard(message.guild.id, 10);

		if (rawLeaderboard.length < 1) {
			const leaderboardEmbed = new MessageEmbed()
				.setAuthor(`${message.guild.name} Leaderboard`, message.guild.iconURL())
				.setDescription('No data to display')
				.setColor(this.client.embed.color.default);
			return message.channel.send({ embeds: [leaderboardEmbed] });
		}

		const lbList = rawLeaderboard.map((currencyBoard, index) => `${index + 1}. <@${currencyBoard.userId}> ${this.client.utils.formatNumber(currencyBoard.credits)} holocoins`);
		const guildBalanceArray = rawLeaderboard.map((currencyBoard) => currencyBoard.credits);
		const firstPlace = await this.client.users.fetch(rawLeaderboard[0].userId).catch(console.error);
		const totalGuildBalance = guildBalanceArray.reduce((a, b) => a + b, 0);

		const formattedLeaderboard = new MessageEmbed()
			.setDescription(`:bank: **Total Server Economy**: ${this.client.utils.formatNumber(totalGuildBalance)} Total Holocoins\n\n${lbList.join('\n\n')}`)
			.setThumbnail(firstPlace.displayAvatarURL())
			.setColor(this.client.embed.color.default);

		return message.channel.send({ embeds: [formattedLeaderboard] });
	}

};
