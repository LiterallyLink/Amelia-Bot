/* eslint-disable consistent-return */
const Event = require('../../Structures/Event');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	async run(message) {
		if (message.author.bot) return;
		const prefixRegexp = RegExp(`^<@!?${this.client.user.id}> `);

		const prefix = message.content.match(prefixRegexp) ? message.content.match(prefixRegexp)[0] : await this.client.database.getPrefix(message);

		const mentionRegex = RegExp(`^<@!?${this.client.user.id}>$`);

		if (message.content.match(mentionRegex)) {
			return message.reply(`My prefix for ${message.guild.name} is \`${prefix}\`.`);
		}

		if (message.guild && !message.content.startsWith(prefix)) {
			return await this.client.level.distributeXP(message);
		}

		const [cmd, ...args] = message.content.slice(prefix.length).trim().split(/ +/g);

		const command = this.client.commands.get(cmd.toLowerCase()) || this.client.commands.get(this.client.aliases.get(cmd.toLowerCase()));

		if (!command) return this.client.database.customCommand(message, prefix);

		const ownerOnlyCommand = command.ownerOnly && !this.client.utils.checkOwner(message.author);
		const guildOnlyCommand = command.guildOnly && !message.guild;
		const isCommandOnCooldown = this.client.utils.userCooldown(message, command);
		const commandRequiresArguments = this.client.utils.commandRequiresArguments(message, command, args);

		if (ownerOnlyCommand || guildOnlyCommand || commandRequiresArguments || isCommandOnCooldown) return;

		if (message.guild) {
			if (command) {
				const guild = await this.client.database.fetchGuild(message.guild);

				if (guild.disabledModules.includes(command.category) || guild.disabledCommands.includes(command.name)) {
					const disabledModuleEmbed = new MessageEmbed()
						.setColor(this.client.embed.color.default)
						.setDescription(`The command ${command.name} or command module ${command.category} is currently disabled`)
						.setFooter(`To enable and disable bot features, use ${prefix}help module`);
					return message.reply(disabledModuleEmbed);
				}
			}

			const userPermCheck = command.userPerms ? this.client.defaultPerms.add(command.userPerms) : this.client.defaultPerms;
			const botPermCheck = command.botPerms ? this.client.defaultPerms.add(command.botPerms) : this.client.defaultPerms;

			if (userPermCheck) {
				const missingUserPermissions = message.channel.permissionsFor(message.member).missing(userPermCheck);

				if (missingUserPermissions.length) {
					const missingPermissionsEmbed = new MessageEmbed()
						.setAuthor('Missing Permissions', message.author.displayAvatarURL())
						.setThumbnail(this.client.embed.thumbnails.ameShake)
						.addField('To run this command, you need these permissions.', `${this.client.utils.formatArray(missingUserPermissions.map(this.client.utils.formatPermissions))}`)
						.setColor(this.client.embed.color.error);
					return message.reply(missingPermissionsEmbed)
						.then(msg => msg.delete({ timeout: 10000 }));
				}
			}

			if (botPermCheck) {
				const missingBotPermissions = message.channel.permissionsFor(this.client.user).missing(botPermCheck);

				if (missingBotPermissions.length) {
					const missingPermissionsEmbed = new MessageEmbed()
						.setAuthor('Missing Permissions', this.client.user.displayAvatarURL())
						.setThumbnail(this.client.embed.thumbnails.ameShake)
						.addField('To run this command, I need these permissions.', `${this.client.utils.formatArray(missingBotPermissions.map(this.client.utils.formatPermissions))}`)
						.setColor(this.client.embed.color.error);
					return message.reply(missingPermissionsEmbed)
						.then(msg => msg.delete({ timeout: 10000 }));
				}
			}
		}

		command.run(message, args);
	}

};
