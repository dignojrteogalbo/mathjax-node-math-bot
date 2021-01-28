const dotenv = require('dotenv');
const Discord = require('discord.js');
const mjAPI = require('mathjax-node-svg2png');
const fs = require('file-system');
const md5 = require('md5');

mjAPI.config({
  MathJax: {
    svg: {
      scale: 5
    }
  }
})

mjAPI.start();
dotenv.config();
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setPresence({
    status: 'online',
    activity: {
      name: '@ me for help!',
      type: 'PLAYING',
      url: 'https://github.com/dignojrteogalbo/mathjax-node-math-bot'
    }
  });
});

client.on('message', msg => {
  if (msg.author.bot) return;
  if (msg.content.includes('```math')) {
    handleMath(msg);
  }
  if (msg.mentions.members.first().id === client.user.id) {
    msg.author.send(helpMessage);
  }
});

const helpMessage = new Discord.MessageEmbed()
  .setColor('0x809bff')
  .setTitle('Help')
  .addField('Documentation', '[MathJax](https://www.npmjs.com/package/mathjax-node) is used to render LaTeX code. For documentation on how to write LaTeX equations, [click here](https://en.wikibooks.org/wiki/LaTeX/Mathematics).')
  .addFields(
    { name: 'Syntax', value: 'To render LaTeX code, write syntax in ` ```math {code here}``` ` code blocks with math.' },
    { name: 'Example', value: '` ```math \\int^b_a f(x)dx``` `'}
  )
  .attachFiles('example.png')
  .setImage('attachment://example.png')
  .setFooter('Made by @dingo#9485');

const handleMath = (msg) => {
  let channel = msg.channel;
  let codeBegin = msg.content.indexOf('```math');
  if (codeBegin !== -1) {
    let codeEnd = msg.content.indexOf('```', codeBegin+7);
    if (codeEnd !== -1) {
      let content = String.raw`\bbox[white, 10px]{${msg.content.substring(codeBegin+7, codeEnd)}}`;
      if (fs.existsSync(`${md5(content)}.png`)) {
        channel.send({
          files: [{
            attachment: `${md5(content)}.png`,
            name: `${md5(content)}.png`
          }]
        });
      } else {
        mjAPI.typeset({
          ex: 15,
          math: content,
          format: 'TeX',
          png: true,
          scale: 3,
          MathaJax: {
            tex: { packages: { '[+]': ['bbox'] } }
          }
        }, data => {
          if (!data.errors) {
            let bytes = data.png.replace(/^data:image\/\w+;base64,/, '');
            let buffer = Buffer.from(bytes, 'base64');
            fs.writeFile(`${md5(content)}.png`, buffer);
            channel.send({
              files: [{
                attachment: `${md5(content)}.png`,
                name: `${md5(content)}.png`
              }]
            });
          } else {
            msg.reply(data.errors);
          }
        });
      }
    }
  }
}

client.login(process.env.TOKEN);