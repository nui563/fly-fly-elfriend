class Scene {
    frameCount = 0;

    particleManager = new ParticleManager();

    startFrameSpeed = 10;
    endFrameSpeed = 10;
    gameOverFrame = 0;

    isStarted = false;
    isGameOver = false;

    score = 0;

    elfriend = new Elfriend();    
    actors = [this.elfriend];

    constructor(game) {
        this.updateViewPos(game);
    }

    playCollisionBox = {
        pos: new Vector2(3.5 * 16, 160),
        size: new Vector2(32, 20),
        func: game => {
            this.nextSceneFrame = this.endFrameSpeed;
            this.nextScene = new Scene(game);
            game.audio.playSFX('sfx_swooshing');
        }
    }
    
    spawnRibbon = game => {
        this.actors.push(new Ribbon(new Vector2(this.elfriend.pos.x + game.width, Math.floor(3 + Math.random() * 8) * 16)));
    }

    spawnEnemies = game => {
        //peko missile
        const yPosArr = [];
        const missileCount = this.score < 25 ? 3 : 4;
        while(yPosArr.length < missileCount){
            const y = Math.floor(2 + Math.random() * 12) * 16;
            if(yPosArr.indexOf(y) === -1) yPosArr.push(y);
        }
        yPosArr.forEach((y, i) => {
            const pos = new Vector2(this.viewPos.x + game.width, y);
            this.actors.push(new Missile(pos, i), new Warning(new Vector2(pos.x - 16, pos.y), 50, i));
        });

        //marine
        if (!this.actors.some(actor => actor instanceof Marine) && !(this.frameCount % 150)) {
            this.actors.push(new Marine(new Vector2(this.viewPos.x + game.width * 4, game.height - 32)));
        }

        //shield
        if (!((this.frameCount + 100) % 400)) {
            this.actors.push(new Shield(new Vector2(this.viewPos.x + game.width, Math.floor(2 + Math.random() * 8) * 16)));
        }
    }

    updateViewPos = game => {
        this.viewPos = new Vector2(this.elfriend.pos.x + this.elfriend.size.x / 2 - game.width / 2, 0).floor();
    }

    update = game => {
        this.updateViewPos(game);
        this.particleManager.update(game);

        const input = game.mouse.click === 'down' && game.mouse.hold === 1;

        // start
        if (!this.isStarted && input) {
            this.isStarted = true;
            this.spawnRibbon(game);
            game.audio.resume();
        }

        if (this.isStarted && !this.isGameOver && !(this.frameCount % 100)) {
            this.spawnEnemies(game);
        }

        if (this.isGameOver) {
            const mousePos = game.mouse.pos || null;
            if (!this.nextScene && mousePos && this.gameOverFrame > 60) {
                [this.playCollisionBox].forEach(btn => {
                    if (game.mouse.click === 'release' && !(mousePos.x < btn.pos.x || mousePos.y < btn.pos.y || btn.pos.x + btn.size.x <= mousePos.x || btn.pos.y + btn.size.y <= mousePos.y)) {
                        btn.func(game);
                    }
                });
            }
        }

        this.actors.forEach(actor => actor.update(game));

        if (this.nextScene) {
            if (this.nextSceneFrame) this.nextSceneFrame--;
            else game.scene = this.nextScene;
        }

        if (this.shakeBuffer) this.shakeBuffer--;
        if (this.isGameOver) {
            if (this.gameOverFrame === 30) game.audio.playSFX('sfx_swooshing');
            if (this.gameOverFrame === 60 && !(this.score < 10)) game.audio.playSFX('sfx_explosion');
            this.gameOverFrame++;
        }
        
        this.frameCount++;
    }

    drawBackground = (game, cx, img, yPos, ySize, xSpeed) => {
        const offset = Math.round(game.scene.elfriend.pos.x * xSpeed) % game.width;
        cx.drawImage(game.img[img], 0, 0, game.width, ySize, -offset, yPos, game.width, ySize);
        cx.drawImage(game.img[img], 0, 0, game.width, ySize, game.width - offset, yPos, game.width, ySize);
    }
    
    draw = game => {
        for (let layer = 0; layer < 4; layer++) {
            const cx = game[`ctx${layer}`];
            cx.save();
            cx.clearRect(0, 0, game.width, game.height);
            if (this.shakeBuffer) cx.translate(Math.floor(Math.random() * 4 - 2), 0);
            switch (layer) {
                case 0:
                    this.drawBackground(game, cx, 'sky',  0  * 16, 14 * 16, 6  / 16);
                    this.drawBackground(game, cx, 'city', 12 * 16, 2  * 16, 8  / 16);
                    this.drawBackground(game, cx, 'bush', 13 * 16, 1  * 16, 14 / 16);
                    break;
                case 1:
                    cx.save();
                    cx.translate(-this.viewPos.x, -this.viewPos.y);
                    this.particleManager.draw(cx, game, 0);
                    this.actors.filter(actor => actor.layer === layer).forEach(actor => actor.draw(game, cx));
                    cx.restore();
                    break;
                case 2:
                    this.drawBackground(game, cx, 'floor', 14   * 16, 2 * 16, 16 / 16);
                    this.drawBackground(game, cx, 'bush',  15.5 * 16, 1 * 16, 24 / 16);

                    cx.save();
                    cx.translate(-this.viewPos.x, -this.viewPos.y);
                    this.particleManager.draw(cx, game, 1);
                    this.actors.filter(actor => actor.layer === layer).forEach(actor => actor.draw(game, cx));
                    cx.restore();
                    break;
                case 3:
                    if (!this.isStarted) {
                        cx.drawImage(game.img['title'], game.width * .5 - 72, 5 * 16);
                        cx.drawImage(game.img['tap'], game.width * .5 - 32, 10 * 16 - 16 + Math.floor(this.frameCount / 8) % 2);
                        cx.drawImage(game.img['credit'], game.width - 50, game.height - 8);
                    }

                    if (this.isStarted && !this.isGameOver) {
                        // health
                        for (let i = 0; i < this.elfriend.maxHealth; i++) {
                            cx.drawImage(game.img['heart'], i < this.elfriend.health ? 0 : 8, 0, 8, 8, i * 8, 0, 8, 8);
                        }

                        // best
                        cx.drawImage(game.img['crown'], game.width - 34, 2);
                        const bestArray = Array.from(game.save.data.best.toString());
                        while (bestArray.length < 3) bestArray.unshift('0');
                        cx.save();
                        cx.translate(game.width - 20, 0);
                        bestArray.forEach((digit, i) => {
                            cx.drawImage(game.img['digit_small'], digit * 8, 0, 8, 12, i * 6, 0, 8, 12);
                        });
                        cx.restore();
                        
                        // score
                        const scoreArray = Array.from(this.score.toString());
                        cx.save();
                        cx.translate(game.width * .5 - scoreArray.length * 5, 22);
                        scoreArray.forEach((digit, i) => {
                            cx.drawImage(game.img['digit_large'], digit * 12, 0, 12, 18, i * 10, 0, 12, 18);
                        });
                        cx.restore();
                    }

                    if (this.isGameOver) {
                        const progress = Math.min(1, Math.max(0, this.gameOverFrame - 30) / 30);
                        cx.drawImage(game.img['gameover'], game.width * .5 - 48, 72);
                        cx.save();
                        cx.translate(0, (1 - progress) ** 4 * 256);
                        cx.drawImage(game.img['result'], game.width * .5 - 48, game.height * .5 - 24);
                        if (this.gameOverFrame > 60) {
                            cx.save();
                            const scale = 3 - 2 * Math.min(1, (this.gameOverFrame - 60) / 5);
                            cx.translate(game.width * .5 - 24, game.height * .5 + 4);
                            cx.scale(scale, scale);
                            const medal = this.score < 10 ? -1 : this.score < 25 ? 0 : this.score < 50 ? 1 : this.score < 100 ? 2 : 3;
                            if (medal >= 0) cx.drawImage(game.img['medal'], 22 * medal, 0, 22, 22, -11, -11, 22, 22);
                            cx.restore();
                        }
                        
                        // score
                        const scoreArray = Array.from(this.score.toString());
                        while (scoreArray.length < 3) scoreArray.unshift('0');
                        cx.save();
                        cx.translate(game.width * .5 + 16, game.height * .5 - 12);
                        scoreArray.forEach((digit, i) => {
                            cx.drawImage(game.img['digit_small'], digit * 8, 0, 8, 12, i * 6, 0, 8, 12);
                        });
                        cx.restore();

                        // best
                        const bestArray = Array.from(game.save.data.best.toString());
                        while (bestArray.length < 3) bestArray.unshift('0');
                        cx.save();
                        cx.translate(game.width * .5 + 16, game.height * .5 + 8);
                        bestArray.forEach((digit, i) => {
                            cx.drawImage(game.img['digit_small'], digit * 8, 0, 8, 12, i * 6, 0, 8, 12);
                        });
                        cx.restore();
                        if (this.newBest) cx.drawImage(game.img['new'], game.width * .5 - 6, game.height * .5 + 10);
                        
                        cx.drawImage(game.img['buttons'], 32 * 0, 0, 32, 20, game.width * .5 - 16, 10 * 16, 32, 20);
                        // cx.drawImage(game.img['buttons'], 32 * 0, 0, 32, 20, game.width * .5 - 40, 10 * 16, 32, 20);
                        // cx.drawImage(game.img['buttons'], 32 * 1, 0, 32, 20, game.width * .5 + 8, 10 * 16, 32, 20);
                        cx.restore();
                    }

                    // opening transition
                    cx.fillStyle = '#000';
                    if (this.frameCount < this.startFrameSpeed) {
                        cx.globalAlpha = 1 - this.frameCount / this.startFrameSpeed;
                        cx.fillRect(0, 0, game.width, game.height);
                    }
                    // ending transition
                    if (this.nextScene) {
                        cx.globalAlpha = 1 - this.nextSceneFrame / this.endFrameSpeed;
                        cx.fillRect(0, 0, game.width, game.height);
                    }
                    break;
            }
            cx.restore();
        }
    }
}
