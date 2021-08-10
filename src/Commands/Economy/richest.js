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
		const leaderboardEmbed = new MessageEmbed()
			.setAuthor(`${message.guild.name} Leaderboard`, message.guild.iconURL())
			.setDescription('No data to display')
			.setColor(this.client.embed.color.default);

		if (rawLeaderboard.length < 1) {
			return message.channel.send({ embeds: [leaderboardEmbed] });
		}

		const lbList = rawLeaderboard.map((currencyBoard, index) => `${index + 1}. <@${currencyBoard.userId}> ${this.client.utils.formatNumber(currencyBoard.credits)} credits`);
		const firstPlace = await this.client.users.fetch(rawLeaderboard[0].userId).catch(console.error);
		const guildBalanceArray = rawLeaderboard.map((currencyBoard) => currencyBoard.credits);
		const totalGuildBalance = guildBalanceArray.reduce((a, b) => a + b, 0);

		leaderboardEmbed.setDescription(`:bank: **Total Server Economy**: ${this.client.utils.formatNumber(totalGuildBalance)} Total Credits\n\n${lbList.join('\n\n')}`);
		leaderboardEmbed.setThumbnail(`${firstPlace.displayAvatarURL()}`);

		return message.channel.send({ embeds: [leaderboardEmbed] });
	}

};
