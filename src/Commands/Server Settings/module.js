/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const guildSchema = require('../../Models/guildSchema');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Enables and disables modules',
			category: 'Settings',
			usage: 'enable (category), module disable (category)',
			userPerms: ['ADMINISTRATOR'],
			guildOnly: true
		});
	}

	async run(message, [boolean, module]) {
		const categories = this.client.utils.removeDuplicates(this.client.commands.filter(cmd =>
			cmd.category !== 'Developer' && cmd.category !== 'Core' && cmd.category !== 'Utility').map(cmd => cmd.category));

		if (!module || !categories.includes(this.client.utils.capitalise(module))) return this.moduleStatus(message, categories);

		module = this.client.utils.capitalise(module);

		if (boolean === 'enable') {
			await this.enableModule(message, module);
		} else if (boolean === 'disable') {
			await this.disableModule(message, module);
		}
	}

	async moduleStatus(message, categories) {
		const guild = await this.client.database.fetchGuild(message.guild);
		const enabled = categories.filter((allModules) => !guild.disabledModules.includes(allModules));
		let str = '';

		for (let i = 0; i < categories.length; i++) {
			str += `${categories[i]} ${enabled.includes(categories[i]) ? '✅' : '❌'}\n`;
		}

		const moduleEmbed = new MessageEmbed()
			.setTitle(`Module Status`, this.client.user.displayAvatarURL())
			.setDescription(str)
			.setColor(this.client.embed.color.default);

		return message.channel.send(moduleEmbed);
	}

	async disableModule(message, module) {
		const guild = await this.client.database.fetchGuild(message.guild);

		if (guild.disabledModules.includes(module)) {
			return message.reply(`The ${module} module is already disabled`);
		}

		await guild.disabledModules.push(this.client.utils.capitalise(module));
		await guild.save();
		return message.reply(`The module ${module} has been disabled`);
	}

	async enableModule(message, module) {
		const guild = await guildSchema.findOne({ guildID: message.guild.id, disabledModules: module });

		if (!guild) {
			return message.reply(`The ${module} module is not disabled`);
		}

		guild.disabledModules = this.client.utils.arrayRemove(guild.disabledModules, module);
		await guild.save();
		return message.reply(`The module ${module} has been enabled`);
	}

};
