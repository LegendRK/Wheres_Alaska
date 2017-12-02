class State extends PIXI.Sprite
{
    constructor(id, texture, x = 0, y = 0)
    {
        // load the texture using super
        super(texture);
        
        // set the anchor
        this.anchor.set(0.5, 0.5);
        
        // set the scale
        this.scale = Math.random() * 2;
        
        // set the x and y
        this.x = x;
        this.y = y;
        
        // set the id so we can check for the state later
        this.id = id;
    }
}

class Ship extends PIXI.Sprite
{
    constructor(x = 0, y = 0)
    {
        super(PIXI.loader.resources["images/Spaceship.png"].texture);
        this.anchor.set(.5, .5);
        this.scale.set(.1);
        this.x = x;
        this.y = y;
    }
}

class Circle extends PIXI.Graphics
{
    constructor(radius, color = 0xFF0000, x = 0, y = 0)
    {
        super();
        this.beginFill(color);
        this.drawCircle(0, 0, radius);
        this.endFill();
        this.x = x;
        this.y = y;
        this.radius = radius;
        
        // variables
        this.fwd = getRandomUnitVector();
        this.speed = 50;
        this.isAlive = true;
    }
    
    move(dt = 1/60)
    {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
    
    reflectX()
    {
        this.fwd.x *= -1;
    }
    
    reflectY()
    {
        this.fwd.y *= -1;
    }
} 

class Bullet extends PIXI.Graphics
{
    constructor(color = 0xFFFFFF, x =0, y = 0)
    {
        super();
        this.beginFill(color);
        this.drawRect(-2, -3, 4, 6);
        this.endFill();
        this.x = x;
        this.y = y;
        
        // variables
        this.fwd = {x: 0, y: -1};
        this.speed = 400;
        this.isAlive = true;
        Object.seal(this);
    }
    
    move(dt = 1/60)
    {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}