const { MessageEmbed } = require('discord.js');
const { createCanvas, loadImage, registerFont } = require('node-canvas');
const rankcardsJSON = require('../../../assets/jsons/rankcards.json');
registerFont('assets/fonts/Grold-Regular.ttf', { family: 'Grold Regular' });
const Command = require('../../Structures/Command');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Provides the rank of a specified user.',
			category: 'Leveling',
			usage: '(userId), rank (@user)'
		});
	}

	async run(message, args) {
		const target = await this.client.utils.getMember(message, args.join(' '), true);

		const canvasWidth = 934;
		const canvasHeight = 282;

		const canvas = createCanvas(canvasWidth, canvasHeight);
		const ctx = canvas.getContext('2d');

		const { level, xp } = await this.client.database.fetchUser(target.id, message.guild.id);
		const guildRank = await this.client.level.fetchRank(target.id, message.guild.id);
		const neededXP = await this.client.level.xpFor(parseInt(level) + 1);
		const rankcard = rankcardsJSON.ameliaCard1;

		await this.createCanvasBackground(ctx, rankcard);
		this.drawRankAndLevelGfx(ctx, level, guildRank, rankcard);
		this.drawUsername(ctx, target);
		this.drawProgress(ctx, neededXP, xp, rankcard);
		await this.drawAvatar(ctx, target, rankcard);

		const rankcardEmbed = new MessageEmbed()
			.setImage('attachment://rankCard.png')
			.setColor(rankcard.embedColor);
		message.channel.send({ embeds: [rankcardEmbed], files: [{ attachment: canvas.toBuffer(), name: 'rankCard.png' }] });
	}

	async createCanvasBackground(ctx, rankcard) {
		const rankCardBackground = await loadImage(rankcard.backgroundURL);
		ctx.drawImage(rankCardBackground, 0, 0, ctx.canvas.width, ctx.canvas.height);
	}

	async drawRankAndLevelGfx(ctx, level, rank, rankcard) {
		ctx.font = '38px "Grold Regular"';
		const textYPosition = 16;
		const text = [`RANK ${rank}`, `LEVEL ${level}`];
		let textXPosition = 500;

		for (let i = 0; i < text.length; i++) {
			const metrics = ctx.measureText(text[i]);
			const textWidth = metrics.width + metrics.actualBoundingBoxAscent;

			const barXPosition = textXPosition;
			const barYPosition = textYPosition;
			const barWidth = textWidth;
			const barHeight = 50;

			this.client.canvas.drawBar(ctx, barHeight, barWidth, barXPosition, barYPosition, rankcard.rankAndLevelBars);
			this.client.canvas.addStroke(ctx, rankcard.strokeColor, 5);

			ctx.fillStyle = 'white';
			ctx.fillText(text[i], textXPosition + 10, (textYPosition * 3) + 5);
			textXPosition += metrics.width + (metrics.actualBoundingBoxAscent * 3);
		}
	}

	drawUsername(ctx, member) {
		ctx.fillStyle = 'white';
		ctx.font = '45px "Grold Regular"';
		const name = member.username.length > 9 ? `${member.username.substring(0, 10)}...` : member.username;
		ctx.fillText(`${name}#${member.discriminator}`, ctx.canvas.width / 4.1, ctx.canvas.height / 1.3);
	}

	drawProgress(ctx, currentXp, neededXp, rankcard) {
		const totalXp = currentXp + neededXp;
		const xpPercentage = Math.floor((currentXp / totalXp) * 100);

		const barHeight = 40;
		const barWidth = 480;
		const barWidth2 = barWidth * xpPercentage / 100;
		const barXPosition = 200;
		const barYPosition = 230;

		this.client.canvas.drawBar(ctx, barHeight, barWidth, barXPosition, barYPosition, rankcard.bottomBar);
		this.client.canvas.drawBar(ctx, barHeight, barWidth2, barXPosition, barYPosition, rankcard.topBar);

		ctx.fillStyle = 'white';
		ctx.font = '25px Grold Regular';
		ctx.fillText(`${this.client.utils.abbreviateNumber(currentXp)}/${this.client.utils.abbreviateNumber(totalXp)}`, 580, 220);
	}

	async drawAvatar(ctx, target, rankCard) {
		const xPosition = 125;
		const yPosition = 125;
		const radius = 100;
		const startAngle = 0;
		const endAngle = Math.PI * 2;

		ctx.beginPath();
		ctx.arc(xPosition, yPosition, radius, startAngle, endAngle);
		ctx.fillStyle = rankCard.profileBackdrop;
		ctx.fill();

		ctx.clip();
		const avatar = await loadImage(target.displayAvatarURL({ format: 'png' }));
		ctx.drawImage(avatar, xPosition - radius, yPosition - radius, radius * 2, radius * 2);

		ctx.lineWidth = 8;
		ctx.stroke();
		ctx.closePath();
	}

};
