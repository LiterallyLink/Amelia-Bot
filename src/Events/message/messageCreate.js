/* eslint-disable consistent-return */
const Event = require('../../Structures/Event');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	async run(message) {
		if (message.author.bot || !message.channel.permissionsFor(this.client.user).has('SEND_MESSAGES')) return;

		const prefixRegex = RegExp(`^<@!?${this.client.user.id}> `);
		const prefixMatch = message.content.match(prefixRegex);
		const dbPrefix = await this.client.database.getPrefix(message);
		const guildDocument = await this.client.database.fetchGuild(message.guild);

		let prefix = prefixMatch ? prefixMatch[0] : dbPrefix;

		const mentionRegex = RegExp(`^<@!?${this.client.user.id}>$`);

		if (message.content.match(mentionRegex)) {
			return message.reply({ content: `To use a command, use the current prefix \`${prefix}\`, or use my mention as the prefix.` });
		}

		if (guildDocument.antiInvites && message.content.match(/discord(?:\.gg|app\.com\/invite)\/.+/)) {
			if (!message.deleted) message.delete();
		}

		if (message.guild && !message.content.toLowerCase().startsWith(prefix.toLowerCase())) {
			return await this.client.level.assignXP(message);
		}

		prefix = prefix.toLowerCase();

		const [cmd, ...args] = message.content.slice(prefix.length).trim().split(/ +/g);

		const command = this.client.commands.get(cmd.toLowerCase()) || this.client.commands.get(this.client.aliases.get(cmd.toLowerCase()));

		if (!command) {
			const { customCommands } = guildDocument;
			const customCmd = customCommands.get(cmd);

			if (customCmd) {
				if (customCmd?.content) message.channel.send({ content: `${customCmd.content}` });
				if (customCmd?.attachment) message.channel.send({ content: `${customCmd.attachment}` });
			}

			return;
		}

		const { utils, defaultPerms } = this.client;

		if (command.devOnly && !utils.userIsADev(message.author)) return;
		if (command.guildOnly && !message.guild) return;
		if (utils.userCooldown(message, command)) return;
		if (command.voiceChannelOnly && !this.client.music.isInChannel(message)) return;
		if (utils.commandRequiresArguments(message, command, args)) return;

		if (message.guild) {
			const userPermCheck = command.userPerms ? defaultPerms.add(command.userPerms) : defaultPerms;

			if (userPermCheck) {
				const missingUserPermissions = message.channel.permissionsFor(message.member).missing(userPermCheck);
				const formattedPermissions = utils.formatArray(missingUserPermissions.map(utils.formatPermissions));

				if (missingUserPermissions.length) {
					const missingPermissionsEmbed = new MessageEmbed()
						.setAuthor('Missing Permissions', message.author.displayAvatarURL())
						.setThumbnail(this.client.embed.thumbnails.ameShake)
						.addField('To run this command, you need these permissions.', `\`\`\`${formattedPermissions}\`\`\``)
						.setColor(this.client.embed.color.error);
					return message.reply({ embeds: [missingPermissionsEmbed] });
				}
			}

			const botPermCheck = command.botPerms ? defaultPerms.add(command.botPerms) : defaultPerms;

			if (botPermCheck) {
				const missingBotPermissions = message.channel.permissionsFor(this.client.user).missing(botPermCheck);
				const formattedPermissions = utils.formatArray(missingBotPermissions.map(utils.formatPermissions));

				if (missingBotPermissions.length) {
					const missingPermissionsEmbed = new MessageEmbed()
						.setAuthor('Missing Permissions', this.client.user.displayAvatarURL())
						.setThumbnail(this.client.embed.thumbnails.ameShake)
						.addField('To run this command, I need these permissions.', `\`\`\`${formattedPermissions}\`\`\``)
						.setColor(this.client.embed.color.error);
					return message.reply({ embeds: [missingPermissionsEmbed] });
				}
			}
		}

		command.run(message, args, dbPrefix);
	}

};
