/* eslint-disable complexity */
const Command = require('../../Structures/Command');
const { Aki } = require('aki-api');
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: "Think about a real or fictional character, and I'll do my best to guess who it is.",
			category: 'Fun',
			guildOnly: true
		});
	}

	async run(message) {
		const optionRow = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('en')
					.setLabel('Characters')
					.setStyle('SUCCESS'),

				new MessageButton()
					.setCustomId('en_objects')
					.setLabel('Objects')
					.setStyle('SECONDARY'),

				new MessageButton()
					.setCustomId('en_animals')
					.setLabel('Animals')
					.setStyle('DANGER')
			);

		const optionEmbed = new MessageEmbed()
			.setDescription(`Please select the next game thematic`)
			.setColor(this.client.embed.color.default);
		const optionMsg = await message.channel.send({ embeds: [optionEmbed], components: [optionRow] });

		const chosenThematic = await this.client.utils.buttonCollector(message, optionMsg, 60000);

		optionMsg.delete();

		if (chosenThematic === null) {
			return message.channel.send({ content: 'The game has been cancelled due to inactivity.' });
		}

		const aki = new Aki({ region: chosenThematic });

		let ans = null;
		let win = false;
		let timesGuessed = 0;
		let guessResetNumber = 0;
		let wentBack = false;
		let forceGuess = false;
		const guessBlacklist = [];

		while (timesGuessed < 3) {
			if (guessResetNumber > 0) {
				guessResetNumber--;
			}

			if (ans === null) {
				await aki.start();
			} else if (wentBack) {
				wentBack = false;
			} else {
				try {
					await aki.step(ans);
				} catch {
					await aki.step(ans);
				}
			}

			if (!aki.answers || aki.currentStep >= 79) {
				forceGuess = true;
			}

			const answers = aki.answers.map(answer => answer.toLowerCase());
			answers.push('end');

			if (aki.currentStep > 0) {
				answers.push('back');
			}

			const row = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('yes')
						.setLabel('Yes')
						.setStyle('SUCCESS'),

					new MessageButton()
						.setCustomId('no')
						.setLabel('No')
						.setStyle('DANGER'),

					new MessageButton()
						.setCustomId("don't know")
						.setLabel("Don't Know")
						.setStyle('SECONDARY')
				);

			const secondRow = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('probably')
						.setLabel('Probably')
						.setStyle('PRIMARY'),

					new MessageButton()
						.setCustomId('probably not')
						.setLabel('Probably Not')
						.setStyle('SECONDARY'),

					new MessageButton()
						.setCustomId('end')
						.setLabel('End')
						.setStyle('DANGER')
				);

			const backRow = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('back')
						.setLabel('Back')
						.setStyle('DANGER')
				);

			const buttonArray = answers.includes('back') ? [row, secondRow, backRow] : [row, secondRow];
			const gameTheme = chosenThematic === 'en' ? 'Characters' : chosenThematic === 'en_objects' ? 'Objects' : 'Animals';

			const questionEmbed = new MessageEmbed()
				.setAuthor(`Question ${aki.currentStep + 1} - Theme: ${gameTheme}`)
				.setDescription(`\`\`\`${aki.question} (${Math.round(Number.parseInt(aki.progress, 10))}%)\`\`\``)
				.setFooter(`You have 60 seconds to answer.`)
				.setColor(this.client.embed.color.default);
			const questionMsg = await message.channel.send({ embeds: [questionEmbed], components: buttonArray });

			const answerToQuestion = await this.client.utils.buttonCollector(message, questionMsg, 60000);

			questionMsg.delete();

			if (answerToQuestion === null) {
				win = 'time';
				break;
			}

			if (answerToQuestion === 'end') {
				forceGuess = true;
			} else if (answerToQuestion === 'back') {
				if (guessResetNumber > 0) {
					guessResetNumber++;
				}

				wentBack = true;
				await aki.back();
				continue;
			} else {
				ans = answers.indexOf(answerToQuestion);
			}

			if ((aki.progress >= 90 && !guessResetNumber) || forceGuess) {
				timesGuessed++;
				guessResetNumber += 10;

				await aki.win();

				const guess = aki.answers.filter(character => !guessBlacklist.includes(character.id))[0];

				if (!guess) {
					message.channel.send({ content: 'I can\'t think of anyone.' });
					win = true;
					break;
				}

				guessBlacklist.push(guess.id);

				const confirmationRow = new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setCustomId('yes')
							.setLabel('Yes')
							.setStyle('SUCCESS'),

						new MessageButton()
							.setCustomId('no')
							.setLabel('No')
							.setStyle('DANGER')
					);

				const guessEmbed = new MessageEmbed()
					.setTitle(`I'm ${Math.round(guess.proba * 100)}% sure it's...`)
					.setDescription(`${guess.name}${guess.description ? ` from ${guess.description}` : ''}`)
					.setImage(guess.absolute_picture_path || null)
					.setFooter(`Total Questions ${aki.currentStep + 1} - ${forceGuess ? 'Final Guess' : `Guess ${timesGuessed}`}`)
					.setColor(this.client.embed.color.default);
				const guessMsg = await message.channel.send({ embeds: [guessEmbed], components: [confirmationRow] });

				const correctCharacter = await this.client.utils.buttonCollector(message, guessMsg, 60000);

				if (correctCharacter === null) {
					win = 'time';
					break;
				} else if (correctCharacter === 'yes') {
					win = false;
					break;
				} else if (timesGuessed >= 3 || forceGuess) {
					win = true;
					break;
				} else {
					const continueOrEndGame = new MessageActionRow()
						.addComponents(
							new MessageButton()
								.setCustomId('btn1')
								.setLabel('Try again')
								.setStyle('SUCCESS'),

							new MessageButton()
								.setCustomId('quit')
								.setLabel('Quit Game?')
								.setStyle('DANGER')
						);

					const continueGameEmbed = new MessageEmbed()
						.setTitle('Continue?')
						.setColor(this.client.embed.color.default);
					const continueMsg = await message.channel.send({ embeds: [continueGameEmbed], components: [continueOrEndGame] });

					const charConfirmation = await this.client.utils.buttonCollector(message, continueMsg, 60000);

					if (charConfirmation === null) {
						win = 'time';
						break;
					} else if (charConfirmation === 'quit') {
						win = true;
						break;
					}
				}
			}
		}

		if (win === 'time') {
			return message.reply({ content: 'The game ended due to inactivity' });
		}

		if (win) {
			return message.channel.send({ content: 'Bravo, you have defeated me.' });
		}

		return message.channel.send({ content: 'Guessed right one more time! I love playing with you!' });
	}

};
