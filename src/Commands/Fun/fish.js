const { MessageEmbed } = require('discord.js');
const fishJSON = require('../../../assets/jsons/fishList');
const Command = require('../../Structures/Command');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Provides a link to invite the bot to your guild',
			category: 'Fun'
		});
	}

	async run(message) {
		const emoji = {
			ocean: ':ocean:',
			ship: ':sailboat:',
			clouds: [' :cloud_snow:', ':cloud:', ':cloud_lightning:', ':cloud_rain:', ':thunder_cloud_rain:'],
			anchor: ':anchor:',
			sun: ':sunny:',
			fishArray: fishJSON
		};

		const worldWidth = 8;
		const worldHeight = 9;
		const skyHeight = 3;
		const world = [];
		const emptySpace = '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0';
		// const getRandomCloud =

		// White Space Generation
		for (let i = 0; i < worldHeight; i++) {
			const worldRow = [];
			for (let j = 0; j < worldWidth; j++) {
				worldRow[j] = emptySpace;

				if (j === 0) {
					worldRow[j] += '\u00a0\u00a0';
				}
				world[i] = worldRow;
			}
		}

		// Cloud Generation
		const cloudIndex = this.client.utils.randomRange(0, emoji.clouds.length - 1);

		for (let i = 0; i < skyHeight; i++) {
			let prevCloud = false;
			for (let j = 0; j < worldWidth; j++) {
				const isCloud = this.client.utils.randomRange(1, 100) <= 21;

				if (isCloud && !prevCloud) {
					world[i][j] = emoji.clouds[cloudIndex];
				}

				prevCloud = isCloud;
			}
		}

		// Surface Generation
		let oceanAndShipArray = [
			...Array(worldWidth - 1).fill(emoji.ocean),
			...Array(1).fill(emoji.ship)
		];

		oceanAndShipArray = this.client.utils.shuffle(oceanAndShipArray);
		world[skyHeight + 1] = oceanAndShipArray;

		// Line And Anchor Generation
		const indexOfShip = oceanAndShipArray.indexOf(emoji.ship);
		const lineHeight = this.client.utils.randomRange(2, worldHeight - skyHeight - 2);

		// Generating Line Height
		for (let i = skyHeight + 2; i < skyHeight + lineHeight + 1; i++) {
			world[i][indexOfShip] = '\u00A0\u00A0\u00A0|\u00A0\u00A0';
		}
		// Generating Anchor Height
		world[skyHeight + lineHeight + 1][indexOfShip] = emoji.anchor;


		// Generating Fish
		for (let i = 0; i < 10; i++) {
			const fishIndex = this.client.utils.randomRange(1, Object.keys(fishJSON).length - 1);
			console.log(fishIndex);
			console.log(fishJSON[fishIndex]);
		}
		let str = '';

		for (let i = 0; i < worldHeight; i++) {
			const worldRow = world[i];
			str += `${worldRow.join('')}\n`;
		}


		const fishingEmbed = new MessageEmbed()
			.setDescription(`_ _${str}\n_ _`)
			.setColor(this.client.embed.color.oceanBlue);
		return message.channel.send({ embeds: [fishingEmbed] });
	}

};
