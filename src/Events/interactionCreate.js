const Event = require('../Structures/Event');

module.exports = class extends Event {

	async run(interaction) {
		if (!interaction.isCommand()) return;
		const command = this.client.commands.get(interaction.commandName);
		if (!command) return;
		try {
			await command.run(interaction);
		} catch (error) {
			if (error) console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}

};
