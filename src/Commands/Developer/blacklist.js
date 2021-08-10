/* eslint-disable consistent-return */
const { MessageEmbed } = require('discord.js');
const Command = require('../../Structures/Command');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			usage: 'add <user>, blacklist remove <user>',
			category: 'Developer',
			description: 'Blacklists a user from using the bot.',
			ownerOnly: true
		});
	}

	async run(message, [blacklistBoolean, userID]) {
		const user = this.client.utils.getMember(message, userID, false);

		if (!user) {
			let blacklistedUsers = await this.client.database.fetchBlacklisted();

			if (!blacklistedUsers.length) blacklistedUsers = 'None';

			const blacklistedEmbed = new MessageEmbed()
				.setAuthor(`Blacklisted Users`, this.client.user.displayAvatarURL())
				.setDescription(`${blacklistedUsers}`)
				.setColor(this.client.embed.color.default);
			return message.reply(blacklistedEmbed);
		}

		switch (blacklistBoolean) {
			case 'add':
				await this.client.database.blacklist(message, user, true);
				message.reply(`This user has been blacklisted`)
					.then(msg => msg.delete({ timeout: 10000 }));
				break;
			case 'remove':
				await this.client.database.blacklist(message, user, false);
				message.reply(`This user has been unblacklisted`)
					.then(msg => msg.delete({ timeout: 10000 }));
				break;
			default: {
				const blacklistHelpEmbed = new MessageEmbed()
					.setDescription(`\`\`\`Please specify if you'd like to add, or remove a user from the blacklist\`\`\``);
				message.reply(blacklistHelpEmbed)
					.then(msg => msg.delete({ timeout: 10000 }));
				break;
			}
		}
	}

};
