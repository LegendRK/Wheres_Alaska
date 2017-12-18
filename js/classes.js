/// State class
/// paramaters: id, texture, dblclick, x, y
/// id: value of state in the array, used to identify the state
/// texture: the sprite for the state
/// dblclick: double click event
/// x: x position on the screen
/// y: y position on the screen
class State extends PIXI.Sprite
{
    constructor(id, texture, dblclick, release, x = 0, y = 0)
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
        this.interactive = true;
        this.dblclick = dblclick;
        this.release = release;
        
        
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
            //this.cursor = 'url(images/open_hand.png) 8 8, pointer';
            if(this.isMouseTarget) {

                let mousePosition = app.renderer.plugins.interaction.mouse.global;
                this.position = mousePosition;

            }
            else
            {
                this.cursor = 'url(images/open_hand.png) 8 8, pointer';
            }
        });
        
        this.on("pointerup", function(e) {
            this.cursor = 'url(images/open_hand.png) 8 8, pointer';
            if(this.isMouseTarget) {
                this.isMouseTarget = false;
            }
            else {
                this.release();
            }
        });
        
        // set the x and y
        this.x = x;
        this.y = y;
        
        // set the id so we can check for the state later
        this.id = id;
    }
}

/// Timer class
/// paramaters: width, time, height, color, x, y
/// width: width of the timer accross the screen
/// time: amount of time used by the timer
/// height: height of the timer on the screen
/// color: color of the timer bar
/// x: x position on the screen
/// y: y position on the screen
class Timer extends PIXI.Graphics
{
    constructor(width, time = 10, height = 10, color = 0xb9d9fb, x = 0, y = 0)
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