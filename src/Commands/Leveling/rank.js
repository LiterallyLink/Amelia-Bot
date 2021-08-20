const { MessageAttachment } = require('discord.js');
const { Rank } = require('canvacord');
const Command = require('../../Structures/Command');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Provides the rank of a specified user.',
			category: 'Leveling',
			usage: '(userId), rank (@user)'
		});
	}

	async run(message, args) {
		const target = await this.client.utils.getMember(message, args.join(' '), true);

		const { level, xp } = await this.client.database.fetchUser(target.id, message.guild.id);
		const guildRank = await this.client.level.fetchRank(target.id, message.guild.id);
		const neededXP = await this.client.level.xpFor(parseInt(level) + 1);

		const rankCard = new Rank()
			.setAvatar(target.displayAvatarURL({ dynamic: true, format: 'png' }))
			.setLevel(level)
			.setRank(guildRank)
			.setCurrentXP(xp)
			.setRequiredXP(neededXP)
			.setProgressBar('#FFA500', 'COLOR')
			.setUsername(target.username)
			.setDiscriminator(target.discriminator);
		rankCard.build().then(data => {
			const rankImage = new MessageAttachment(data, 'rankcard.png');
			message.channel.send({ files: [rankImage] });
		});
	}

};
