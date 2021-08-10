const { MessageEmbed } = require('discord.js');
const letterPool = 'abcdefghijklmnopqrstuvwxyz'.split('');
const anagramScores = require('../../../assets/jsons/anagramicaScore.json');
const request = require('node-superfetch');
const Command = require('../../Structures/Command');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Provides a link to invite the bot to your guild',
			category: 'Fun'
		});
	}

	async run(message) {
		const current = this.client.games.get(message.channel.id);

		if (current) {
			const gameInProgress = new MessageEmbed()
				.setDescription(`Please wait until the current game of \`${current.name}\` is finished.`)
				.setColor(this.client.embed.color.error);
			return message.reply({ embeds: [gameInProgress] });
		}

		this.client.games.set(message.channel.id, { name: this.name });

		const { valid, letters } = await this.fetchList();

		const anagramicaStartMenu = new MessageEmbed()
			.setTitle('Anagramica - Start Guessing!')
			.setDescription(letters.map(letter => `\`${letter.toUpperCase()}\``).join(' '))
			.setFooter('You have 60 seconds to provide anagrams for the following letters.')
			.setColor(this.client.embed.color.default);
		await message.reply({ embeds: [anagramicaStartMenu] });

		const picked = [];
		let points = 0;

		const filter = res => {
			if (picked.includes(res.content.toLowerCase())) return false;

			const score = this.getScore(letters, res.content.toLowerCase());

			if (!score) return false;

			if (!valid.includes(res.content.toLowerCase())) {
				points -= score;
				picked.push(res.content.toLowerCase());
				return false;
			}

			points += score;
			picked.push(res.content.toLowerCase());
			return true;
		};

		const anagramCollector = await message.channel.awaitMessages({ filter, time: 60000 });

		this.client.games.delete(message.channel.id);

		if (!anagramCollector.size) {
			const noAnagramGiven = new MessageEmbed()
				.setTitle(`Anagramica - Game Over!`)
				.setDescription('No guesses? Better luck next time!')
				.setColor(this.client.embed.color.error);
			return message.reply({ embeds: [noAnagramGiven] });
		}

		if (points < 1) {
			const negativePoints = new MessageEmbed()
				.setTitle(`Anagramica - Game Over!`)
				.setDescription(`Yikes! Your final score was ${points}`)
				.setColor(this.client.embed.color.default);
			return message.reply({ embeds: [negativePoints] });
		}

		const totalPointsEmbed = new MessageEmbed()
			.setTitle(`Anagramica - Game Over!`)
			.setDescription(`Great job! Your total score was ${points}`)
			.addField('Guessed', `${picked.length}/${valid.length}`, true)
			.addField('Incorrect Guesses', 'incorrect num', true)
			.setColor(this.client.embed.color.default);
		return message.reply({ embeds: [totalPointsEmbed] });
	}

	async fetchList() {
		const letters = [];

		for (let i = 0; i < 10; i++) letters.push(letterPool[Math.floor(Math.random() * letterPool.length)]);
		const { body } = await request.get(`http://www.anagramica.com/all/${letters.join('')}`);
		return { valid: body.all, letters };
	}

	getScore(letters, word) {
		let score = 0;
		for (const letter of word.split('')) {
			if (!letters.includes(letter)) return null;
			score += anagramScores[letter];
		}
		return score;
	}


	weightedRandom(prob) {
		let i, sum = 0;
		const randomValue = Math.random();
		for (i in prob) {
			sum += prob[i];
			if (randomValue <= sum) return i;
		}
		return null;
	}

};
