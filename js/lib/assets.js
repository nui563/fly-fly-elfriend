class Assets {
    imgList = new Object;
    imgData = [
        'floor',
        'bush',
        'city',
        'sky',

        'elfriend',
        'ribbon',

        'tap',
        'crown',
        'title',
        'digit_small',
        'digit_large',
        'credit',
        'gameover',
        'result',
        'buttons',
        'new',
        'medal',
        'warning',
        'carrot',
        'heart',
        'bullet',
        'marine',
        'shield',

        'vfx_rapid_fire',
        'vfx_explosion',
        // 'vfx_explosion_blue',
        'vfx_stun',
        'vfx_impact',
        'vfx_ray_1',
        'vfx_ray_2',
        'vfx_ray_3',
        'vfx_ray_4',
        // 'vfx_confettis',
        'vfx_smoke_white',
        'vfx_sparkle_white',
        // 'vfx_sparkle_blue',
        // 'vfx_sparkle_fire'
    ];

    sfxList = new Object;
    sfxData = [
        'sfx_die',
        'sfx_hit',
        'sfx_point',
        'sfx_swooshing',
        'sfx_wing',
        'sfx_explosion'
    ];
    
    bgmList = new Object;
    bgmData = [
        // {
        //     id: "elite_moonlight_scuffle",
        //     loopStart: 6.483
        // }
    ];
    
    constructor() {
        this.imgData.forEach(id => {
            this.imgList[id] = new Image;
            this.imgList[id].src = `img/${id}.png`;
        });
    }

    load = game => new Promise(resolve => this.loadImages().then(() => this.loadAudio(game).then(() => resolve())));

    loadAudio = game => Promise.all([
        ...this.bgmData.map((id, loopStart) => {
            return new Promise(resolve => {
                fetch(`bgm/${id}.wav`).then(res => res.arrayBuffer()).then(buffer => {
                    game.audio.ctx.decodeAudioData(buffer, decodedData => {
                        this.bgmList[id] = {
                            buffer: decodedData,
                            loopStart: loopStart
                        }
                        resolve();
                    });
                });
            });
        }),
        ...this.sfxData.map(id => {
            return new Promise(resolve => {
                fetch(`sfx/${id}.wav`).then(res => res.arrayBuffer()).then(buffer => {
                    game.audio.ctx.decodeAudioData(buffer, decodedData => {
                        this.sfxList[id] = { buffer: decodedData };
                        resolve();
                    });
                });
            });
        })
    ]);

    loadImages = () => Promise.all([...Object.keys(this.imgList).map(id => new Promise(resolve => this.imgList[id].onload = () => resolve()))]);
}