class Elfriend {
    frameCount = 0;
    layer = 1;

    pos = new Vector2(4 * 16, 7.5 * 16);
    size = new Vector2(16, 16);
    vel = new Vector2(1, 0);

    gravity = .25;
    flyPower = -4;
    canFly = true;

    maxHealth = 3;
    health = this.maxHealth;

    isHit = game => {
        if (this.isInvincible || game.scene.isGameOver) return;
        this.health = Math.max(0, this.health - 1);
        if (!this.health) {
            this.vel = new Vector2(0, 0);
            this.canFly = false;
        } else {
            this.vel.x = Math.max(1, Math.floor(this.vel.x * .5));
            this.isInvincible = 50;
        }
    }

    update = game => {
        const scene = game.scene;
        const input = this.canFly && game.mouse.click === 'down' && game.mouse.hold === 1;

        if (!scene.isGameOver) {
            if (scene.isStarted) {
                this.vel.y += this.gravity;
                if (input && this.pos.y > 32) {
                    this.vel.y = this.flyPower;
                    for (let i = 0; i < 3; i++) scene.particleManager.smoke_white(CollisionBox2.center(this), this.vel.times(-.25), 0);
                    game.audio.playSFX('sfx_wing');
                }
            }

            if (this.pos.y >= 13.25 * 16) {
                this.vel = new Vector2(0, 0);
                this.pos.y = 13.5 * 16;
                scene.particleManager.ray(CollisionBox2.center(this));
                scene.particleManager.impact(CollisionBox2.center(this));
                game.audio.playSFX('sfx_hit');
                scene.shakeBuffer = 10;

                scene.isGameOver = true;
                scene.actors = scene.actors.filter(actor => actor === this);
                if (scene.score > game.save.data.best) {
                    game.save.save('best', scene.score);
                    scene.newBest = true;
                }
            }
        }

        this.pos = this.pos.plus(this.vel);

        if (this.isInvincible) this.isInvincible--;
        this.frameCount++;
    }

    draw = (game, cx) => {
        if (this.isInvincible && this.frameCount % 2) return;
        cx.save();
        const scene = game.scene;
        const pos = CollisionBox2.center(this).round();
        cx.translate(pos.x, pos.y);
        if (scene.isGameOver) cx.drawImage(game.img['vfx_stun'], (Math.floor(this.frameCount / 4) % 4) * 24, 0, 24, 12, -12, -24, 24, 12);
        cx.rotate(scene.isGameOver ? Math.PI / 4 : Math.sin(this.vel.y * 5 * (Math.PI / 180)));
        cx.drawImage(game.img['elfriend'], scene.isGameOver ? 48 : (Math.floor(this.frameCount / 2) % 2) * 48, 0, 48, 48, -28, -24, 48, 48);
        cx.restore();
    }
}

class Ribbon {
    frameCount = 0;
    layer = 1;

    size = new Vector2(16, 16);
    vel = new Vector2(0, 0);

    speedBoost = 12.5;

    constructor(pos) {
        this.pos = pos;
    }

    update = game => {
        const scene = game.scene;
        if (!(this.frameCount % 8)) scene.particleManager.sparkle(CollisionBox2.center(this), new Vector2(0, 0), 16, 'white', 1);

        if (CollisionBox2.intersects(this, scene.elfriend)) {
            scene.actors = scene.actors.filter(actor => actor !== this);
            scene.spawnRibbon(game);
            scene.score++;
            scene.elfriend.vel.x = Math.round(scene.elfriend.vel.x * 100 + this.speedBoost) / 100;
            game.audio.playSFX('sfx_point');
        }
        
        if (this.pos.x + this.size.x < scene.viewPos.x) {
            this.pos.x = scene.viewPos.x + game.width;
        }

        this.frameCount++;
    }

    draw = (game, cx) => {
        cx.save();
        const pos = CollisionBox2.center(this).round();
        cx.translate(pos.x, pos.y + Math.floor(2 * Math.sin(this.frameCount * 10 * (Math.PI / 180))));
        cx.drawImage(game.img['ribbon'], 0, 0, 16, 16, -8, -8, 16, 16);
        cx.restore();
    }
}

class Warning {
    frameCount = 0;
    layer = 2;

    size = new Vector2(16, 16);

    constructor(pos, duration, delay) {
        this.duration = duration;
        this.delay = delay;
        this.pos = pos;
    }

    update = game => {
        const scene = game.scene;
        if (this.frameCount > this.duration + this.delay * 5) scene.actors = scene.actors.filter(actor => actor !== this);
        this.pos.x = scene.viewPos.x + game.width - 16;
        this.frameCount++;
    }

    draw = (game, cx) => {
        if (this.frameCount < 5 * this.delay) return;
        cx.save();
        const pos = CollisionBox2.center(this).round();
        cx.translate(pos.x, pos.y);
        cx.drawImage(game.img['warning'], (Math.floor(this.frameCount / 2) % 2) * 16, 0, 16, 16, -8, -8, 16, 16);
        cx.restore();
    }
}

class Missile {
    frameCount = 0;
    layer = 2;

    size = new Vector2(32, 6);
    vel = new Vector2(-4, 0);

    constructor(pos, delay) {
        this.delay = delay;
        this.pos = pos;
    }

    explode = (game, other) => {
        const scene = game.scene;
        const collision = CollisionBox2.intersects(this, other);
        scene.particleManager.ray(CollisionBox2.center(collision));
        scene.particleManager.impact(CollisionBox2.center(collision));
        scene.actors = scene.actors.filter(actor => actor !== this);
        scene.particleManager.explosion(CollisionBox2.center(this));
        game.audio.playSFX('sfx_explosion');
        scene.shakeBuffer = 10;
    }

