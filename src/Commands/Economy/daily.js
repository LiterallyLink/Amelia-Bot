const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Claim holocoins and form a daily streak for bonus coins!',
			category: 'Economy',
			guildOnly: true
		});
	}

	async run(message) {
		const user = await this.client.database.fetchUser(message.author.id, message.guild.id);

		const lastClaimed = new Date(user.dailyClaimed);
		const currentDate = new Date(Date.now());

		if (currentDate.getDate() !== lastClaimed.getDate() ||
            currentDate.getMonth() !== lastClaimed.getMonth() ||
            currentDate.getYear() !== lastClaimed.getYear()) {
			const guild = await this.client.database.fetchGuild(message.guild);

			await this.client.economy.addCredits(message.author.id, message.guild.id, guild.dailyAmount);

			user.dailyClaimed = Date.now();
			await user.save().catch(err => console.log(err));

			const dailyClaimed = new MessageEmbed()
				.setAuthor('Daily Claimed!', message.author.displayAvatarURL())
				.setDescription(`${guild.dailyAmount}+ :money_with_wings:`)
				.addField('Streak', 'x x x x x')
				.setColor(this.client.embed.color.default);
			return message.reply({ embeds: [dailyClaimed] });
		} else {
			currentDate.setDate(currentDate.getDate() + 1);
			currentDate.setHours(0, 0, 0, 0);
			const msDifference = currentDate.getTime() - new Date(Date.now());

			const durationTillNextDaily = new MessageEmbed()
				.setDescription(`You've already claimed your daily for today!\nYou can claim again in ${this.client.utils.msToTime(msDifference)}.`)
				.setFooter('Dailies reset at 12am UTC')
				.setThumbnail(this.client.embed.thumbnails.ameShake)
				.setColor(this.client.embed.color.error);
			return message.reply({ embeds: [durationTillNextDaily] });
		}
	}

};
