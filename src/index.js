const dotenv = require('dotenv');
const Discord = require('discord.js');
const mjAPI = require('mathjax-node-svg2png');
const toFile = require('data-uri-to-file');
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
});

client.on('message', msg => {
  let msgLength = msg.content.length;
  let channel = msg.channel;
  if (msg.content.indexOf('```math') !== -1) {
    if (msg.content.indexOf('```', 7) !== -1) {
      let content = String.raw`\bbox[white, 10px]{${msg.content.substring(7, msg.content.indexOf('```', 7))}}`;
    
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
            tex: {packages: {'[+]': ['bbox']}}
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
});

client.login(process.env.TOKEN);