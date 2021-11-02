/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const { inspect } = require('util');
const { Type } = require('@extreme_hero/deeptype');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['e'],
			description: 'Evaluates and executes code.',
			category: 'Developer',
			usage: '<code>',
			args: true,
			devOnly: true
		});
	}

	async run(message, args) {
		let code = args.join(' ');
		code = code.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
		let evaled;
		try {
			const start = process.hrtime();
			evaled = eval(code);
			if (evaled instanceof Promise) {
				evaled = await evaled;
			}
			const stop = process.hrtime(start);

			const evaluatedCode = new MessageEmbed()
				.setColor(this.client.embed.color.default)
				.setTitle('Evaluated')
				.setDescription(`📥 **To Eval**\n\`\`\`${code}\`\`\` \n📤 **Evaled** \n\`\`\`js\n${this.clean(inspect(evaled, { depth: 0 }))}\n\`\`\``)
				.addField('Type Of', `\`\`\`ts\n${new Type(evaled).is}\n\`\`\``)
				.addField(':stopwatch: Time Taken:', `\`\`\`${(((stop[0] * 1e9) + stop[1])) / 1e6}ms\`\`\``);
			message.reply({ embeds: [evaluatedCode] });
		} catch (error) {
			const invalidCode = new MessageEmbed()
				.setTitle('Error')
				.addField('Error', `${error}`)
				.setThumbnail(this.client.embed.thumbnails.ameShake)
				.setColor(this.client.embed.color.error);
			message.reply({ embeds: [invalidCode] });
		}
	}

	clean(text) {
		if (typeof text === 'string') {
			text = text
				.replace(/`/g, `\`${String.fromCharCode(8202)}`)
				.replace(/@/g, `@${String.fromCharCode(8203)}`)
				.replace(new RegExp(this.client.token, 'gi'), '****');
		}
		return text;
	}

};

