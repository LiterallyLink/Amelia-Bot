/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');
const blackJack = require('../../../assets/jsons/blackjack.json');
const validInput = ['hit', 'stay', 'stand', 'fold', 'double', 'split'];
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			category: 'Gambling',
			guildOnly: true
		});
	}

	async run(message, [bet]) {
		/* Below we detect if a bet was provided for the
           game, if not we send an embed instructing the
           user how to play the game.
        */

		if (!bet) {
			const howToPlayEmbed = new MessageEmbed()
				.setTitle('How To Play')
				.setDescription(`${blackJack.explanation}\n\nOptions\n\n${blackJack.options}`)
				.addField('Usage', `${this.usage}`)
				.setColor(this.client.embed.color.default);
			return message.reply({ embeds: [howToPlayEmbed] });
		}

		/* Below we invoke a function found in the economy
           utility file that detects if the bet provided
           was a valid amount. E.g !bet 30 would return
           true as it is a whole number. This function
           also checks if the bet is greater than the
           current user's balance.
        */

		const validBet = await this.client.economy.isValidPayment(message, bet);
		if (!validBet) return;

		/* Checking in the games collection if the current
           channel has a game in progress already.
        */

		const current = this.client.games.get(message.channel.id);

		/* If there is a game in progress, provide a message
           to the user to wait till it is over.
        */

		if (current) {
			const gameInProgress = new MessageEmbed()
				.setDescription(`Please wait until the current game of \`${current.name}\` is finished.`)
				.setColor(this.client.embed.color.error);
			return message.reply({ embeds: [gameInProgress] });
		}

		/* If there is no game in progress found in the collection,
           then set one to the current channel id and to the game name.
        */

		this.client.games.set(message.channel.id, { name: this.name });

		let deck = [];
		let players = [];
		const playerHand = [];
		const dealerHand = [];
		let gameOver = false;

		/* Below is a set of array's containing card attributes that
           we will be using to construct and shuffle a deck with.
        */

		const suits = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
		const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

		/* This function creates our deck by assigning
           each card a value, a suit and a weight based
           on the current iteration of the loop and push
           it into the deck array to be used later.

           We then invoke the shuffle function to
           randomize the order of the cards in the
           deck.
        */

		deck = this.createDeck(deck, values, suits);
		players = this.createPlayers(players);
		this.dealHands(deck, players);
		this.getHands(playerHand, dealerHand, players);

		const gameStartEmbed = new MessageEmbed()
			.setAuthor(`Blackjack - Bet ${bet}`, message.author.displayAvatarURL())
			.setDescription(`**Your Hand: ${players[0].Points}\n${playerHand.join('')}\nThe dealer shows:**\n${dealerHand[0]}`)
			.setFooter('Hit, Stay, Fold, Split, or Double?')
			.setColor(this.client.embed.color.default);
		message.channel.send({ embeds: [gameStartEmbed] });

		while (!gameOver) {
			const collectorOptions = {
				userMessage: message,
				input: validInput,
				max: 1,
				time: 60000
			};
			const userInput = await this.client.utils.createAsyncMessageCollector(collectorOptions);

			if (!userInput) {
				this.client.games.delete(message.channel.id);
				return message.reply(`The game has ended due to inactivity`);
			}

			switch (userInput) {
				case 'hit': {
					this.hitMe(0, playerHand, deck, players);
					// this.autoSplit(players[0]);

					if (this.userExceeded21(players, message, bet, playerHand, dealerHand)) {
						await this.client.economy.addCredits(message.guild.id, message.author.id, -bet);
						this.client.games.delete(message.channel.id);
						gameOver = true;
						break;
					}

					const drawCardEmbed = new MessageEmbed()
						.setAuthor(`Blackjack - Bet ${bet}`, message.author.displayAvatarURL())
						.setDescription(`**Your Hand: ${players[0].Points}\n${playerHand.join('')}\nThe dealer shows:**\n${dealerHand[0]}`)
						.setFooter('Hit, Stay, Fold, Split, or Double?')
						.setColor(this.client.embed.color.default);
					message.channel.send({ embeds: [drawCardEmbed] });
					break;
				}
				case 'double': {
					this.hitMe(0, playerHand, deck, players);

					if (this.userExceeded21(players, message, bet, playerHand, dealerHand)) {
						await this.client.economy.addCredits(message.guild.id, message.author.id, -bet);
						this.client.games.delete(message.channel.id);
						gameOver = true;
						break;
					}

					this.dealerHand(players, dealerHand, deck);
					gameOver = true;
					const userWinConditions = players[0].Points > players[1].Points || players[1].Points > 21;
					const dealerWinConditions = players[0].Points < players[1].Points;

					if (userWinConditions) {
						bet *= 1.5;
						await this.client.economy.addCredits(message.guild.id, message.author.id, bet);
						this.userWonMessage(message, bet, players, playerHand, dealerHand);
						break;
					} else if (dealerWinConditions) {
						await this.client.economy.addCredits(message.guild.id, message.author.id, -bet);
						this.dealerWonMessage(message, bet, players, playerHand, dealerHand);
						break;
					} else {
						this.gameTiedMessage(message, bet, players, playerHand, dealerHand);
						break;
					}
				}
				case 'stay':
				case 'stand': {
					this.dealerHand(players, dealerHand, deck);

					gameOver = true;
					this.client.games.delete(message.channel.id);
					const userWinConditions = players[0].Points > players[1].Points || players[1].Points > 21;
					const dealerWinConditions = players[0].Points < players[1].Points;

					if (userWinConditions) {
						bet *= 1.5;
						await this.client.economy.addCredits(message.guild.id, message.author.id, bet);
						this.userWonMessage(message, bet, players, playerHand, dealerHand);
						break;
					} else if (dealerWinConditions) {
						await this.client.economy.addCredits(message.guild.id, message.author.id, -bet);
						this.dealerWonMessage(message, bet, players, playerHand, dealerHand);
						break;
					} else {
						this.gameTiedMessage(message, bet, players, playerHand, dealerHand);
						break;
					}
				}
				case 'fold': {
					(bet /= -2).toFixed();
					gameOver = true;
					await this.client.economy.addCredits(message.guild.id, message.author.id, bet);

					const foldEmbed = new MessageEmbed()
						.setAuthor(`Blackjack - Bet ${bet}`, message.author.displayAvatarURL())
						.setDescription(`**Your Hand: ${players[0].Points}\n${playerHand.join('')}\nDealer's cards: ${players[1].Points}**\n${dealerHand.join('')}`)
						.setFooter(`🚫 Fold! - You Lost ${(bet / 2).toFixed()} Credits`)
						.setColor('fce3b7');
					message.channel.send({ embeds: [foldEmbed] });
					break;
				}
				case 'split':
					break;
			}
		}
	}

	createDeck(deck, values, suits) {
		deck = [];

		for (let i = 0; i < values.length; i++) {
			for (let j = 0; j < suits.length; j++) {
				let weight = parseInt(values[i]);
				if (values[i] === 'J' || values[i] === 'Q' || values[i] === 'K') { weight = 10; }
				if (values[i] === 'A') { weight = 11; }
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

	// autoSplit(players) {
	//  const drewAnAce = players.Hand.filter(hand => hand.Value === 'A');
	//  if (drewAnAce.length !== 0 && split === false && players.Points > 21) {
	//      split = true;
	//  }
	// }

	// split(players, split) {
	//  const drewAnAce = players[0].Hand.filter(hand => hand.Value === 'A');
	//  // if (drewAnAce.length !== 0 && split === false);
	// }

	gameTiedMessage(message, bet, players, playerHand, dealerHand) {
		const tiedGameEmbed = new MessageEmbed()
			.setAuthor(`Blackjack - Bet ${bet}`, message.author.displayAvatarURL())
			.setDescription(`**Your Hand: ${players[0].Points}\n${playerHand.join('')}\nDealer's cards: ${players[1].Points}**\n${dealerHand.join('')}`)
			.setFooter(`It's a tie!`)
			.setColor(this.client.embed.color.default);
		return message.channel.send({ embeds: [tiedGameEmbed] });
	}

	dealerWonMessage(message, bet, players, playerHand, dealerHand) {
		const dealerWonEmbed = new MessageEmbed()
			.setAuthor(`Blackjack - Bet ${bet}`, message.author.displayAvatarURL())
			.setDescription(`**Your Hand: ${players[0].Points}\n${playerHand.join('')}\nDealer's cards: ${players[1].Points}**\n${dealerHand.join('')}`)
			.setFooter(`The dealer won! - You lost ${bet} credits`)
			.setColor(this.client.embed.color.error);
		message.channel.send({ embeds: [dealerWonEmbed] });
	}

	userWonMessage(message, bet, players, playerHand, dealerHand) {
		const userWonEmbed = new MessageEmbed()
			.setAuthor(`Blackjack - Bet ${bet}`, message.author.displayAvatarURL())
			.setDescription(`**Your Hand: ${players[0].Points}\n${playerHand.join('')}\nDealer's cards: ${players[1].Points}**\n${dealerHand.join('')}`)
			.setFooter(`💸 You won ${bet} credits!`)
			.setColor(this.client.embed.color.green);
		message.channel.send(userWonEmbed);
	}

	dealerHand(players, dealerHand, deck) {
		while (players[0].Points > players[1].Points && players[1].Points <= 21) {
			this.hitMe(1, dealerHand, deck, players);
			// this.autoSplit(players[1]);
		}
	}

	userExceeded21(players, message, bet, playerHand, dealerHand) {
		if (players[0].Points > 21) {
			const bustEmbed = new MessageEmbed()
				.setAuthor(`Blackjack - Bet ${bet}`, message.author.displayAvatarURL())
				.setDescription(`**Your Hand: ${players[0].Points}\n${playerHand.join('')}\nThe dealer shows:**\n${dealerHand[0]}`)
				.setFooter(`🚫 Bust! - You Lost ${bet} Credits`)
				.setColor(this.client.embed.color.error);

			message.channel.send({ embeds: [bustEmbed] });
			return true;
		}
	}

};
