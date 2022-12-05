const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['b', 'banish'],
			description: 'Bans the specified user from the server',
			category: 'Moderation',
			userPerms: ['BAN_MEMBERS'],
			botPerms: ['BAN_MEMBERS'],
			usage: 'member (optional reason)',
			guildOnly: true
		});
	}

	async run(message, [user, ...reason]) {
		const target = message.mentions.members?.first() || await this.client.users.fetch(user).catch(() => null);

		if (!target) {
			const invalidTargetEmbed = new MessageEmbed()
				.setTitle('Invalid User Provided')
				.setThumbnail(this.client.embed.thumbnails.ameShake)
				.setDescription('```Please provide a valid user to ban```')
				.setColor(this.client.embed.color.error);
			return message.channel.send({ embeds: [invalidTargetEmbed] });
		}

		if (!target.bannable) {
			const invalidTargetEmbed = new MessageEmbed()
				.setTitle('Target Unbannable')
				.setThumbnail(this.client.embed.thumbnails.ameShake)
				.setDescription('```I am unable to ban this user.```')
				.setColor(this.client.embed.color.error);
			return message.channel.send({ embeds: [invalidTargetEmbed] });
		}

		await message.guild.members.ban(target);

		const guildDocument = await this.client.database.fetchGuild(message.guild);
		const logLength = guildDocument.banLog.length + 1;
		const banReason = reason.length ? reason.join(' ') : 'No reason provided';

		const banObj = {
			offender: target.id,
			moderator: message.author.id,
			banReason,
			date: this.client.utils.msToDate(Date.now()),
			caseID: logLength
		};

		guildDocument.banLog.push(banObj);
		await guildDocument.save();

		const banUserEmbed = new MessageEmbed()
			.setAuthor(`Moderation: Ban [Case ID: ${logLength}]`, this.client.user.displayAvatarURL())
			.setDescription(`**Moderator:** ${message.author} (${message.author.id})\n**Offender:** ${target} (${target.id})\n**Reason:** ${banReason}`)
			.setColor(this.client.embed.color.default)
			.setTimestamp();
		return message.channel.send({ embeds: [banUserEmbed] });
	}

};
