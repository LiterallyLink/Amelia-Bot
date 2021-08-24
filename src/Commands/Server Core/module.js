const Command = require('../../Structures/Command');
const emotes = require('../../../assets/jsons/emotes.json');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Enables and disables modules',
			category: 'Server Core',
			usage: 'enable (category), module disable (category)',
			userPerms: ['ADMINISTRATOR'],
			guildOnly: true
		});
	}

	async run(message, [enabledOrDisabled, module]) {
		const guild = await this.client.database.fetchGuild(message.guild);
		const categories = this.client.utils.removeDuplicates(this.client.commands
			.filter(cmd => cmd.category !== 'Developer' && cmd.category !== 'Server Core' && cmd.category !== 'Utility')
			.map(cmd => cmd.category));

		const { disabledModules } = guild;
		const enabled = categories.filter((allModules) => !disabledModules.includes(allModules));

		if (module) module = this.client.utils.capitalise(module);

		if (enabledOrDisabled === 'enable' && disabledModules.includes(module)) {
			guild.disabledModules = this.client.utils.arrayRemove(guild.disabledModules, module);

			await guild.save().catch();

			const moduleEnabled = new MessageEmbed()
				.setTitle('Module Enabled')
				.setDescription(`The ${module} module has been enabled`)
				.setColor(this.client.embed.color.success);
			return message.reply({ embeds: [moduleEnabled] });
		}


		if (enabledOrDisabled === 'disable' && enabled.includes(module) && !disabledModules.includes(module)) {
			await guild.disabledModules.push(module);
			await guild.save();

			const disabledModule = new MessageEmbed()
				.setTitle('Module Disabled')
				.setDescription(`The ${module} module has been disabled`)
				.setFooter('To reenable modules, use module enable')
				.setColor(this.client.embed.color.error);
			return message.reply({ embeds: [disabledModule] });
		}

		let moduleList = '';

		for (let i = 0; i < categories.length; i++) {
			moduleList += `${categories[i]} ${enabled.includes(categories[i]) ? emotes.onSwitch : emotes.offSwitch}\n`;
		}

		const moduleEmbed = new MessageEmbed()
			.setTitle(`Module Status`, this.client.user.displayAvatarURL())
			.setDescription(moduleList)
			.setColor(this.client.embed.color.default);

		return message.channel.send({ embeds: [moduleEmbed] });
	}

};
