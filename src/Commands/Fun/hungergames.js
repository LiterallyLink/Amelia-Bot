/* eslint-disable consistent-return */
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const hungerGamesEvents = require('../../../assets/jsons/hungerGamesEvents.json');
const { createCanvas, loadImage } = require('node-canvas');
const Command = require('../../Structures/Command');

const avatarSize = 150;
const avatarHorizontalSpacing = 30;
const avatarVerticalSpacing = 100;
const avatarMarginX = 50;
const avatarMarginY = 200;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['hg'],
			description: 'Put server members head to head in a brutal battle of Hunger Games!',
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

		const buttonRow1 = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('start')
					.setLabel('Proceed')
					.setStyle('SUCCESS'),

				new MessageButton()
					.setCustomId('RandomizeDistricts')
					.setLabel('Randomize Districts')
					.setStyle('PRIMARY')
			);

		const buttonRow2 = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('RandomizeTributes')
					.setLabel('Randomize Tributes')
					.setStyle('SECONDARY'),

				new MessageButton()
					.setCustomId('quit')
					.setLabel('Quit')
					.setStyle('DANGER')
			);

		let startGame = false;
		const guildMembersCollection = await message.guild.members.fetch();
		let tributeDataArray = this.generateRandomTributes(guildMembersCollection);

		while (!startGame) {
			const canvas = await this.populateCanvas(tributeDataArray);

			const hungerGames = new MessageEmbed()
				.setImage('attachment://tributesPage.png')
				.setColor(this.client.embed.color.default);
			const gameStartMsg = await message.channel.send({
				embeds: [hungerGames],
				files: [{ attachment: canvas.toBuffer(), name: 'tributesPage.png' }],
				components: [buttonRow1, buttonRow2]
			});

			const startChoice = await this.client.utils.buttonCollector(message, gameStartMsg, 60000);

			if (!startChoice) {
				return message.reply({ content: 'The game has ended due to inactivity.' });
			} else if (startChoice === 'RandomizeDistricts') {
				tributeDataArray = this.randomizeDistricts(tributeDataArray);
				continue;
			} else if (startChoice === 'RandomizeTributes') {
				tributeDataArray = this.generateRandomTributes(guildMembersCollection);
				continue;
			} else if (startChoice === 'start') {
				startGame = true;
				break;
			} else {
				return message.reply({ content: 'The Hunger Games has been cancelled.' });
			}
		}

		let bloodBath = true;
		let sun = true;
		let turn = 0;
		const kills = {};

		while (this.gameOver(tributeDataArray) === false) {
			if (!bloodBath && sun) {
				++turn;
			}

			const currentEvent = bloodBath ? hungerGamesEvents.bloodbath : sun ? hungerGamesEvents.day : hungerGamesEvents.night;
			const remainingTributes = this.arrayOfTributesLeft(tributeDataArray);
			const results = [];
			const deaths = [];

			this.eventTrigger(remainingTributes, kills, currentEvent, deaths, results);
			const eventText = `${bloodBath ? 'Bloodbath' : sun ? `Day ${turn}` : `Night ${turn}`}`;

			const hungerGamesEmbed = new MessageEmbed()
				.setTitle(`Hunger Games - ${eventText}`)
				.setColor(this.client.embed.color.default);

			for (let i = 0; i < results.length; i++) {
				const eventImage = await this.generateEventImages(eventText, results[i], remainingTributes);

				hungerGamesEmbed.setImage('attachment://currentEvent.png');
				hungerGamesEmbed.setDescription(`${results[i]}`);

				message.channel.send({ embeds: [hungerGamesEmbed], files: [{ attachment: eventImage.toBuffer(), name: 'currentEvent.png' }] });
				await this.client.utils.sleep(3000);
			}

			if (deaths.length) {
				const progressionButtons = new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setCustomId('proceed')
							.setLabel('Proceed')
							.setStyle('SUCCESS'),

						new MessageButton()
							.setCustomId('status')
							.setLabel('View Statuses')
							.setStyle('SECONDARY'),

						new MessageButton()
							.setCustomId('quit')
							.setLabel('Quit')
							.setStyle('DANGER')
					);

				const deadTributesEmbed = new MessageEmbed()
					.setTitle(`The ${message.guild.name} Hunger Games - Fallen Tributes: ${deaths.length}`)
					.setDescription(`\n${deaths.length} cannon shot${deaths.length === 1 ? '' : 's'} can be heard in the distance. \n\n${deaths.join('\n')}`)
					.setColor(this.client.embed.color.error);
				message.channel.send({ embeds: [deadTributesEmbed], components: [progressionButtons] });
			}


			if (!bloodBath) {
				sun = !sun;
			}

			if (bloodBath) {
				bloodBath = false;
			}
		}

		const lastTribute = this.arrayOfTributesLeft(tributeDataArray);

		const afterGameButtons = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('stats')
					.setLabel('Statistics')
					.setStyle('SUCCESS'),

				new MessageButton()
					.setCustomId('placements')
					.setLabel('Placements')
					.setStyle('PRIMARY')
			);

		this.client.games.delete(message.channel.id, { name: this.name });

		const winners = lastTribute.length > 1 ? `${lastTribute[0].username} and ${lastTribute[1].username}` : lastTribute[0].username;

		const winEmbed = new MessageEmbed()
			.setTitle(`${winners} from District ${lastTribute[0].district} ${lastTribute.length > 1 ? 'are' : 'is'} the winner of the Hunger Games!`)
			.setColor(this.client.embed.color.success);
		message.channel.send({ embeds: [winEmbed], components: [afterGameButtons] });
	}

	generateRandomTributes(guildMembersCollection) {
		const arrayOfUsers = guildMembersCollection.map(tribute => tribute.user);
		const randomizedArrayOfUsers = this.client.utils.shuffle(arrayOfUsers);

		if (randomizedArrayOfUsers.length > 24) randomizedArrayOfUsers.length = 24;

		for (let i = 0; i < randomizedArrayOfUsers.length; i++) {
			const user = randomizedArrayOfUsers[i];

			user.alive = true;
			user.killed = [];
			user.killedBy = null;
			user.district = i === 0 ? 1 : Math.ceil(i / 2);
		}

		return randomizedArrayOfUsers;
	}

	randomizeDistricts(tributeDataArray) {
		tributeDataArray = this.client.utils.shuffle(tributeDataArray);

		for (let i = 0; i < tributeDataArray.length; i++) {
			tributeDataArray[i].district = Math.round(tributeDataArray.length / 2);
		}

		return tributeDataArray;
	}

	gameOver(tributesArray) {
		const playersLeftAlive = this.arrayOfTributesLeft(tributesArray);

		if (playersLeftAlive.length === 2) {
			return playersLeftAlive[0].district === playersLeftAlive[1].district;
		} else if (playersLeftAlive.length === 1) {
			return true;
		}

		return false;
	}

	eventParser(events, tributes) {
		for (let i = 0; i < 6; i++) {
			events = events.replaceAll(`(Player${i + 1})`, `${tributes[i]}`);
		}

		return events;
	}

	eventTrigger(tributes, kills, eventsArray, deaths, results) {
		const turn = new Set(tributes);

		for (const tribute of tributes) {
			if (!turn.has(tribute)) continue;
			const validEvent = eventsArray.filter(event => event.tributes <= turn.size && event.deaths < turn.size);
			const randomEvent = validEvent[Math.floor(Math.random() * validEvent.length)];

			turn.delete(tribute);

			if (randomEvent.tributes === 1) {
				if (randomEvent.deaths.length === 1) {
					deaths.push(tribute);
					tribute.alive = false;
					tribute.killed = tribute.id;
				}

				results.push(this.eventParser(randomEvent.text, [tribute]));
			} else {
				const indexOfCurrentTribute = [tribute];

				if (randomEvent.killers.includes(1)) {
					tribute.killed.push(indexOfCurrentTribute[0].id);
				}

				if (randomEvent.deaths.includes(1)) {
					deaths.push(tribute);
					tribute.alive = false;
				}

				for (let i = 2; i <= randomEvent.tributes; i++) {
					const turnArray = Array.from(turn);
					const currentTribute = turnArray[Math.floor(Math.random() * turnArray.length)];

					if (randomEvent.killers.includes(i)) {
						kills[currentTribute] += randomEvent.deaths.length;
					}

					if (randomEvent.deaths.includes(i)) {
						deaths.push(currentTribute);
						currentTribute.alive = false;
					}

					indexOfCurrentTribute.push(currentTribute);
					turn.delete(currentTribute);
				}

				results.push(this.eventParser(randomEvent.text, indexOfCurrentTribute.map(trib => trib)));
			}
		}
	}

	async populateCanvas(tributeArray, eventText) {
		const widthGaps = tributeArray.length < 6 ? tributeArray.length : 6;

		const avatarPaddingX = avatarMarginX * 2;
		const avatarPaddingY = (avatarMarginY * 2) - 100;

		const canvasWidth = avatarPaddingX + (avatarSize * widthGaps) + (avatarHorizontalSpacing * (widthGaps - 1));
		const canvasHeight = avatarPaddingY + (avatarSize * Math.ceil(tributeArray.length / 6)) + (avatarVerticalSpacing * (Math.ceil(tributeArray.length / 6) - 1));

		const canvas = createCanvas(canvasWidth, canvasHeight);
		const ctx = canvas.getContext('2d');

		this.drawCanvas(ctx);
		this.drawHeaderText(ctx, eventText);
		await this.drawStatusImage(ctx, tributeArray);

		return canvas;
	}

	drawCanvas(ctx) {
		ctx.fillStyle = '#5d5050';
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	}

	drawHeaderText(ctx, eventText, resultsText) {
		if (!eventText) eventText = 'The Reaping';

		const text = ['The Hunger Games', eventText];

		if (resultsText) text.push(resultsText);

		ctx.textBaseline = 'top';
		ctx.font = '35px arial';
		ctx.textAlign = 'center';

		let textPaddingY = 30;
		const ySizing = 45;

		for (let i = 0; i < text.length; i++) {
			const textMeasure = ctx.measureText(text[i]);
			const textCenterAlignment = (ctx.canvas.width / 2) - textMeasure.actualBoundingBoxLeft - 5;
			const textWidth = textMeasure.width + 10;

			ctx.fillStyle = '#232323';
			ctx.fillRect(textCenterAlignment, textPaddingY, textWidth, ySizing);

			ctx.strokeStyle = '#ffffff';
			ctx.strokeRect(textCenterAlignment, textPaddingY, textWidth, ySizing);

			ctx.fillStyle = '#e4ae24';
			ctx.fillText(text[i], ctx.canvas.width / 2, textPaddingY);
			textPaddingY += 70;
		}
	}

	drawDistrictText(ctx, tributeArray) {
		const textMarginX = (avatarMarginX + avatarSize) + (avatarHorizontalSpacing / 2);
		const textSpacingX = (avatarSize * 2) + (avatarHorizontalSpacing * 2);

		const textMarginY = avatarMarginY - 10;
		const textSpacingY = avatarSize + avatarVerticalSpacing;

		let textDestinationX = textMarginX;
		let textDestinationY = textMarginY;

		ctx.font = 'bold 28px arial';
		ctx.textBaseline = 'alphabetic';
		ctx.fillStyle = '#ffffff';

		for (let i = 0; i < Math.round(tributeArray.length / 2); i++) {
			ctx.fillText(`District ${i + 1}`, textDestinationX, textDestinationY);

			textDestinationX += textSpacingX;

			if ((i + 1) % 3 === 0) {
				textDestinationX = textMarginX;
				textDestinationY += textSpacingY;
			}
		}
	}

	drawAliveText(ctx, tributeArray) {
		const aliveHexCode = '#70ec25';
		const deceasedHexCode = '#fa6666';

		const textMarginX = avatarMarginX + (avatarSize / 2);
		const textSpacingX = avatarSize + avatarHorizontalSpacing;

		const textMarginY = avatarSize + avatarMarginY + 40;
		const textSpacingY = avatarVerticalSpacing + avatarSize;

		let textDestinationX = textMarginX;
		let textDestinationY = textMarginY;

		ctx.font = '25px arial';

		for (let i = 0; i < tributeArray.length; i++) {
			const { alive } = tributeArray[i];
			ctx.fillStyle = alive ? aliveHexCode : deceasedHexCode;
			ctx.fillText(alive ? 'Alive' : 'Deceased', textDestinationX, textDestinationY);

			textDestinationX += textSpacingX;

			if ((i + 1) % 6 === 0) {
				textDestinationX = textMarginX;
				textDestinationY += textSpacingY;
			}
		}
	}

	async drawStatusImage(ctx, tributeArray) {
		let avatarDestinationX = avatarMarginX;
		let avatarDestinationY = avatarMarginY;
		ctx.strokeStyle = '#000000';

		const userAvatarMap = new Map();

		for (let i = 0; i < tributeArray.length; i++) {
			userAvatarMap.set(tributeArray[i].id, loadImage(tributeArray[i].displayAvatarURL({ format: 'png' })));
		}

		await Promise.all(userAvatarMap.values()).then(async () => {
			for (let i = 0; i < tributeArray.length; i++) {
				ctx.drawImage(await userAvatarMap.get(tributeArray[i].id), avatarDestinationX, avatarDestinationY, avatarSize, avatarSize);
				const image = ctx.getImageData(avatarDestinationX, avatarDestinationY, avatarSize, avatarSize);
				const { data } = image;

				if (tributeArray[i].alive === false) {
					for (i = 0; i < data.length; i += 4) {
						// var brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];

						// data[i] = brightness;
						// data[i + 1] = brightness;
						// data[i + 2] = brightness;
					}

					ctx.putImageData(image, avatarDestinationX, avatarDestinationY);
				}

				ctx.strokeRect(avatarDestinationX, avatarDestinationY, avatarSize, avatarSize);

				avatarDestinationX += avatarHorizontalSpacing + avatarSize;

				if ((i + 1) % 6 === 0) {
					avatarDestinationX = 50;
					avatarDestinationY += avatarSize + avatarVerticalSpacing;
				}
			}
		});

		this.drawDistrictText(ctx, tributeArray);
		this.drawAliveText(ctx, tributeArray);
	}

	arrayOfTributesLeft(tributeArray) {
		return tributeArray.filter(tribute => tribute.alive === true);
	}

	async generateEventImages(eventText, resultsText, tributeArray) {
		let matchedTributeIds = resultsText.match(/\d+/g);
		matchedTributeIds = [...new Set(matchedTributeIds)];

		const tributeObjs = [];

		for (let i = 0; i < matchedTributeIds.length; i++) {
			const tribObj = tributeArray.filter(obj => obj.id === matchedTributeIds[i]);
			tributeObjs.push(tribObj[0]);
		}

		const baseCanvasWidth = 1000;
		const canvasHeight = (avatarMarginY * 2) + avatarHorizontalSpacing;
		const canvas = createCanvas(baseCanvasWidth, canvasHeight);
		const ctx = canvas.getContext('2d');

		ctx.font = '35px arial';

		for (let i = 0; i < tributeObjs.length; i++) {
			resultsText = resultsText.split(`<@${matchedTributeIds[i]}>`).join(tributeObjs[i].username);
		}

		const textSize = ctx.measureText(resultsText);

		if (textSize.width > baseCanvasWidth) ctx.canvas.width = textSize.width + (avatarMarginX * 2);

		this.drawCanvas(ctx);
		this.drawHeaderText(ctx, eventText, resultsText);

		const canvasCenter = (ctx.canvas.width / 2) - (avatarSize / 2);
		const avatarYPosition = avatarMarginY + 50;
		ctx.strokeStyle = '#000000';

		let avatarXPosition = canvasCenter - ((avatarMarginX * 2) * (tributeObjs.length - 1));

		for (let i = 0; i < tributeObjs.length; i++) {
			const tributeImage = await loadImage(tributeObjs[i].displayAvatarURL({ format: 'png' }));
			ctx.drawImage(tributeImage, avatarXPosition, avatarYPosition, avatarSize, avatarSize);
			ctx.strokeRect(avatarXPosition, avatarYPosition, avatarSize, avatarSize);

			avatarXPosition += avatarMarginX + avatarSize;
		}

		return canvas;
	}

};
