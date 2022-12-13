class ParticleManager {
    pool = [];

    update = game => {
        this.pool = this.pool.filter(particle => particle.life < particle.lifespan);
        this.pool.forEach(particle => particle.update(game));
    }

    draw = (cx, game, zIndex) => {
        this.pool.filter(particle => particle.zIndex === zIndex).forEach(particle => particle.draw(cx, game));
    }

    explosion = (pos, power) => {
        let type = 'explosion';
        if (power === 'ice') type += '_blue';
        for (let i = 0; i < 16; i++) {
            const angle = Math.random() * Math.PI * 2;
            this.pool.push(new Particle({
                type: type,
                pos: pos.plus(new Vector2(Math.cos(angle) * 24 * Math.random(),  Math.sin(angle) * 24 * Math.random())),
                size: new Vector2(18, 18),
                xOffset: p => p.size.x * Math.floor(p.life * 8 / p.lifespan),
                vel: new Vector2(0, 0),
                lifespan: 16,
                zIndex: 1,
                delay: i
            }));
        }
    }
    
    confettis = pos => {
        for (let i = 0; i < 16; i++) {
            const dir = (Math.random() > .5 ? 1 : -1) * Math.round(Math.random() * 3);
            const color = Math.floor(Math.random() * 6);
            const angle = Math.random() * Math.PI * 2;
            this.pool.push(new Particle({
                type: 'confettis',
                pos: pos.plus(new Vector2(Math.cos(angle) * 8 * Math.random(),  Math.sin(angle) * 8 * Math.random())),
                size: new Vector2(16, 16),
                xOffset: () => color * 4,
                vel: new Vector2(Math.cos(angle), Math.sin(angle)),
                lifespan: 24,
                zIndex: 1,
                rotate: p => Math.floor(p.life) * (Math.PI / 180) * dir,
            }));
        }
    }

    impact = pos => {
        this.pool.push(new Particle({
            type: `impact`,
            pos: pos,
            size: new Vector2(32, 32),
            xOffset: p => p.size.x * Math.floor(p.life * 2 / p.lifespan),
            vel: new Vector2(0, 0),
            lifespan: 4,
            zIndex: 1
        }));
    }
    
    ray = pos => {
        for (let i = 0; i < 2; i++) {
            this.pool.push(new Particle({
                type: `ray_${Math.ceil(Math.random() * 4)}`,
                pos: pos,
                size: new Vector2(128, 128),
                vel: new Vector2(0, 0),
                lifespan: 1,
                zIndex: 1,
                delay: i * 2
            }));
        }
    }
    
    smoke_white = (pos, vel, zIndex) => {
        this.pool.push(new Particle({
            type: `smoke_white`,
            pos: new Vector2(Math.round(pos.x) + Math.round(Math.random() * 12 - 6), Math.round(pos.y) + Math.round(Math.random() * 12 - 6)),
            size: new Vector2(8, 8),
            xOffset: p => p.size.x * Math.floor(p.life * 4 / p.lifespan),
            vel: vel,
            lifespan: 12 + Math.floor(Math.random() * 8),
            zIndex: zIndex
        }));
    }
    
    sparkle = (pos, vel, spread, type, zIndex) => {
        vel = !vel ? new Vector2(0, 0) : vel;
        const dir = (Math.random() > .5 ? 1 : -1) * Math.round(Math.random() * 3);
        this.pool.push(new Particle({
            type: `sparkle_${type}`,
            pos: new Vector2(Math.round(pos.x) + Math.round(Math.random() * spread - spread / 2), Math.round(pos.y) + Math.round(Math.random() * spread - spread / 2)),
            size: new Vector2(16, 16),
            xOffset: p => p.size.x * Math.floor(p.life * 6 / p.lifespan),
            vel: vel,
            lifespan: 12,
            zIndex: zIndex,
            rotate: p => Math.floor(p.life) * (Math.PI / 180) * dir,
        }));
    }
}

class Particle {
    life = 0;

    constructor(data) {
        const {
            type,
            pos,
            size,
            offset,
            vel,
            lifespan,
            delay,
            rotate,
            scale,
            zIndex
        } = data;
        Object.assign(this, data);
    }

    update = game => {
        if (this.delay) {
            this.delay--;
            return;
        }
        this.pos = this.pos.plus(this.vel);
        this.life++;
    }

    draw = (cx, game) => {
        if (this.delay) return;
        cx.save();
        cx.translate(Math.round(this.pos.x), Math.round(this.pos.y));
        if (this.rotate) cx.rotate(this.rotate(this));
        if (this.scale) cx.scale(...this.scale(this));
        const xOffset = this.xOffset ? this.xOffset(this) : 0;
        cx.drawImage(game.img[`vfx_${this.type}`], xOffset, 0, this.size.x, this.size.y, -this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);
        cx.restore();
    }
}