const { MessageEmbed } = require('discord.js');
const { createCanvas } = require('node-canvas');
const Command = require('../../Structures/Command');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Provides the total number of members in the server.',
			category: 'Utility',
			guildOnly: true
		});
	}

	async run(message) {
		const memberCache = await message.guild.members.fetch({ withPresences: true });
		const statusData = await this.fetchStatusData(message);

		const canvas = createCanvas(700, 400);
		const ctx = canvas.getContext('2d');
		const totalMembers = memberCache.size;

		this.createRect(ctx);
		this.createPiChart(ctx, canvas, statusData, totalMembers);
		this.createStatusOverlay(ctx, statusData, totalMembers);

		const memberCountEmbed = new MessageEmbed()
			.setAuthor(`${message.guild.name} Member Count`, message.guild.iconURL())
			.setImage('attachment://userChart.png')
			.addField(`Total Members`, `${totalMembers} members`, true)
			.addField(`Total Humans`, `${memberCache.filter(member => !member.user.bot).size} Humans`, true)
			.addField(`Total Bots`, `${memberCache.filter(member => member.user.bot).size} Bots`, true)
			.setColor(this.client.embed.color.default);
		return message.channel.send({ embeds: [memberCountEmbed], files: [{ attachment: canvas.toBuffer(), name: 'userChart.png' }] });
	}

	async fetchStatusData(message) {
		const statusData = [
			{ status: 'Online', amount: 0, color: '#62ce74' },
			{ status: 'Idle', amount: 0, color: '#ebc83d' },
			{ status: 'DND', amount: 0, color: '#F04747' },
			{ status: 'Streaming', amount: 0, color: '#b06dad' },
			{ status: 'Offline', amount: 0, color: '#5d5d5d' }
		];


		await message.guild.members.fetch({ withPresences: true }).then(userList => {
			userList.forEach(user => {
				const userStatus = user.presence ? user.presence.status : 'offline';
				const statusObject = statusData.find(val => val.status.toLowerCase() === userStatus);
				statusObject.amount += 1;
			});
		});

		return statusData;
	}

	createRect(ctx) {
		const rectXPos = 340;
		const rectYPos = 110;
		const rectHeight = 170;
		const rectWidth = 250;

		ctx.beginPath();
		ctx.lineWidth = '3';
		ctx.strokeStyle = '#7b8085';
		ctx.rect(rectXPos, rectYPos, rectWidth, rectHeight);
		ctx.fillStyle = '#1c2229';
		ctx.fillRect(rectXPos, rectYPos, rectWidth, rectHeight);
		ctx.stroke();
		ctx.closePath();
	}

	createPiChart(ctx, canvas, statusData, totalMembers) {
		let startAngle = 0;
		const radius = 100;
		const cx = canvas.width / 4;
		const cy = canvas.height / 2;

		for (let i = 0; i < statusData.length; i++) {
			if (statusData[i].amount > 0) {
				ctx.fillStyle = statusData[i].color;
				ctx.lineWidth = 1;
				ctx.strokeStyle = '#1c2229';
				ctx.beginPath();

				const endAngle = ((statusData[i].amount / totalMembers) * Math.PI * 2) + startAngle;

				ctx.moveTo(cx, cy);
				ctx.arc(cx, cy, radius, startAngle, endAngle, false);
				ctx.lineTo(cx, cy);
				ctx.fill();
				ctx.stroke();
				ctx.closePath();

				ctx.beginPath();
				ctx.font = '18px sans-serif';
				ctx.textAlign = 'center';
				ctx.fillStyle = 'white';

				const theta = (startAngle + endAngle) / 2;
				const deltaY = Math.sin(theta) * 1.3 * radius;
				const deltaX = Math.cos(theta) * 1.5 * radius;
				ctx.fillText(`${(100 * statusData[i].amount / totalMembers).toFixed(2)}%`, deltaX + cx, deltaY + cy);
				ctx.closePath();


				startAngle = endAngle;
			}
		}

		this.createDoughnutChart(ctx, cx, cy);
	}

	createStatusOverlay(ctx, statusData, totalMembers) {
		const statusBoxHeight = 18;
		const statusBoxWidth = 18;
		const statusBoxX = 350;
		let statusBoxY = 125;

		for (let i = 0; i < statusData.length; i++) {
			ctx.fillStyle = statusData[i].color;
			ctx.beginPath();
			ctx.fillRect(statusBoxX, statusBoxY, statusBoxHeight, statusBoxWidth);
			ctx.rect(statusBoxX, statusBoxY, statusBoxHeight, statusBoxWidth);
			ctx.closePath();

			const { status, amount } = statusData[i];
			ctx.textAlign = 'start';

			ctx.fillText(`${status} - ${amount} (${(100 * amount / totalMembers).toFixed(2)}%)`, statusBoxX + 30, statusBoxY + 15);
			statusBoxY += 30;
		}
	}

	createDoughnutChart(ctx, centerX, centerY) {
		ctx.beginPath();
		ctx.moveTo(centerX, centerY);
		ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
		ctx.fillStyle = '#1c2229';
		ctx.fill();
		ctx.closePath();
	}

};
