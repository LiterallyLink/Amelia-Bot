/* eslint-disable consistent-return */
const Event = require('../../Structures/Event');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	async run(message) {
		if (message.author.bot) return;

		const { user, commands, aliases, utils, database, level, music, embed, defaultPerms } = this.client;

		const prefixRegexp = RegExp(`^<@!?${user.id}> `);

		let prefix = message.content.match(prefixRegexp) ? message.content.match(prefixRegexp)[0] : await database.getPrefix(message);

		const mentionRegex = RegExp(`^<@!?${user.id}>$`);

		if (message.content.match(mentionRegex)) {
			return message.reply({ content: `To use a command, use the current prefix \`${prefix}\`, or use my mention as the prefix.` });
		}

		if (message.guild && !message.content.startsWith(prefix)) {
			return await level.assignXP(message);
		}

		prefix = prefix.toLowerCase();

		const [cmd, ...args] = message.content.slice(prefix.length).trim().split(/ +/g);

		const command = commands.get(cmd.toLowerCase()) || commands.get(aliases.get(cmd.toLowerCase()));

		if (!command) {
			const { customCommands } = await this.client.database.fetchGuild(message.guild);
			const customCmd = customCommands.find(customCommand => customCommand.name === cmd);

			if (!customCmd) return;

			return message.channel.send({ content: `${customCmd.content}` });
		}

		if (command.devOnly && !utils.userIsADev(message.author)) return;
		if (command.guildOnly && !message.guild) return;
		if (command.voiceChannelOnly && !music.isInChannel(message)) return;
		if (utils.userCooldown(message, command)) return;
		if (utils.commandRequiresArguments(message, command, args)) return;

		if (message.guild) {
			const userPermCheck = command.userPerms ? defaultPerms.add(command.userPerms) : defaultPerms;
			const botPermCheck = command.botPerms ? defaultPerms.add(command.botPerms) : defaultPerms;

			if (userPermCheck) {
				const missingUserPermissions = message.channel.permissionsFor(message.member).missing(userPermCheck);

				if (missingUserPermissions.length) {
					const missingPermissionsEmbed = new MessageEmbed()
						.setAuthor('Missing Permissions', message.author.displayAvatarURL())
						.setThumbnail(embed.thumbnails.ameShake)
						.addField('To run this command, you need these permissions.', `\`\`\`${missingUserPermissions}\`\`\``)
						.setColor(embed.color.error);
					return message.reply({ embeds: [missingPermissionsEmbed] });
				}
			}

			if (botPermCheck) {
				const missingBotPermissions = message.channel.permissionsFor(user).missing(botPermCheck);

				if (missingBotPermissions.length) {
					const missingPermissionsEmbed = new MessageEmbed()
						.setAuthor('Missing Permissions', user.displayAvatarURL())
						.setThumbnail(embed.thumbnails.ameShake)
						.addField('To run this command, I need these permissions.', `\`\`\`${utils.formatArray(missingBotPermissions.map(utils.formatPermissions))}\`\`\``)
						.setColor(embed.color.error);
					return message.reply({ embeds: [missingPermissionsEmbed] });
				}
			}
		}

		command.run(message, args, prefix);
	}

};
