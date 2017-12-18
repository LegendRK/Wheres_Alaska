/// State class
/// paramaters: id, texture, dblclick, x, y
/// id: value of state in the array, used to identify the state
/// texture: the sprite for the state
/// dblclick: double click event function
/// release: releases all states from following mouse
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
        
        // Default to not following mouse
        this.isMouseTarget = false;
        
        // Default to 0 to use later for checking double click
        this.clicks = 0;
        
        // set the tint
        this.tint = Math.random() * 0xFFFFFF;
        
        // set the scale
        this.interactive = true;
        
        // Function to perform on double click
        this.dblclick = dblclick;
        this.release = release;
        
        // Remove state if right clicked - if state is alaska quit
        this.on("rightup", function(e) {
            if(!this.isAlaska()) {
                gameScene.removeChild(this);
                currStates.pop(this);
            } else {
                end();
            }
        });
        
        // Check click/double click to start mouse following
        this.on("pointerdown", function(e) {
            
            // Change cursor
            this.cursor = 'url(images/grab.png) 8 8, pointer';
            
            // Save scope for double click detect
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
        
        // Follow mouse if we should, otherwise just change to open hand to imply
        // that we can grab the state
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
        
        // Let go of state, or in edge case free all states
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
    
    isAlaska() {
        return (this.id == 2);
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