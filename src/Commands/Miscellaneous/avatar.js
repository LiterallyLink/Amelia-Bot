const { MessageEmbed } = require('discord.js');
const emoji = require('../../../assets/jsons/emotes.json');
const Command = require('../../Structures/Command');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Provides the avatar of a specified user.',
			category: 'Miscellaneous',
			usage: '(userId), avatar (@user)'
		});
	}

	async run(message, args) {
		const member = this.client.utils.getMember(message, args.join(' '), true);

		const displayAvatarEmbed = new MessageEmbed()
			.setAuthor(`${member.username}'s profile picture`)
			.setImage(member.displayAvatarURL({ dynamic: true, size: 2048 }))
			.setDescription(`${emoji.link} [Image Link](${member.avatarURL()})`)
			.setColor(this.client.embed.color.default);
		return message.channel.send({ embeds: [displayAvatarEmbed] });
	}

};
