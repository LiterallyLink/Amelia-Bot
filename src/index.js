/* eslint-disable no-bitwise */
const AmeliaClient = require('./Structures/AmeliaClient');
const { Player } = require('discord-player');
const config = require('../config.json');

const client = new AmeliaClient(config);
client.player = new Player(client, { ytdlOptions: {
	filter: 'audioonly',
	highWaterMark: 1 << 25
} });

process.on('unhandledRejection', (reason, pr) => {
	console.log(' [antiCrash] :: Unhandled Rejection/Catch');
	console.log(reason, pr);
});

process.on('uncaughtException', (err, origin) => {
	console.log(' [antiCrash] :: Uncaught Exception/Catch');
	console.log(err, origin);
});

process.on('uncaughtExceptionMonitor', (err, origin) => {
	console.log(' [antiCrash] :: Uncaught Exception/Catch (MONITOR)');
	console.log(err, origin);
});

process.on('multipleResolves', () => {
	console.log(' [antiCrash] :: Multiple Resolves');
});

client.start();
