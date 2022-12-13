class AudioManager {
    frameCount = 0;

    ctx = new AudioContext();
    
    bgmFadeOut = false;
    bgmVolume = .25;
    bgmMuted = false;
    bgm = null;

    sfxVolume = .25;
    sfxMuted = false;
    sfxFrame = {};

    constructor(assets) {
        this.bgmList = assets.bgmList;
        this.sfxList = assets.sfxList;
        // this.ctx.suspend();
    }

    pause = () => {
        if (this.ctx.state === 'running') this.ctx.suspend();
    }

    resume = () => {
        if (this.ctx.state === 'suspended') this.ctx.resume();
    }
    
    update = () => {
        if (!(Math.floor(this.frameCount) % 8)) this.sfxFrame = {};
        if (this.bgmFadeOut) {
            this.bgm.gainNode.gain.value -= this.bgmVolume / 32;
            if (this.bgm.gainNode.gain.value <= 0.003) {
                this.bgmFadeOut = false;
                this.stopBGM();
            }
        }
        this.frameCount++;
    }
    
    playSFX = (id, variation) => {
        const sound = this.sfxList[id];
        if (this.sfxFrame[id] || this.sfxMuted || !sound || (sound && !sound.buffer)) return;
        this.sfxFrame[id] = true;
        const source = this.ctx.createBufferSource();
        source.buffer = sound.buffer;
        source.loop = false;
        source.loopStart = 0;
        source.loopEnd = source.buffer.duration;
        if (variation) source.playbackRate.value = 1 + Math.random() * .2 - .1;
        sound.source = source;
        sound.gainNode = this.ctx.createGain();
        source.connect(sound.gainNode);
        sound.gainNode.connect(this.ctx.destination);
        sound.gainNode.gain.value = this.sfxMuted ? 0 : this.sfxVolume;
        
        // if (this.ctx.state === "suspended") this.ctx.resume().then(() => sound.source.start());
        // else sound.source.start();

        if (this.ctx.state !== "suspended") sound.source.start();
    }

    updateBgmVolume = value => {
        this.bgmVolume = value;
        this.bgm.gainNode.gain.value = this.bgmMuted ? 0 : this.bgmVolume;
    }
    
    muteBgm = () => {
        this.bgmMuted = !this.bgmMuted;
        this.bgm.gainNode.gain.value = this.bgmMuted ? 0 : this.bgmVolume;
    }

    playBGM = id => {
        const bgm = this.bgmList[id];
        if (!bgm.buffer) return;
        this.bgm = bgm;
        const source = this.ctx.createBufferSource();
        source.buffer = this.bgm.buffer;
        source.loop = true;
        source.loopStart = this.bgm.loopStart;
        source.loopEnd = source.buffer.duration;
        this.bgm.source = source;
        this.bgm.gainNode = this.ctx.createGain();
        source.connect(this.bgm.gainNode);
        this.bgm.gainNode.connect(this.ctx.destination);

        this.updateBgmVolume(this.bgmVolume);

        // document.getElementById("bgm-volume").onchange = e => {
        //     BGMVOLUME = e.target.value;
        //     this.bgm.updateVolume();
        // }
        // document.getElementById("bgm-volume-icon").onclick = e => {
        //     BGMMUTED = !BGMMUTED;
        //     document.getElementById("bgm-volume-icon").innerHTML = BGMMUTED ? '<img src="./img/icon_volume_off.png">' : '<img src="./img/icon_volume_on.png">';
        //     this.bgm.updateVolume();
        // }

        // if (this.ctx.state === "suspended") this.ctx.resume().then(() => this.bgm.source.start());
        // else this.bgm.source.start();
        
        if (this.ctx.state !== "suspended") this.bgm.source.start();
    }
    
    stopBGM = fadeout => {
        if (!this.bgm) return;
        if (fadeout) {
            this.bgmFadeOut = true;
        } else {
            this.bgm.source.stop();
            this.bgm = null;
            
            // document.getElementById("bgm-volume").onchange = e => {
            //     BGMVOLUME = e.target.value;
            // }
            // document.getElementById("bgm-volume-icon").onclick = e => {
            //     BGMMUTED = !BGMMUTED;
            //     document.getElementById("bgm-volume-icon").innerHTML = BGMMUTED ? '<img src="./img/icon_volume_off.png">' : '<img src="./img/icon_volume_on.png">';
            // }
        }
    }
}