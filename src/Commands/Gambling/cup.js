const Command = require('../../Structures/Command');
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const cupArr = ['Cup 1', 'Cup 2', 'Cup 3'];

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			category: 'Gambling',
			usage: '(bet)',
			args: true,
			guildOnly: true
		});
	}

	async run(message, [bet]) {
		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('Cup 1')
					.setLabel('Cup 1')
					.setStyle('DANGER'),

				new MessageButton()
					.setCustomId('Cup 2')
					.setLabel('Cup 2')
					.setStyle('DANGER'),

				new MessageButton()
					.setCustomId('Cup 3')
					.setLabel('Cup 3')
					.setStyle('DANGER')
			);

		const cupEmbed = new MessageEmbed()
			.setImage('https://i.ibb.co/cCWyWJX/ame-Cup-Game.gif')
			.setFooter('Which cup is Ame hiding in?')
			.setColor(this.client.embed.color.default);
		const cupMsg = await message.channel.send({ embeds: [cupEmbed], components: [row] });

		const buttonFilter = i => i.user.id === message.author.id;
		const cupID = await cupMsg.awaitMessageComponent({ buttonFilter, time: 60000 }).then(interaction => interaction.customId);
		const randomCup = cupArr[this.client.utils.randomRange(1, cupArr.length) - 1];

		if (cupID === randomCup) {
			const youWonEmbed = new MessageEmbed()
				.setDescription(`Congrats! Ame was hiding under ${randomCup}!`)
				.setFooter(`💸 You won ${bet} credits!`)
				.setColor(this.client.embed.color.success);
			return cupMsg.edit({ embeds: [youWonEmbed], components: [] });
		} else {
			const youLostEmbed = new MessageEmbed()
				.setDescription(`Too bad! Ame was hiding under ${randomCup}. . .`)
				.setFooter(`💸 You lost ${bet} credits. . .`)
				.setColor(this.client.embed.color.error);
			return cupMsg.edit({ embeds: [youLostEmbed], components: [] });
		}
	}

};
