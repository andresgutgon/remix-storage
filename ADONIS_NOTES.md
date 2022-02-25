# AdonisJS
I'm going to try find inspiration in the way AdonisJS handle multipart file
uploads.

# TODO
- [] Check on @adonisjs/core how is handled the request.
- [] Register routes on Remix server for serving signed files
- [] Add test and Fake Driver at some point.
- [] Signed route are encripted somehow. Looks how is this done.

Just some notes
- Looks like the always set files uploaded in a form in memory [here: autoProcess: true](https://github.com/adonisjs/core/blob/develop/templates/config/bodyparser.txt#L116) with a [20mb limit](https://github.com/adonisjs/core/blob/develop/templates/config/bodyparser.txt#L195). They also give the option to process files by yourself [handling the stream](https://github.com/adonisjs/core/blob/develop/templates/config/bodyparser.txt#L138)

- This is how they setup server config for file [server upload configuration](https://github.com/adonisjs/core/blob/develop/templates/config/drive.txt) you define your drivers (`local`, `s3`, `gcc`, `azure`,...)
