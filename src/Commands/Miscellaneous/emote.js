const { MessageEmbed } = require('discord.js');
const moment = require('moment');
const Command = require('../../Structures/Command');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['emotes', 'emoji', 'emojis'],
			description: 'Provides information about the guilds emotes.',
			category: 'Miscellaneous',
			usage: ', emotes (emote)',
			guildOnly: true
		});
	}

	async run(message, [emote]) {
		const discordEmoteRegex = /^<a?:\w+:(\d+)>$/;
		const unicodeEmoteRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi;

		const isDiscordEmote = discordEmoteRegex.test(emote);
		const isUnicodeEmote = unicodeEmoteRegex.test(emote);

		try {
			if (isDiscordEmote) {
				const emoteRegex = emote.replace(discordEmoteRegex, '$1');
				const emoji = message.guild.emojis.cache.find((emj) => emj.name === emote || emj.id === emoteRegex);

				const discordEmoteEmbed = new MessageEmbed()
					.setAuthor(`Information for ${emoji.name}`, message.guild.iconURL())
					.setDescription(`\`<:${emoji.name}:${emoji.id}>\``)
					.addField('Creation Date', `${moment(emoji.createdTimeStamp).format('LT')} ${moment(emoji.createdTimeStamp).format('LL')}`)
					.setImage(emoji.url)
					.setColor(this.client.embed.color.default);
				return message.channel.send({ embeds: [discordEmoteEmbed] });
			} else if (isUnicodeEmote) {
				const unicodeEmoteEmbed = new MessageEmbed()
					.setDescription(`${emote} is a default unicode emoji`)
					.setColor(this.client.embed.color.default);
				return message.channel.send({ embeds: [unicodeEmoteEmbed] });
			}
		} catch (err) {
			const emoteID = emote.replace(/<a?:\w+:(\d+)>/g, '$1');
			const fileExtension = emote.startsWith('<a') ? '.gif' : '.png';
			const emoteURL = `https://cdn.discordapp.com/emojis/${emoteID}${fileExtension}`;
			const emoteName = emote.substring(emote.indexOf(':') + 1, emote.lastIndexOf(':'));

			const fromOtherGuildEmbed = new MessageEmbed()
				.setAuthor(`Information for ${emoteName}`, message.guild.iconURL())
				.setDescription(`\`${emote}${emoteID}\``)
				.setImage(emoteURL)
				.setColor(this.client.embed.color.default);
			return message.channel.send({ embeds: [fromOtherGuildEmbed] });
		}

		const emojiList = message.guild.emojis.cache.map(emj => `${emj}`);

		const emojiListEmbed = new MessageEmbed()
			.setAuthor(`Emotes for ${message.guild}`, message.guild.iconURL())
			.setDescription(`${emojiList.join('')}`)
			.addField('More Information', `For more information, use \`${this.name} <emote>\``)
			.setColor(this.client.embed.color.default);
		return message.channel.send({ embeds: [emojiListEmbed] });
	}

};
