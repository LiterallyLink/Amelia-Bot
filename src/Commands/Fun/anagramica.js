const anagramLetterProbability = require('../../../assets/jsons/anagram/anagramicaProbability.json');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const anagramScores = require('../../../assets/jsons/anagram/anagramicaScore.json');
const request = require('node-superfetch');
const Command = require('../../Structures/Command');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['anagram'],
			description: 'Play a game of anagramica and guess as many words as possible!',
			category: 'Fun'
		});
	}

	async run(message) {
		const current = this.client.games.get(message.channel.id);

		if (current) {
			const gameInProgress = new MessageEmbed()
				.setDescription(`Please wait until the current game of \`${current.name}\` is finished.`)
				.setThumbnail(this.client.embed.thumbnails.ameShake)
				.setColor(this.client.embed.color.error);
			return message.reply({ embeds: [gameInProgress] });
		}

		this.client.games.set(message.channel.id, { name: this.name });

		const { valid, letters } = await this.fetchList();

		const quitButton = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('quit')
					.setLabel('Quit')
					.setStyle('DANGER')
			);

		const anagramicaStartMenu = new MessageEmbed()
			.setTitle('Anagramica - Start Guessing!')
			.setDescription(letters.map(letter => `\`${letter.toUpperCase()}\``).join(' '))
			.setFooter('You have 60 seconds to provide anagrams for the following letters.')
			.setColor(this.client.embed.color.default);
		await message.reply({ embeds: [anagramicaStartMenu], components: [quitButton] });

		const picked = [];
		let points = 0;
		let incorrectGuesses = 0;

		const filter = res => {
			if (picked.includes(res.content.toLowerCase())) return false;

			const score = this.getScore(letters, res.content.toLowerCase());

			if (!score) return false;

			if (!valid.includes(res.content.toLowerCase())) {
				points -= score;
				picked.push(res.content.toLowerCase());
				res.react('❌');
				incorrectGuesses++;
				return false;
			}

			points += score;
			picked.push(res.content.toLowerCase());
			res.react('✅');
			return true;
		};

		const anagramCollector = await message.channel.awaitMessages({ filter, time: 60000 });

		this.client.games.delete(message.channel.id);

		const anagramEmbed = new MessageEmbed()
			.setTitle('Anagramica - Game Over!')
			.setColor(this.client.embed.color.default);

		if (!anagramCollector.size) {
			anagramEmbed.setDescription('No guesses? Better luck next time!');
			return message.reply({ embeds: [anagramEmbed] });
		}

		if (points < 1) {
			anagramEmbed.setDescription(`Yikes! Your final score was \`${points}\``);
			anagramEmbed.setColor(this.client.embed.color.error);
			return message.reply({ embeds: [anagramEmbed] });
		}

		anagramEmbed.setDescription(`Great job! Your total score was \`${points}\``)
			.addField('Guessed', `${picked.length}/${valid.length} words`, true)
			.addField('Incorrect Guesses', `${incorrectGuesses}`, true);
		return message.reply({ embeds: [anagramEmbed] });
	}

	async fetchList() {
		const letters = [];

		for (let i = 0; i < 10; i++) {
			letters.push(this.weightedRandom(anagramLetterProbability));
		}

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

		return undefined;
	}

};
