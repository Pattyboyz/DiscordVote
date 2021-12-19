// Components
const Emit = require('./emit');

// Variable
const icons = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣'];

// Class
class Vote {
    constructor() {
        this.isStarted = false;

        this.author = null;
        this.info = null;
        this.expire = null;
        this.choices = [];
        this.voteState = [];

        this.discord = {
            bot: null,
            channelId: null,
            voteMessage: null
        };
    }

    createVote(bot, author, info, expire, channelId) {
        this.author = author;
        this.info = info;
        this.expire = expire;
        this.discord.bot = bot;
        this.discord.channelId = channelId;
    }

    startVote() {
        this.isStarted = true;

        let choices = [];
        for (let i in this.choices) {
            this.voteState.push({ choice: this.choices[i], count: 0, icon: icons[i], voters: [] });
            choices.push(`${icons[i]} ${this.choices[i]} - 0 vote(s)`);
        }

        this.discord.bot.channels.cache.get(this.discord.channelId).send({
            embeds: [{
                author: { name: `${this.author.username}'s vote` },
                fields: [
                    { name: 'Vote Info', value: this.info, inline: true },
                    { name: 'Expire In', value: this.expire, inline: true },
                    { name: 'Choices', value: choices.join('\n') }
                ],
                color: 'BLUE'
            }]
        }).then(message => {
            this.discord.voteMessage = message;

            for (let i in this.choices) {
                message.react(icons[i]);
            }
        });
        
        //TODO - Rewrite new expiration vote more better.
        // let interval = setInterval(() => {
        //     let time = new Date().getTime();
        //     let expireDate = new Date().toISOString().split('T')[0];
        //     let expireTime = new Date(`${expireDate} ${this.expire}`).getTime();

        //     if (time >= expireTime) {
        //         console.log(new Date())
        //         Emit.Trigger('vote-expired', this.author.id);

        //         this.discord.bot.channels.cache.get(this.discord.channelId).send(`Vote "${this.info}" has been expired!`);
        //         console.log(`Vote: Vote "${this.info}" has been expired!`);

        //         clearInterval(interval);
        //     }
        // }, 1000);
    }

    addChoice(choice) {
        return new Promise((resolve) => {
            if (this.choices.length >= icons.length) {
                resolve({ ok: false, message: `Maximum ${icons.length} choices!` });
            }

            this.choices.push(choice);
            resolve({ ok: true });
        });
    }

    clearChoice() {
        this.choices = [];
    }

    setVoteCount(icon, count) {
        return new Promise(resolve => {
            let score = this.voteState.find(choice => choice.icon === icon);
            if (!score) { return resolve({ ok: false, message: 'Failed to find somedata.' }); }

            score.count = (count - 1);

            let choices = [];
            for (let i in this.choices) {
                let score = this.voteState.find(choice => choice.choice === this.choices[i]);

                this.voteState.push({ choice: this.choices[i], count: 0, icon: icons[i] });
                choices.push(`${icons[i]} ${this.choices[i]} - ${score.count} vote(s)`);
            }

            this.discord.voteMessage.edit({
                embeds: [{
                    author: { name: `${this.author.username}'s vote` },
                    fields: [
                        { name: `Vote Info`, value: this.info, inline: true },
                        { name: `Expire In`, value: this.expire, inline: true },
                        { name: `Choices`, value: choices.join('\n') }
                    ],
                    color: 'BLUE'
                }]
            });

            resolve({ ok: true });
        });
    }
}

// Module Exports
module.exports = Vote;