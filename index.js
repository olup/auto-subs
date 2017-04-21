#! /usr/bin/env node

const fs = require("fs")
const path = require("path")
const OS = require("opensubtitles-api")
const program = require('commander');
const chalk = require('chalk');
const http = require('http');
const inquirer = require("inquirer")

const openSubtitles = new OS({
    useragent:'OSTestUserAgentTemp'
});



program
  .version('0.0.1')
  .option('-f, --file [value]', 'File name')
  .option('-l, --lang [value]', 'Subtitles languages', 'en')
  .parse(process.argv);

var fileName = ""
var lang = program.lang

if (program.file) {
    fileName = program.file
    findSubs(fileName, lang)
}
else findFile( findSubs )




function findSubs(fileName, lang){

    if(!fileName) return console.log('No file given or found')

    console.log(`Loading subtitles for ${chalk.green(fileName)} in language ${chalk.green(lang.toUpperCase())}`)


    openSubtitles.login().then(()=>{
        openSubtitles.search({
            sublanguageid: lang,
            path: fileName,
            filename: fileName,
            limit : 5
        }).then((subs)=>{
            if(!subs[lang] || !subs[lang].length) return console.log('No subtitles available for desired language')

            inquirer.prompt({
                type : "list",
                name :"choice",
                message : `There is ${subs[lang].length} options. Wich one do you choose ?`,
                choices : subs[lang].map((it,idx)=>{ return {name : it.filename, value : idx}})
            }).then( ({choice}) => {
                var sub = subs[lang][choice]

                var srtName = fileName.replace(/\.[^/.]+$/, "")+".srt"

                var file = fs.createWriteStream(srtName);
                var request = http.get(sub.url, (response) => {
                    console.log(`Downloaded ${chalk.green(srtName)}`)
                    response.pipe(file);
                });
            });

        })
    }).catch(err => {
            console.log('Unable to contact API');
    });
}


function findFile( cb ){
    files = fs.readdirSync("./").filter(function (file) {
        return fs.statSync(file).isFile() && file.match(/.*(\.mp4|\.avi|\.mpeg2|\.mkv)/g)
    })

    inquirer.prompt({
            type : "list",
            name :"choice",
            message : `There is multiple video files in the folder - wich one do you choose ?`,
            choices : files.map((it,idx)=>{ return {name : it, value : idx}})
        }).then( ({choice}) => {
            cb(files[choice], lang)
        });

}
