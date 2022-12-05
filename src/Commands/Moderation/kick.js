const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Kicks the specified user from the server',
			category: 'Moderation',
			userPerms: ['KICK_MEMBERS'],
			botPerms: ['KICK_MEMBERS'],
			usage: 'member (optional reason)',
			guildOnly: true
		});
	}

	async run(message, [user, ...reason]) {
		const target = message.mentions.members?.first() || await this.client.users.fetch(user).catch(() => null);

		if (!target) {
			const invalidTargetEmbed = new MessageEmbed()
				.setTitle('Invalid User Provided')
				.setDescription('```Please provide a valid user to kick```')
				.setThumbnail(this.client.embed.thumbnails.ameShake)
				.setColor(this.client.embed.color.error);
			return message.channel.send({ embeds: [invalidTargetEmbed] });
		}

		if (!target.kickable) {
			const kickedUserEmbed = new MessageEmbed()
				.setAuthor(`Cannot Kick User`, this.client.user.displayAvatarURL())
				.setThumbnail(this.client.embed.thumbnails.ameShake)
				.setColor(this.client.embed.color.error)
				.setTimestamp();
			return message.channel.send({ embeds: [kickedUserEmbed] });
		}

		await target.kick(reason);

		const guildDocument = await this.client.database.fetchGuild(message.guild);
		const logLength = guildDocument.kickLog.length + 1;
		const kickReason = reason.length ? reason.join(' ') : 'No reason provided';

		const kickObj = {
			offender: target.id,
			moderator: message.author.id,
			kickReason,
			date: this.client.utils.msToDate(Date.now()),
			caseID: logLength
		};

		guildDocument.kickLog.push(kickObj);
		await guildDocument.save();

		const kickedUserEmbed = new MessageEmbed()
			.setAuthor(`Moderation: Kick [Case ID: ${logLength}]`, this.client.user.displayAvatarURL())
			.setDescription(`**Moderator:** ${message.author} (${message.author.id})\n**Offender:** ${target} (${target.id})\n**Reason:** ${kickReason}`)
			.setColor(this.client.embed.color.default)
			.setTimestamp();
		return message.channel.send({ embeds: [kickedUserEmbed] });
	}

};
