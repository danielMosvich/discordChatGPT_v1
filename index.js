const {Client, Events, GatewayIntentBits} = require('discord.js')
require("dotenv/config")
const {OpenAIApi, Configuration} = require('openai')

const config = new Configuration({
    apiKey:process.env.OPENAI_KEY
})
const openai = new OpenAIApi(config)


const client = new Client({
    intents:[
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
})

client.once(Events.ClientReady,(clientUser) =>{
    console.log(`Logged in as ${clientUser.user.tag}`)
})

const BOT_CHANNEL = "1075530096452046938"
const PAST_MESSAGES = 5


client.login(process.env.BOT_TOKEN)
client.on(Events.MessageCreate, async(message)=>{
    if(message.author.bot) return
    if(message.channel.id !== BOT_CHANNEL) return
    
    message.channel.sendTyping()
    let messages = Array.from(await message.channel.messages.fetch({
        limit:PAST_MESSAGES,
        before:message.id
    }))
    messages = messages.map(m => m[1])
    messages.unshift(message)

    let users = [...new Set([...messages.map(m => m.member.displayName), client.user.username])]

    let lastUser = users.pop()
    let prompt = `the following is a conversation between ${users.join(", ")} and ${lastUser}, treating them like sons. \n\n`

    for(let i = messages.length - 1; i >= 0; i--){
        const m = messages[i]
        prompt += `${m.member.displayName}: ${m.content}\n`
    }
    prompt += `${client.user.username}:`
    console.log("prompt:", prompt)

    const response = await openai.createCompletion({
        prompt,
        model:"text-davinci-003",
        max_tokens:500,
        stop:["\n"]

    })
    console.log("response:", response.data.choices[0].text)
    await message.channel.send(response.data.choices[0].text)
})

// https://discord.com/api/oauth2/authorize?client_id=1075527517487763537&permissions=8&scope=bot