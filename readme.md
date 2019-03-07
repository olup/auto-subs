# Auto Subs

A tiny cli tool to download subs from any folder

`npm install -g https://github.com/requeijaum/auto-subs.git`

Then, in the folder where is the video file : 

`auto-subs`

## Options

`-f <filename>` to specify a video file for wich you need the subs. If not specified, the cli tool lets you choose between all video files present in folders.

`-l <language>` to specify the language you need in two letters (`en`, `fr` etc..) If not specified, the cli lets you choose between all languages available.

In any case, if multiple subs are available, the cli lets you choose.


## Tips

- the tool uses HTTP with no SSL for quick downloading
- you have a limit for downloading subs (per user IP)
	> so if you are an OpenSubtitles VIP user: you can set your username and password (hashed) to bypass the limit

## Contributions

- Thanks @olup and @mifi for the tool!
- Fixed in March 2019 by @requeijaum