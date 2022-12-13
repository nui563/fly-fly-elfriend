window.onload = () => {
    const game = new Game(new Assets());
    game.assets.load(game).then(game.start());
}
