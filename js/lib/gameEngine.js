class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    value = () => new Vector2(this.x, this.y);
    plus = other => new Vector2(this.x + other.x, this.y + other.y);
    times = factor => new Vector2(this.x * factor, this.y * factor);
    mult = other => new Vector2(this.x * other.x, this.y * other.y);
    dot = other => this.x * other.x + this.y * other.y;
    equals = other => this.x === other.x && this.y === other.y;
    floor = () => new Vector2(Math.floor(this.x), Math.floor(this.y));
    round = () => new Vector2(Math.round(this.x), Math.round(this.y));
    lerp = (other, amt) => new Vector2((1 - amt) * this.x + amt * other.x, (1 - amt) * this.y + amt * other.y);
    distance = other => Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2);
}

class CollisionCircle {}
// CollisionCircle.ptIsInCircle = (circle, pt) => (ptPos.x - circlePos.x) * (ptPos.x - circlePos.x) + (ptPos.y - circlePos.y) * (ptPos.y - circlePos.y) <= rad * rad;
CollisionCircle.collides = (a, b) => a.radius + b.radius > Math.sqrt((a.pos.x - b.pos.x) ** 2 + (a.pos.y - b.pos.y) ** 2);


class CollisionBox2 {}
CollisionBox2.center = a => new Vector2(a.pos.x + a.size.x / 2, a.pos.y + a.size.y / 2);
CollisionBox2.intersects = (a, b) => {
    return CollisionBox2.intersectsInAxis(a, b, "x") && CollisionBox2.intersectsInAxis(a, b, "y") ? {
        pos: new Vector2(Math.max(a.pos.x, b.pos.x), Math.max(a.pos.y, b.pos.y)),
        size: new Vector2(
            Math.round((Math.min(a.pos.x + a.size.x, b.pos.x + b.size.x) - Math.max(a.pos.x, b.pos.x)) * 100) / 100,
            Math.round((Math.min(a.pos.y + a.size.y, b.pos.y + b.size.y) - Math.max(a.pos.y, b.pos.y)) * 100) / 100
        )
    } : false;
}
CollisionBox2.intersectsInAxis = (a, b, axis) => !(a.pos[axis] + a.size[axis] <= b.pos[axis] || a.pos[axis] >= b.pos[axis] + b.size[axis]);
CollisionBox2.intersectingCollisionBoxes = (a, b) => {
    const arr = b.filter(c => CollisionBox2.intersects(a, c));
    return arr.map(c => ({other:c, collision:CollisionBox2.intersects(a, c)}));
}
CollisionBox2.includedIn = (a, b) => CollisionBox2.includedInAxis(a, b, "x") && CollisionBox2.includedInAxis(a, b, "y");
CollisionBox2.includedInAxis = (a, b, axis) => !(a.pos[axis] + a.size[axis] > b.pos[axis] + b.size[axis] || a.pos[axis] < b.pos[axis]);
CollisionBox2.includingCollisionBoxes = (a, b) => b.filter(c => CollisionBox2.includedIn(a, c));
CollisionBox2.collidesWith = (a, b) => CollisionBox2.collidesWithInAxis(a, b, "x") && CollisionBox2.collidesWithInAxis(a, b, "y");
CollisionBox2.collidesWithInAxis = (a, b, axis) => !(a.pos[axis] + a.size[axis] < b.pos[axis] || a.pos[axis] > b.pos[axis] + b.size[axis]);
CollisionBox2.collidingCollisionBoxes = (a, b) => b.filter(c => CollisionBox2.collidesWith(a, c));