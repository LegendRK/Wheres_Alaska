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
        
        // set the scale
        this.scale.set = Math.random() * 2;
        this.interactive = true;
        this.dblclick = dblclick;
        this.on("pointerdown", function(e) {
            
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
    constructor(width, time = 60, height = 5, color = 0xFFFFFF, x = 0, y = height)
    {
        super();
        this.beginFill(color);
        this.drawRect(x, y, width, height);
        this.endFill();
        this.x = x;
        this.y = y;
        
        this.originalWidth = width;
        this.totalTime = time;
        this.currentTime = this.totalTime;
    }
    
    countdown(dt = 1/60)
    {
        this.currentTime -= dt;
        update();
    }
    
    update()
    {
        this.width = (this.currentTime / this.totalTime) * this.originalWidth; 
    }
}