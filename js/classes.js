class State extends PIXI.Sprite
{
    constructor(id, texture, dblclick, x = 0, y = 0)
    {
        // load the texture using super
        super(texture);
        
        // set the anchor
        this.anchor.set(0.5, 0.5);
        this.isMouseTarget = false;
        this.clicks = 0;
        
        // set the tint
        this.tint = Math.random() * 0xFFFFFF;
        
        // set the scale
        this.scale.set = Math.random() * 2;
        this.interactive = true;
        this.dblclick = dblclick;
        this.on("pointerdown", function(e) {
            this.cursor = 'url(images/grab.png) 8 8, pointer';
            let obj = this;
            this.clicks++;
            if (this.clicks == 1) {
                
                obj.isMouseTarget = true; 
                setTimeout(function() { 
                    obj.clicks = 0; 
                }, 400);
            } else if (this.clicks == 2){
                if(this.dblclick) {
                    this.dblclick();
                }
                obj.clicks = 0;
            }
        });
        
        
        this.on("pointermove", function(e) {
            if(this.isMouseTarget) {
                let mousePosition = app.renderer.plugins.interaction.mouse.global;
                this.position = mousePosition;
            }
        });
        
        this.on("pointerup", function(e) {
            this.cursor = 'url(images/open_hand.png) 8 8, pointer';
            this.isMouseTarget = false;
        });
        
        // set the x and y
        this.x = x;
        this.y = y;
        
        // set the id so we can check for the state later
        this.id = id;
    }
}

class Timer extends PIXI.Graphics
{
    constructor(width, time = 10, height = 10, color = 0x000000, x = 0, y = 0)
    {
        super();
        this.beginFill(color);
        this.drawRect(x, y, width, height);
        this.endFill();
        this.x = x;
        this.y = y;
        this.time = time;
        this.width = width;
        this.originalWidth = width;
        this.totalTime = time;
        this.currentTime = this.totalTime;
        
        this.multiplier = 1;
    }
    
    countdown(dt = 1/60)
    {
        this.currentTime -= (((this.originalWidth / this.time) * (dt / 100)) * this.multiplier);
        this.update();
    }
    
    update()
    {
        this.width = Math.floor((this.currentTime / this.totalTime) * this.originalWidth);
    }
}