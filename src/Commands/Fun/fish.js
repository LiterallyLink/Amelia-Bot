const { MessageEmbed } = require('discord.js');
const fishJSON = require('../../../assets/jsons/fishList');
const Command = require('../../Structures/Command');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'A neat little fishing game',
			category: 'Fun'
		});
	}

	async run(message) {
		const emoji = {
			ocean: ':ocean:',
			ship: ':sailboat:',
			clouds: [' :cloud_snow:', ':cloud:', ':cloud_lightning:', ':cloud_rain:', ':thunder_cloud_rain:'],
			anchor: ':anchor:',
			sun: ':sunny:'
		};

		const worldWidth = 8;
		const worldHeight = 9;
		const skyHeight = 3;
		let caught = false;
		const world = [];
		const emptySpace = '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0';

		// White Space Generation
		this.generateWhiteSpace(world, worldWidth, worldHeight, emptySpace);

		// Cloud Generation
		this.generateClouds(skyHeight, worldWidth, world, emoji);

		let oceanAndShipArray = [
			...Array(worldWidth - 1).fill(emoji.ocean),
			...Array(1).fill(emoji.ship)
		];

		oceanAndShipArray = this.client.utils.shuffle(oceanAndShipArray);
		const oceanY = skyHeight + 1;
		world[oceanY] = oceanAndShipArray;

		const lineHeight = this.client.utils.randomRange(2, worldHeight - skyHeight - 2);
		const indexOfShip = oceanAndShipArray.indexOf(emoji.ship);

		const allFishes = Object.entries(fishJSON).map((fish) => fish);
		const fishPool = [];

		// Generating the random fish variants
		this.generateFishPool(allFishes, fishPool);

		// while (!caught || fishPool.length === 0) {
		// Generating Line Height
		for (let i = oceanY + 1; i < oceanY + lineHeight; i++) {
			world[i][indexOfShip] = '\u00A0\u00A0\u00A0|\u00A0\u00A0';
		}

		// Generating Anchor Height
		world[oceanY + lineHeight][indexOfShip] = emoji.anchor;

		// Generating Fish

		const forRemoval = [];

		// eslint-disable-next-line id-length
		const minPos = { x: 0, y: oceanY + 1 };
		// eslint-disable-next-line id-length
		const maxPos = { x: oceanAndShipArray.length - 1, y: world.length - 1 };

		for (let i = 0; i < fishPool.length; i++) {
			const fish = fishPool[i];
			for (let j = 0; j < fish.speed; j++) {
				const direction = this.client.utils.randomRange(1, 4);

				switch (direction) {
					case 1:
						fish.xPos += 1;
						break;
					case 2:
						fish.xPos -= 1;
						break;
					case 3:
						fish.yPos += 1;
						break;
					case 4:
						fish.yPos -= 1;
						break;
				}
			}

			if (this.outOfBounds(fish, minPos, maxPos)) {
				forRemoval.push(i);
			}
		}

		let removedFishes = 0;

		for (const fishIndex in forRemoval) {
			fishPool.splice(fishIndex - removedFishes, 1);
			removedFishes++;
		}
		// }

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

	outOfBounds(fish, minPos, maxPos) {
		return fish.xPos < minPos.x || fish.xPos > maxPos.x || fish.yPos < minPos.y || fish.yPos > maxPos.y;
	}

	generateWhiteSpace(world, worldWidth, worldHeight, emptySpace) {
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
	}

	generateClouds(skyHeight, worldWidth, world, emoji) {
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
	}

	generateFishPool(allFishes, fishPool) {
		for (let i = 0; i < 10; i++) {
			const fishyIndex = this.client.utils.randomRange(1, allFishes.length - 1);

			const fishObj = {
				xPos: 1,
				yPos: 1,
				speed: allFishes[fishyIndex][1].speed,
				icon: allFishes[fishyIndex][0]
			};

			fishPool.push(fishObj);
		}
	}

};
