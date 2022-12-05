/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Clones the specified or current channel.',
			category: 'Moderation',
			userPerms: ['MANAGE_CHANNELS'],
			botPerms: ['MANAGE_CHANNELS'],
			usage: '<#channel_name>',
			guildOnly: true
		});
	}

	async run(message, [channel]) {
		const mentionedChannel = await this.client.channels.fetch(`${channel?.replace(/[^0-9]/g, '')}`).catch(() => null);

		if (mentionedChannel) {
			const confirmButtons = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('clone')
						.setLabel('Clone')
						.setStyle('SUCCESS'),

					new MessageButton()
						.setCustomId('quit')
						.setLabel('Cancel')
						.setStyle('DANGER')
				);

			const confirmEmbed = new MessageEmbed()
				.setAuthor('Clone Channel', this.client.user.displayAvatarURL())
				.setDescription(`Are you sure you want to clone ${mentionedChannel}?\n**All messages in this channel will be gone**`)
				.setFooter('This action cannot be undone.')
				.setColor(this.client.embed.color.default);
			const confirmMessage = await message.reply({ embeds: [confirmEmbed], components: [confirmButtons] });

			const confirmation = await this.client.utils.buttonCollector(message, confirmMessage, 60000);

			if (confirmation === 'clone') {
				const newChannel = await mentionedChannel.clone({ position: mentionedChannel.rawPosition });
				if (!mentionedChannel.deleted) mentionedChannel.delete();

				const channelCloned = new MessageEmbed()
					.setAuthor('Channel Cloned', this.client.user.displayAvatarURL())
					.setDescription(`${newChannel} has been cloned.`)
					.setColor(this.client.embed.color.default);
				return newChannel.send({ embeds: [channelCloned] });
			} else {
				const cloneCancel = new MessageEmbed()
					.setTitle('Cancelled Channel Cloning')
					.setColor(this.client.embed.color.error);
				return message.reply({ embeds: [cloneCancel] });
			}
		}

		const cloneHelp = new MessageEmbed()
			.setAuthor('Channel Clone Help', this.client.user.displayAvatarURL())
			.setDescription(`**Execution:**\nDeletes and recreates the specified channel\n\n**Usage:** \`clone\` ${message.channel}`)
			.setFooter('This action cannot be undone.')
			.setColor(this.client.embed.color.default);
		return message.reply({ embeds: [cloneHelp] });
	}

};
