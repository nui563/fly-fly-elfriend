class Mouse {
    pos = null;
    click = 'up';
    hold = 0;

    constructor(ctx) {
        this.ctx = ctx;
        this.ctx.oncontextmenu = event => event.preventDefault();
        this.ctx.onmousemove = event => this.pos = new Vector2(event.offsetX, event.offsetY);
        this.ctx.onmouseout = event => {
            this.pos = null;
            if (this.click === 'down') this.release();
        }
        this.ctx.onpointerdown = event => this.click = event.which === 1 ? 'down' : this.click;
        this.ctx.onpointerup = event => this.release();
    }

    update = () => {
        if (this.click === 'release') {
            if (this.clickBuffer) this.clickBuffer = false;
            else {
                this.click = 'up';
                this.hold = 0;
            }
        }
        else if (this.click === 'down') this.hold++;
    }

    release = () => {
        this.click = 'release';
        this.clickBuffer = true;
    }
}