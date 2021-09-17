const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['rl'],
			description: 'Reloads specific commands',
			category: 'Developer',
			usage: '<command>',
			devOnly: true
		});
	}

	async run(message, [cmd]) {
		if (!cmd) {
			const noCommandProvided = new MessageEmbed()
				.setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
				.setDescription(`Please enter the command name for reload!`)
				.setColor(this.client.embed.color.error)
				.setTimestamp();
			return message.channel.send({ embeds: [noCommandProvided] });
		}

		const command = this.client.commands.get(cmd) || this.client.commands.get(this.client.aliases.get(cmd));

		if (command) {
			delete require.cache[require.resolve(`../${command.category}/${ucFirst(command.name)}.js`)];

			const File = require(`../${command.category}/${ucFirst(command.name)}.js`);
			const reloadedCommand = new File(this.client, command.name.toLowerCase());

			this.client.commands.delete(command.name);
			await this.client.commands.set(command.name, reloadedCommand);

			const reloadSuccessful = new MessageEmbed()
				.setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
				.setDescription(`\`\`\`Command ${command.name} has been restarted!\`\`\``)
				.setColor('DARK-BLUE')
				.setTimestamp();
			return message.reply({ embeds: [reloadSuccessful] });
		} else {
			const commandNotFound = new MessageEmbed()
				.setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
				.setDescription(`Could not find command named **${cmd}**!`)
				.setColor(this.client.embed.color.error)
				.setTimestamp();
			return message.reply({ embeds: [commandNotFound] });
		}

		function ucFirst(str) {
			if (!str) return str;
			return str[0].toUpperCase() + str.slice(1);
		}
	}

};
