# Connect Four

Small fun project for our “Client-Side Web Engineering” lecture at the FH Salzburg.

## How to deploy?

Either execute `make` or `npm update && bower update && grunt`. That’s all, really! Just load the generated
`index.html` in your browser and you’re able to play “Connect Four”.

## How to play?

Our “Connect Four” is turn based and especially designed for offline usage. It should work on any device and any modern
web browser (we tested it with Firefox, Chrome, and Internet Explorer 9+).

## How to configure?

Have a look at the `config.json` and `main.less` files in the `src` directory. You can easily change from connect four to
e.g. connect eight or sixteen (lol). Be aware that we currently only support a square playboard, although the changes to
the code would be minor to support rectangles. Be very careful if you change dimensions as some SVGs (especially the
playboard) are special and depend on the defined dimensions.

## Possible Features

* Allow to resume a previously ended game via session storage.
* Store statistics in session storage if supported.
* Add button to clear statistics (clear session storage).
* Configurable playboard size, also allow non-square playboard.
