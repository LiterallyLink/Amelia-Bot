const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['sm'],
			description: "Set's the channel's slowmode",
			category: 'Moderation',
			usage: '<optional channel> <amount of seconds>',
			userPerms: ['MANAGE_CHANNELS', 'MANAGE_MESSAGES'],
			botPerms: ['MANAGE_CHANNELS', 'MANAGE_MESSAGES'],
			args: true,
			guildOnly: true
		});
	}

	async run(message, args, prefix) {
		const targetChannel = message.mentions.channels.size ? message.mentions.channels : message.channel;
		let slowmodeDuration = args.pop();

		if (slowmodeDuration.endsWith('s' || 'sec')) {
			slowmodeDuration = slowmodeDuration.slice(0, -1);
		} else if (slowmodeDuration.endsWith('m' || 'min')) {
			slowmodeDuration = slowmodeDuration.slice(0, -1) * 60;
		} else if (slowmodeDuration.endsWith('h' || 'hr')) {
			slowmodeDuration = slowmodeDuration.slice(0, -1) * 3600;
		}

		if (slowmodeDuration === 'disable' || slowmodeDuration === 'off' || slowmodeDuration === '0') {
			this.setSlowmode(message, 0, targetChannel);

			const slowmodeDisabledEmbed = new MessageEmbed()
				.setAuthor('Slowmode Disabled')
				.setDescription(`Slowmode has been disabled in ${targetChannel}`)
				.setColor(this.client.embed.color.default);
			return message.channel.send({ embeds: [slowmodeDisabledEmbed] });
		}

		if (!this.client.utils.isInt(slowmodeDuration) || slowmodeDuration > 21600) {
			const slowmodeDisabledEmbed = new MessageEmbed()
				.setTitle(`Youch! I bumped into an error!`)
				.addField('Usage', `${this.usage}`, true)
				.addField('Example', `\`${prefix}slowmode 10s\``, true)
				.setFooter(`Use ${prefix}help slowmode for more information!`)
				.setThumbnail(this.client.embed.thumbnails.ameShake)
				.setColor(this.client.embed.color.error);
			return message.reply({ embeds: [slowmodeDisabledEmbed] });
		}

		this.setSlowMode(message, slowmodeDuration, targetChannel);

		const slowmodeEnabledEmbed = new MessageEmbed()
			.setDescription(`**Enabled Slowmode in** ${targetChannel}\nSlowmode has been set to ${slowmodeDuration} seconds`)
			.setColor(this.client.embed.color.default);
		return message.reply({ embeds: [slowmodeEnabledEmbed] });
	}

	setSlowmode(message, slowmodeDuration, targetChannel) {
		if (message.mentions.channels.size > 0) {
			targetChannel.forEach((channel) => {
				channel.setRateLimitPerUser(slowmodeDuration);
			});
		} else {
			targetChannel.setRateLimitPerUser(slowmodeDuration);
		}
	}


};