    update = game => {
        const scene = game.scene;
        if (this.frameCount > 50 + this.delay * 5) {
            this.pos = this.pos.plus(this.vel);
            scene.particleManager.smoke_white(new Vector2(this.pos.x + this.size.x, this.pos.y + this.size.y / 2), scene.elfriend.vel.times(-.25), 0);

            const elfriend = scene.elfriend;
            if (CollisionBox2.intersects(this, elfriend) && elfriend.canFly) {
                this.explode(game, elfriend);
                elfriend.isHit(game);
            }
        } else this.pos.x = scene.viewPos.x + game.width + 32;
        if (this.pos.x + this.size.x < scene.viewPos.x) scene.actors = scene.actors.filter(actor => actor !== this);
        this.frameCount++;
    }

    draw = (game, cx) => {
        cx.save();
        const pos = CollisionBox2.center(this).round();
        cx.translate(pos.x, pos.y + 2 * Math.sin(this.frameCount * 50 * (Math.PI / 180)));
        cx.rotate((Math.PI / 90) * Math.sin(this.frameCount * 100 * (Math.PI / 180)));
        cx.drawImage(game.img['vfx_rapid_fire'], (Math.floor(this.frameCount) % 2) * 24, 0, 24, 24, this.size.x / 2, -12, 24, 24);
        cx.drawImage(game.img['carrot'], 0, 0, 44, 20, -22, -10, 44, 20);
        cx.restore();
    }
}

class Marine {
    frameCount = 0;
    layer = 2;

    size = new Vector2(48, 48);

    constructor(pos) {
        this.pos = pos;
    }

    update = game => {
        const scene = game.scene;
        if (!(this.frameCount % 60)) scene.actors.push(new Bullet(CollisionBox2.center(this)));
        if (this.pos.x + this.size.x < scene.viewPos.x) scene.actors = scene.actors.filter(actor => actor !== this);
        this.frameCount++;
    }

    draw = (game, cx) => {
        cx.save();
        const pos = CollisionBox2.center(this).round();
        cx.translate(pos.x, pos.y);
        cx.drawImage(game.img['marine'], Math.floor(this.frameCount / 30) % 2 ? 0 : 48, 0, 48, 48, -24, -24, 48, 48);
        cx.restore();
    }
}

class Bullet {
    frameCount = 0;
    layer = 2;

    size = new Vector2(8, 8);
    vel = new Vector2(-.5, -2);

    constructor(pos) {
        this.pos = pos;
    }

    explode = (game, other) => {
        const scene = game.scene;
        const collision = CollisionBox2.intersects(this, other);
        scene.particleManager.ray(CollisionBox2.center(collision));
        scene.particleManager.impact(CollisionBox2.center(collision));
        scene.actors = scene.actors.filter(actor => actor !== this);
        scene.particleManager.explosion(CollisionBox2.center(this));
        game.audio.playSFX('sfx_explosion');
        scene.shakeBuffer = 10;
    }

    update = game => {
        const scene = game.scene;
        this.pos = this.pos.plus(this.vel);
        scene.particleManager.smoke_white(new Vector2(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2), new Vector2(0, 0), 0);

        const elfriend = scene.elfriend;
        if (CollisionBox2.intersects(this, elfriend) && elfriend.canFly) {
            this.explode(game, elfriend);
            elfriend.isHit(game);
        }
        if (this.pos.x + this.size.x < scene.viewPos.x) scene.actors = scene.actors.filter(actor => actor !== this);
        this.frameCount++;
    }

    draw = (game, cx) => {
        cx.save();
        const pos = CollisionBox2.center(this).round();
        cx.translate(pos.x, pos.y);
        cx.drawImage(game.img['bullet'], 0, 0, 16, 16, -8, -8, 16, 16);
        cx.restore();
    }
}

class Shield {
    frameCount = 0;
    layer = 2;

    size = new Vector2(16, 48);
    vel = new Vector2(1, 0);

    constructor(pos) {
        this.pos = pos;
    }

    update = game => {
        const scene = game.scene;
        this.vel.x = scene.elfriend.vel.x - .5;
        this.pos = this.pos.plus(this.vel);

        const elfriend = scene.elfriend;
        if (CollisionBox2.intersects(this, elfriend) && elfriend.canFly && !this.isTouched) {
            game.audio.playSFX('sfx_hit');
            elfriend.isHit(game);

            const collision = CollisionBox2.intersects(this, elfriend);
            scene.particleManager.ray(CollisionBox2.center(collision));
            scene.particleManager.impact(CollisionBox2.center(collision));
            scene.shakeBuffer = 10;
            this.isTouched = true;
        }

        scene.actors.forEach(actor => {
            if ((actor instanceof Missile || actor instanceof Bullet) && CollisionBox2.intersects(this, actor)) {
                actor.explode(game, this);
            }
        });

        if (this.pos.x + this.size.x < scene.viewPos.x) scene.actors = scene.actors.filter(actor => actor !== this);
        this.frameCount++;
    }

    draw = (game, cx) => {
        cx.save();
        if (this.isTouched) cx.globalAlpha = .75;
        const pos = CollisionBox2.center(this).round();
        cx.translate(pos.x, pos.y);
        cx.drawImage(game.img['shield'], 0, 0, 24, 48, -12, -24, 24, 48);
        cx.restore();
    }
}