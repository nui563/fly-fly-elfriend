window.onload = () => {
    const game = new Game(new Assets());
    game.assets.load(game).then(game.start());

    function loadAudio(url, loop, done) {
        fetch(url, {'mode': 'no-cors'})
          .then(response => response.arrayBuffer())
          .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
          .then(audioBuffer => {
            console.log('audio ' + url + ' loaded')
            var sourceNode = context.createBufferSource()
            sourceNode.buffer = audioBuffer
            done(null, sourceNode)
            sourceNode.start()
            sourceNode.loop = loop
          })
      }
      loadAudio('https://files.catbox.moe/rogbbw.mp3');
}