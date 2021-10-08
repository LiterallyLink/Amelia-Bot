const { MessageEmbed } = require('discord.js');
const Command = require('../../Structures/Command');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['addxp', 'give-xp'],
			description: 'Give XP to anyone in the server',
			category: 'Leveling',
			usage: '(userId), givexp (@user)',
			args: true
		});
	}

	async run(message, args) {
		const target = await this.client.utils.getMember(message, args[0], false);

		if (!target) {
			const invalidUser = new MessageEmbed()
				.setTitle('Invalid User Provided')
				.setDescription('Please provide a valid user')
				.setThumbnail(this.client.embed.thumbnails.ameShake)
				.setColor(this.client.embed.color.error);
			return message.channel.send({ embeds: [invalidUser] });
		}

		const xpAmount = this.client.utils.isWholeNumber(args[1]);

		if (!xpAmount) {
			const invalidXPEmbed = new MessageEmbed()
				.setTitle('Invalid XP Amount')
				.setDescription('Please provide a valid amount of XP to add')
				.setThumbnail(this.client.embed.thumbnails.ameShake)
				.setColor(this.client.embed.color.error);
			return message.channel.send({ embeds: [invalidXPEmbed] });
		}

		const previous = await this.client.database.fetchUser(target.id, message.guild.id);
		await this.client.level.appendXP(target.id, message.guild.id, parseInt(xpAmount));
		const updated = await this.client.database.fetchUser(target.id, message.guild.id);

		const updatedXpEmbed = new MessageEmbed()
			.setAuthor(`Added ${xpAmount} XP to ${target.username}`, target.displayAvatarURL())
			.addField('Previous XP', `${previous.xp}`, true)
			.addField('Updated XP', `${updated.xp}`, true)
			.setColor(this.client.embed.color.default);
		return message.channel.send({ embeds: [updatedXpEmbed] });
	}

};
