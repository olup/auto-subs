#! /usr/bin/env node

const fs = require("fs")
const path = require("path")
const OS = require("opensubtitles-api")
const program = require('commander');
const chalk = require('chalk');
const http = require('http');
const inquirer = require("inquirer")
const _ = require('lodash');

const openSubtitles = new OS({
    useragent:'TemporaryUserAgent',  //the OS guys periodically change this --> http://trac.opensubtitles.org/projects/opensubtitles/wiki/DevReadFirst#Howtorequestanewuseragent
    ssl: false   //using HTTP for writing the GET directly to the file
});



program
  .version('0.0.1')
  .option('-f, --file [value]', 'File name')
  .option('-l, --lang [value]', 'Subtitles languages')
  .parse(process.argv);

var fileName = program.file
var lang = program.lang

if (fileName) {
    findSubs(fileName, lang)
}
else findFile( findSubs )




function findSubs(fileName, lang){

    if(!fileName) return console.log('No file given or found')

    openSubtitles.login().then( res =>{
        //console.log(res.token);
        //console.log(res.userinfo);

        openSubtitles.search({
            sublanguageid: lang,
            path: fileName,
            filename: fileName,
            limit : 5
        }).then((subs)=>{
            if(!subs || _.isEmpty(subs) ) return console.log('No subtitles available for this video')
            
            //console.log(subs);

            chooseLanguage(subs, lang, language => {
                const langSubs = subs[language];
                if(!langSubs || !langSubs.length) return console.log('No subtitles available for desired language')

                console.log(`Loading subtitles for ${chalk.green(fileName)} in language ${chalk.green(language.toUpperCase())}`)

                //now we debug this to write our desired subtitle file inside the folder :^)

                inquirer.prompt({
                    type : "list",
                    name : "choice",
                    message : `There is ${subs[language].length} options. Which one do you choose ?`,
                    choices : _.sortBy(langSubs, sub => -sub.score).map((it,idx)=>{ return {name : `${it.filename}\t\tScore ${it.score}`, value : idx}})
                }).then( ({choice}) => {
                    var sub = langSubs[choice]

                    var srtName = fileName.replace(/\.[^/.]+$/, "")+".srt"

                    var file = fs.createWriteStream(srtName);
                    var request = http.get(sub.url, (response) => {
                        console.log(`Downloaded ${chalk.green(srtName)}`)
                        response.pipe(file);
                    });
                });
            })

        })
    }).catch( /*err => {
            console.log('Unable to contact API');
    }*/
    console.error);
}


function findFile( cb ){
    files = fs.readdirSync("./").filter(function (file) {
        return fs.statSync(file).isFile() && file.match(/.*(\.mp4|\.avi|\.mpeg2|\.mkv)/g)
    })

    if(!files.length) return console.log(chalk.red('No video file found'))

    inquirer.prompt({
            type : "list",
            name :"choice",
            message : `There is multiple video files in the folder - which one do you choose ?`,
            choices : files.map((it,idx)=>{ return {name : it, value : idx}})
        }).then( ({choice}) => {
            cb(files[choice], lang)
        });

}

function chooseLanguage( languageList, lang, cb ){
    if(lang) return cb(lang)
    else{
        inquirer.prompt({
            type : "list",
            name :"choice",
            default : "en",
            message : `Multiple Languages are available. Which one do you choose ?`,
            choices : Object.keys(languageList).sort().map(it=>{ return {name : it, value : it}})
        }).then( ({choice}) => {
            return cb(choice)
        });
    }

}
