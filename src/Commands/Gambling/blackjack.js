/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');
const blackJack = require('../../../assets/jsons/blackjack/blackjackEmojis.json');
const validMoves = ['Hit', 'Stand', 'Fold', 'Double', 'Split', 'Forfeit'];
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			category: 'Gambling',
			description: 'Place your bet and test your luck in a game of blackjack!',
			guildOnly: true,
			usage: '(bet)'
		});
	}

	async run(message, [bet]) {
		if (!bet) {
			const howToPlayEmbed = new MessageEmbed()
				.setTitle('How To Play')
				.setDescription(`${blackJack.explanation}\n\nOptions\n\n${blackJack.options}`)
				.addField('Usage', `${this.usage}`)
				.setColor(this.client.embed.color.default);
			return message.reply({ embeds: [howToPlayEmbed] });
		}

		const validBet = await this.client.economy.isValidPayment(message, bet);

		if (!validBet) return;

		const current = this.client.games.get(message.channel.id);

		if (current) {
			const gameInProgress = new MessageEmbed()
				.setDescription(`Please wait until the current game of \`${current.name}\` is finished.`)
				.setThumbnail(this.client.embed.thumbnails.ameShake)
				.setColor(this.client.embed.color.error);
			return message.reply({ embeds: [gameInProgress] });
		}

		this.client.games.set(message.channel.id, { name: this.name });

		let deck = [];
		let players = [];
		const playerHand = [];
		const dealerHand = [];
		const gameOver = false;

		const suits = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
		const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

		deck = this.createDeck(deck, values, suits);
		players = this.createPlayers(players);

		this.dealHands(deck, players);
		this.getHands(playerHand, dealerHand, players);

		const rowMoves = new MessageActionRow();
		const rowMoves2 = new MessageActionRow();

		for (let i = 0; i < validMoves.length; i++) {
			if (i < validMoves.length / 2) {
				rowMoves.addComponents(
					new MessageButton()
						.setCustomId(validMoves[i])
						.setLabel(validMoves[i])
						.setStyle('DANGER')
				);
			} else {
				rowMoves2.addComponents(
					new MessageButton()
						.setCustomId(validMoves[i])
						.setLabel(validMoves[i])
						.setStyle('DANGER')
				);
			}
		}

		const gameStartEmbed = new MessageEmbed()
			.setAuthor(`Blackjack - Bet ${bet}`, message.author.displayAvatarURL())
			.setDescription(`**Your Hand: ${players[0].Points}\n${playerHand.join('')}\nThe dealer shows: ${players[1].Hand[0].Weight} **\n${dealerHand[0]}`)
			.setColor(this.client.embed.color.default);
		const gameBoard = await message.channel.send({ embeds: [gameStartEmbed], components: [rowMoves, rowMoves2] });

		// eslint-disable-next-line no-unmodified-loop-condition
		while (!gameOver) {
			const userInput = await this.client.utils.buttonCollector(message, gameBoard, 60000);

			if (!userInput) {
				message.reply(`The game has ended due to inactivity`);
				break;
			}

			if (userInput === 'Hit') {
				this.hitMe(0, playerHand, deck, players);

				if (players[0].Points > 21) {
					await this.client.economy.subtractCredits(message.author.id, message.guild.id, bet);

					const gameOverEmbed = new MessageEmbed()
						.setAuthor(`Gameover  - Bet: ${bet}`, this.client.user.displayAvatarURL())
						.setDescription(`**Your Hand: ${players[0].Points}\n${playerHand.join('')}\nThe dealer shows: ${players[1].Points}**\n${dealerHand[0]}`)
						.setFooter(`🚫 Bust! - You Lost ${bet} Credits`)
						.setThumbnail(this.client.embed.thumbnails.ameShake)
						.setColor(this.client.embed.color.error);
					message.channel.send({ embeds: [gameOverEmbed] });
					break;
				}

				gameStartEmbed.setDescription(`**Your Hand: ${players[0].Points}\n${playerHand.join('')}\nThe dealer shows: ${players[1].Hand[0].Weight}**\n${dealerHand[0]}`);
				await gameBoard.edit({ embeds: [gameStartEmbed], components: [rowMoves, rowMoves2] });
				continue;
			} else if (userInput === 'Stand') {
				this.dealerDraw(players, dealerHand, deck);

				const userWon = this.determineWinner(players);

				const gameOverEmbed = new MessageEmbed()
					.setAuthor(`Blackjack  - Bet: ${bet}`, this.client.user.displayAvatarURL())
					.setDescription(`**Your Hand: ${players[0].Points}\n${playerHand.join('')}\nThe dealer shows: ${players[1].Points}**\n${dealerHand.join('')}`);

				const embed = await this.buildGameOverEmbed(gameOverEmbed, message, bet, userWon);
				message.channel.send({ embeds: [embed] });
				break;
			} else if (userInput === 'Fold') {
				const foldedBet = Math.round(bet / 2);
				await this.client.economy.subtractCredits(message.author.id, message.guild.id, bet);

				const forfeitEmbed = new MessageEmbed()
					.setAuthor(`Gameover  - Bet: ${bet}`, this.client.user.displayAvatarURL())
					.setDescription(`**Your Hand: ${players[0].Points}\n${playerHand.join('')}\nThe dealer shows: ${players[1].Points}**\n${dealerHand.join('')}`)
					.setFooter(`🚫 Fold! - You Lost ${foldedBet} Credits`)
					.setThumbnail(this.client.embed.thumbnails.ameShake)
					.setColor(this.client.embed.color.error);
				message.channel.send({ embeds: [forfeitEmbed] });
				break;
			} else if (userInput === 'Split') {
				const aceInHand = players[0].Hand.some(card => card.Value === 'A');

				if (aceInHand) {
					rowMoves2.components[1].disabled = true;

					const indexOfAce = players[0].Hand.findIndex(card => card.Value === 'A');
					players[0].Hand[indexOfAce].Weight = 1;
					this.updatePoints(players);

					gameStartEmbed.setDescription(`**Your Hand: ${players[0].Points}\n${playerHand.join('')}\nThe dealer shows: ${players[1].Hand[0].Weight}**\n${dealerHand[0]}`);
					await gameBoard.edit({ embeds: [gameStartEmbed], components: [rowMoves, rowMoves2] });
					continue;
				}
			} else if (userInput === 'Double') {
				this.hitMe(0, playerHand, deck, players);

				bet *= 2;

				if (players[0].Points > 21) {
					await this.client.economy.subtractCredits(message.author.id, message.guild.id, bet);

					const gameOverEmbed = new MessageEmbed()
						.setAuthor(`Gameover  - Bet: ${bet}`, this.client.user.displayAvatarURL())
						.setDescription(`**Your Hand: ${players[0].Points}\n${playerHand.join('')}\nThe dealer shows: ${players[1].Points}**\n${dealerHand.join('')}`)
						.setFooter(`🚫 Bust! - You Lost ${bet} Credits`)
						.setThumbnail(this.client.embed.thumbnails.ameShake)
						.setColor(this.client.embed.color.error);
					message.channel.send({ embeds: [gameOverEmbed] });
					break;
				}

				this.dealerDraw(players, dealerHand, deck);

				const userWon = this.determineWinner(players);

				const gameOverEmbed = new MessageEmbed()
					.setAuthor(`Blackjack  - Bet: ${bet}`, this.client.user.displayAvatarURL())
					.setDescription(`**Your Hand: ${players[0].Points}\n${playerHand.join('')}\nThe dealer shows: ${players[1].Points}**\n${dealerHand.join('')}`);

				const embed = await this.buildGameOverEmbed(gameOverEmbed, message, bet, userWon);
				message.channel.send({ embeds: [embed] });
				break;
			} else {
				await this.client.economy.subtractCredits(message.author.id, message.guild.id, bet);

				const forfeitEmbed = new MessageEmbed()
					.setAuthor(`Gameover  - Bet: ${bet}`, this.client.user.displayAvatarURL())
					.setDescription(`**Your Hand: ${players[0].Points}\n${playerHand.join('')}\nThe dealer shows: ${players[1].Points}**\n${dealerHand.join('')}`)
					.setFooter(`🚫 Forfeit! - You Lost ${bet} Credits`)
					.setThumbnail(this.client.embed.thumbnails.ameShake)
					.setColor(this.client.embed.color.error);
				message.channel.send({ embeds: [forfeitEmbed] });
				break;
			}
		}

		this.client.games.delete(message.channel.id);
	}

	createDeck(deck, values, suits) {
		deck = [];

		for (let i = 0; i < values.length; i++) {
			for (let j = 0; j < suits.length; j++) {
				let weight = parseInt(values[i]);

				if (values[i] === 'J' || values[i] === 'Q' || values[i] === 'K') weight = 10;
				if (values[i] === 'A') weight = 11;

				const card = {
					Value: values[i],
					Suit: suits[j],
					Weight: weight
				};

				deck.push(card);
			}
		}

		this.shuffle(deck);
		return deck;
	}

	shuffle(deck) {
		for (let i = 0; i < 1000; i++) {
			const location1 = Math.floor(Math.random() * deck.length);
			const location2 = Math.floor(Math.random() * deck.length);
			const tmp = deck[location1];

			deck[location1] = deck[location2];
			deck[location2] = tmp;
		}
	}

	createPlayers(players) {
		players = [];
		for (let i = 1; i <= 2; i++) {
			const hand = [];
			const player = {
				Name: `Player ${i}`,
				ID: i,
				Points: 0,
				Hand: hand,
				Split: false
			};

			players.push(player);
		}

		return players;
	}

	dealHands(deck, players) {
		for (let i = 0; i < 2; i++) {
			for (let j = 0; j < 2; j++) {
				const card = deck.pop();
				players[j].Hand.push(card);
				this.updatePoints(players);
			}
		}

		return deck && players;
	}

	updatePoints(players) {
		for (let i = 0; i < players.length; i++) {
			this.getPoints(players[i]);
		}
	}

	getPoints(players) {
		let points = 0;
		for (let i = 0; i < players.Hand.length; i++) {
			points += players.Hand[i].Weight;
		}

		players.Points = points;

		return points;
	}

	getHands(playerHand, dealerHand, players) {
		for (let j = 0; j < 2; j++) {
			playerHand.push(`${blackJack.emojis[players[0].Hand[j].Value + players[0].Hand[j].Suit]}`);
			dealerHand.push(`${blackJack.emojis[players[1].Hand[j].Value + players[1].Hand[j].Suit]}`);
		}
	}

	hitMe(num, hand, deck, players) {
		const card = deck.pop();
		players[num].Hand.push(card);
		hand.push(`${blackJack.emojis[card.Value + card.Suit]}`);
		this.updatePoints(players);
	}

	dealerDraw(players, dealerHand, deck) {
		while (players[0].Points > players[1].Points && players[1].Points <= 21) {
			this.hitMe(1, dealerHand, deck, players);
		}
	}

	determineWinner(players) {
		const dealerPoints = players[1].Points;
		const userPoints = players[0].Points;

		const userWinConditions = userPoints > dealerPoints || dealerPoints > 21;
		const dealerWinCondition = dealerPoints > userPoints;

		if (userWinConditions === true) {
			return true;
		} else if (dealerWinCondition === true) {
			return false;
		} else {
			return undefined;
		}
	}

	async buildGameOverEmbed(embed, message, bet, userWon) {
		if (userWon === true) {
			await this.client.economy.addCredits(message.author.id, message.guild.id, bet);

			embed.setColor(this.client.embed.color.success);
			embed.setFooter(`💸 You won ${bet} credits!`);
			return embed;
		} else if (userWon === false) {
			await this.client.economy.subtractCredits(message.author.id, message.guild.id, bet);

			embed.setColor(this.client.embed.color.error);
			embed.setFooter(`The dealer won! - You lost ${bet} credits`);
			return embed;
		} else {
			embed.setColor(this.client.embed.color.default);
			embed.setFooter(`It's a Standoff!`);
			return embed;
		}
	}

};
