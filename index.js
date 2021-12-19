require('dotenv').config();

// Required
const { Client, Intents } = require('discord.js');

// Variable
const bot = new Client({
    intents: [
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
});

const prefix = '!';

// Cache
const Votes = [];
const votedUsers = [];

// Components
const Vote = require('./components/vote');
const Emit = require('./components/emit');

// Events
bot.on('messageCreate', async message => {
    if (message.author.bot) { return; }
    if (message.channel.type == 'dm') { return; }
    if (!message.content.startsWith(prefix)) { return; }

    // Thanks Stackoverflow.
    let args = message.content.trim().split(/ +/g);
    let cmd = args[0].slice(prefix.length);
    
    if (cmd == 'createVote') {
        let voteInfo = args[1];
        let voteExpire = args[2];

        if (!voteInfo) { return message.reply('Vote info missing..'); }
        if (voteInfo.length > 50) { return message.reply('Info character must less than 50'); }

        if (!voteExpire) { return message.reply('Vote expire missing..'); }
        if (voteExpire.length > 5) { return message.reply('Invalid expire date.'); }

        if (Votes[message.author.id]) { return message.reply('Close current vote to create.'); }

        let vote = new Vote();
        vote.createVote(bot, message.author, voteInfo, voteExpire, message.channelId);

        Votes[message.author.id] = vote;

        message.reply(`Dev: Vote created (Info: ${vote.info}, Author: ${vote.author.username}, Expire: ${vote.expire})`);
        console.log(`Dev: Vote created (Info: ${vote.info}, Author: ${vote.author.username}, Expire: ${vote.expire})`);
    } else if (cmd == 'startVote') {
        let vote = Votes[message.author.id];
        if (!vote) { return message.reply('No available vote to start.'); }
        if (vote.isStarted) { return message.reply('Vote has already started.'); }
        if (vote.choices.length <= 1) { return message.reply('Choice is less.'); }

        vote.startVote();
    } else if (cmd == 'removeVote') {
        let vote = Votes[message.author.id];
        if (!vote) { return message.reply('No available vote to remove.'); }

        delete Votes[message.author.id];
    } else if (cmd == 'addChoice') {
        let vote = Votes[message.author.id];
        if (!vote) { return message.reply('No available vote to add.'); }
        if (vote.isStarted) { return message.reply('Vote is currently started.'); }

        let choice = args[1];
        if (!choice) { return message.reply('Choice missing..'); }

        let result = await vote.addChoice(choice);
        if (!result.ok) { return message.reply(result.message); }
        
        message.reply('Choice added.');
    } else if (cmd == 'clearChoice') {
        let vote = Votes[message.author.id];
        if (!vote) { return message.reply('No available vote to add.'); }
        if (vote.isStarted) { return message.reply('Vote is currently started.'); }

        vote.clearChoice();
        message.reply('Choice cleared.');
    }
});

bot.on('ready', () => {
    console.log('Bot: Bot is ready');
});

bot.on('messageReactionAdd', async (reaction, user) => {
    let authorId = reaction.message.author.id;
    if (authorId === user.id) { return; }

    let targetVote = Object.values(Votes).find(vote => vote.discord.voteMessage.id === reaction.message.id);
    if (!targetVote) { return; }

    let result = await targetVote.setVoteCount(reaction.emoji.name, reaction.count);
    if (!result.ok) { return message.reply(result.message); }

    //TODO - User must vote just 1 choice.
});

Emit.Register('vote-expired', voteId => {
    if (!Votes[voteId]) { return console.log(`Vote Expired: Vote not found (Vote-Author: ${voteId})`); }
    delete Votes[voteId];
});

bot.login(process.env.BOT_TOKEN);