const { MessageEmbed } = require('discord.js');
const Command = require('../../Structures/Command');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Provides information about categories and commands.',
			category: 'Utility',
			usage: ', help <category>, help <command>'
		});
	}

	async run(message, [query], prefix) {
		const { commands, aliases, embed } = this.client;
		const commandList = commands.map(cmd => cmd.name);
		let categories = this.client.utils.removeDuplicates(commands.map(cmd => cmd.category));

		if (!this.client.utils.userIsADev(message.author)) {
			categories = categories.filter(category => category !== 'Developer');
		}

		const commandOrCategory = this.commandOrCategory(query, categories, commandList, aliases);

		if (commandOrCategory === 'isCategory') {
			query = this.client.utils.capitalise(query);
			const categoryCommands = commands.filter(cmd => cmd.category === query)
				.map(cmd => `\`${prefix}${cmd.name}\` \n${cmd.description}`).join('\n\n');

			const categoryHelpEmbed = new MessageEmbed()
				.setAuthor(`${query} Plugin Menu`, this.client.user.displayAvatarURL())
				.setThumbnail(embed.thumbnails.ameRead)
				.setDescription(`${categoryCommands}`)
				.setFooter(`For more information on a command, use ${prefix}help (command)`)
				.setColor(embed.color.default);
			return message.reply({ embeds: [categoryHelpEmbed] });
		} else if (commandOrCategory === 'isCommand') {
			query = query.toLowerCase();
			const command = commands.get(query) || commands.get(aliases.get(query));
			const commandAliases = command.aliases.map(alias => `\`${alias}\``).join(' ') || '``None``';

			const commandHelpEmbed = new MessageEmbed()
				.setAuthor(`${this.client.utils.capitalise(command.name)} Command Help`, this.client.user.displayAvatarURL())
				.setThumbnail(embed.thumbnails.ameRead)
				.addField('Aliases:', `${commandAliases}`, true)
				.addField('Description:', `${command.description}`, true)
				.addField('Category:', `${command.category}`, true)
				.addField('Usage:', `${command.usage}`, true)
				.setColor(embed.color.default);
			return message.reply({ embeds: [commandHelpEmbed] });
		}

		const defaultHelpMenu = new MessageEmbed()
			.setAuthor("Amelia's Help Menu", this.client.user.displayAvatarURL())
			.setThumbnail(embed.thumbnails.ameRead)
			.setFooter(`For more information, use ${prefix}help (category) or ${prefix}help (command)`)
			.setColor(embed.color.default);

		for (const category of categories) {
			defaultHelpMenu.addField(`**${this.client.utils.capitalise(category)}**`,
				`\`${prefix}help ${category.toLowerCase()}\``, true);
		}
		return message.reply({ embeds: [defaultHelpMenu] });
	}

	commandOrCategory(query, categories, commandList, aliases) {
		if (!query) return false;

		query = query.toLowerCase();
		const containsCategory = categories.includes(this.client.utils.capitalise(query));
		const containsCommand = commandList.includes(query) || aliases.has(query);

		if (containsCategory) return 'isCategory';
		if (containsCommand) return 'isCommand';

		return false;
	}

};

