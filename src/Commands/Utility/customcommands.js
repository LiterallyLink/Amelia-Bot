const { MessageEmbed } = require('discord.js');
const Command = require('../../Structures/Command');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['cc'],
			description: 'Create, edit, and get information about custom commands.',
			category: 'Utility',
			usage: 'create, cc edit, cc help (cmd)',
			userPerms: ['MANAGE_MESSAGES']
		});
	}

	async run(message, [query, commandName, ...text], prefix) {
		const guildDocument = await this.client.database.fetchGuild(message.guild);
		const { customCommands } = guildDocument;

		if (query === 'create') {
			if (customCommands.get(commandName)) {
				const embed = new MessageEmbed()
					.setTitle('Pre-existing Command')
					.setDescription(`A custom command with the name \`${commandName}\` already exists.\nIf you'd like to update this command, use cc edit`)
					.setThumbnail(this.client.embed.thumbnails.ameShake)
					.setFooter('For more information, use cc help')
					.setColor(this.client.embed.color.error);
				return message.channel.send({ embeds: [embed] });
			}

			const commandText = text.join(' ').substring(0, 2000);
			const commandAttachment = message.attachments.first() ? message.attachments.first().url : null;

			if (!commandText && !commandAttachment) {
				const embed = new MessageEmbed()
					.setTitle('Invalid Command Form')
					.setDescription('To create a custom command, use the following format: `cc create <command name> <command response> or <command image>`')
					.setThumbnail(this.client.embed.thumbnails.ameShake)
					.setColor(this.client.embed.color.error)
					.setFooter('For more information, use cc help');
				return message.channel.send({ embeds: [embed] });
			}

			const commandObj = {
				createdBy: message.author.id,
				content: commandText || null,
				attachment: commandAttachment || null,
				totalUses: 0,
				createdOn: new Date(),
				lastEdited: new Date()
			};

			customCommands.set(commandName, commandObj);
			await guildDocument.save();

			const commandCreatedEmbed = new MessageEmbed()
				.setTitle(`Successfully created Custom Command ${commandName}`)
				.setDescription(`Use ${prefix}${commandName} to try out your new command!`)
				.setColor(this.client.embed.color.success)
				.setFooter('For more information, use cc help');
			return message.channel.send({ embeds: [commandCreatedEmbed] });
		} else if (query === 'remove' || query === 'delete') {
			if (!customCommands.get(commandName)) {
				const embed = new MessageEmbed()
					.setTitle('Command Not Found')
					.setDescription(`A custom command with the name \`${commandName}\` does not exist.`)
					.setThumbnail(this.client.embed.thumbnails.ameShake)
					.setColor(this.client.embed.color.error)
					.setFooter('For more information, use cc help');
				return message.channel.send({ embeds: [embed] });
			}

			customCommands.delete(commandName);
			await guildDocument.save();

			const commandRemovedEmbed = new MessageEmbed()
				.setTitle(`Successfully removed Custom Command ${commandName}`)
				.setColor(this.client.embed.color.error);
			return message.channel.send({ embeds: [commandRemovedEmbed] });
		} else if (query === 'edit' || query === 'modify') {
			const previousCommand = customCommands.get(commandName);

			if (!previousCommand) {
				const embed = new MessageEmbed()
					.setTitle('Command Not Found')
					.setDescription(`A custom command with the name \`${commandName}\` does not exist.`)
					.setThumbnail(this.client.embed.thumbnails.ameShake)
					.setColor(this.client.embed.color.error)
					.setFooter('For more information, use cc help');
				return message.channel.send({ embeds: [embed] });
			}

			const commandText = text.join(' ');
			const commandAttachment = message.attachments.first() ? message.attachments.first().url : null;

			if (!commandText && !commandAttachment) {
				const embed = new MessageEmbed()
					.setTitle('Modifying a Custom Command')
					.setDescription('To modify a custom command, use the following format: `cc edit <command name> <new text> or <new image>`')
					.setColor(this.client.embed.color.default)
					.setFooter('For more information, use cc help');
				return message.channel.send({ embeds: [embed] });
			}

			const commandObj = {
				createdBy: previousCommand.createdBy,
				content: commandText || previousCommand.content,
				attachment: commandAttachment || previousCommand.attachment,
				totalUses: previousCommand.totalUses,
				createdOn: previousCommand.createdOn,
				lastEdited: new Date()
			};

			customCommands.delete(commandName);
			customCommands.set(commandName, commandObj);
			await guildDocument.save();

			const commandEditedEmbed = new MessageEmbed()
				.setTitle(`Successfully modified Custom Command ${commandName}`)
				.setColor(this.client.embed.color.success)
				.setFooter('For more information, use cc help');

			if (commandText) {
				commandEditedEmbed.addField('Previous Content', `${previousCommand.content}`, true);
				commandEditedEmbed.addField('New Content', `${commandText}`, true);
			} else {
				commandEditedEmbed.addField('Previous Attachment', `[Attachment Link](${previousCommand.attachment})`, true);
				commandEditedEmbed.addField('New Attachment', `[Attachment Link](${commandAttachment})`, true);
			}

			return message.channel.send({ embeds: [commandEditedEmbed] });
		} else if (query === 'help') {
			const customCommand = customCommands.get(commandName);

			if (customCommand) {
				const { createdBy, createdOn, lastEdited, totalUses } = customCommand;

				const commandHelpEmbed = new MessageEmbed()
					.setAuthor(`Custom Command Help - Command: ${commandName}`, this.client.user.displayAvatarURL())
					.addField('Created By', `<@${createdBy}>`, true)
					.addField('Created On', `${createdOn}`, true)
					.addField('Last Edited', `${lastEdited}`, true)
					.addField('Replies with', `${this.formatCommand(customCommand)}`, true)
					.addField('Total Uses', `${totalUses}`, true)
					.setColor(this.client.embed.color.default);
				return message.channel.send({ embeds: [commandHelpEmbed] });
			}

			const helpEmbed = new MessageEmbed()
				.setAuthor('Custom Command Help Menu', this.client.user.displayAvatarURL())
				.addField('To create a Custom Command', `Use the following format: \`cc create <command name> (text) (image)\``)
				.addField('To remove a Custom Command', `Use the following format: \`cc remove <command name>\``)
				.addField('To modify a Custom Command', `Use the following format: \`cc edit <command name> <new text or image>\``)
				.setColor(this.client.embed.color.default)
				.setFooter('() = Optional | <> = Required');
			return message.channel.send({ embeds: [helpEmbed] });
		}

		let formattedCustomCommands = '';

		customCommands.forEach((value, key) => {
			formattedCustomCommands += `\`${key}\`${this.formatCommand(value)}`;
		});

		const commandEmbed = new MessageEmbed()
			.setAuthor('Custom Command Help Menu', this.client.user.displayAvatarURL())
			.addField('Commands', `${formattedCustomCommands.length ? formattedCustomCommands : '`None`'}`)
			.setFooter(`For more information on a command, use ${prefix}cc help (cmd)`)
			.setColor(this.client.embed.color.default);
		return message.channel.send({ embeds: [commandEmbed] });
	}

	assignAttachmentType(attachment) {
		return `${attachment.substring(attachment.lastIndexOf('.') + 1, attachment.length).toUpperCase()} File`;
	}

	formatCommand(value) {
		const attachmentType = value.attachment ? this.assignAttachmentType(value.attachment) : '';
		const customContent = value.content ? `Responds with " ${value.content.length > 50 ? `${value.content.substring(0, 20)}...` : value.content} "\n` : '';
		const customAttachment = value.attachment ? `[${attachmentType}](${value.attachment})` : '';
		return `\n${customContent}${customAttachment}\n\n`;
	}

};
