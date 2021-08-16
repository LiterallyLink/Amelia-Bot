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
		const target = this.client.utils.getMember(message, args.join(' '), true);

		const user = await this.client.level.fetch(target.id, message.guild.id);

		const neededXP = this.client.level.xpFor(parseInt(user.level) + 1);

		const rankCard = new Rank()
			.setAvatar(message.author.displayAvatarURL({ dynamic: true, format: 'png' }))
			.setLevel(user.level)
			.setCurrentXP(user.xp)
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
