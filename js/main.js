"use strict";
const app = new PIXI.Application(600,600);
document.body.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

// pre-load the images
PIXI.loader.add("images/us_states.png").on("progress", e=>{console.log('progress=${e.progress}')}).load(setup);

// aliases
let stage;

// game variables
let startScene;
let gameScene, ship, scoreLabel, lifeLabel, shootSound, hitSound, fireballSound, gameOverScoreLabel;
let gameOverScene;

let circles = [];
let bullets = [];
let aliens = [];
let explosions = [];
let states = [];
let alaska;
let currStates = [];
let explosionTextures;
let score = 0;
let life = 100;
let levelNum = 1;
let paused = true;

function setup()
{
    stage = app.stage;

    // #1 - Create the 'start' scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);

    // #2 - Create the main 'game' scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

    // #3 - Create the 'gameOver' scene and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);

    // #4 - Create labels for all 3 scenes
    createLabelsAndButtons();

    // #5 - Create ship
    // ship = new Ship();
    // gameScene.addChild(ship);

    // #6 - Load Sounds
    /*
    shootSound = new Howl({
        src: ['sounds/shoot.wav']
    });

    hitSound = new Howl({
        src: ['sounds/hit.mp3']
    });

    fireballSound = new Howl({
        src: ['sounds/fireball.mp3']
    });
    */
    
    // #7 - Load sprite sheet
    explosionTextures = loadSpriteSheet();
    states = loadSpriteSheetStates();

    // Now our 'startScene' is visible
    // Clicking the button calls startGame()
    console.log(states);

    //First level
    newLevel(levelNum);
    
    // #8 - Start update loop
    //app.ticker.add(gameLoop);

    // #9 - Start listening for click events on the canvas

}

function createLabelsAndButtons()
{
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 48,
        fontFamily: "DK Honeyguide"
    });

    // 1 - set up 'startScene'
    // 1A - make the top start label
    let startLabel1 = new PIXI.Text("Where's Alaska?");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 72,
        fontFamily: 'DK Honeyguide',
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    startLabel1.x = 60;
    startLabel1.y = 120;
    startScene.addChild(startLabel1);

    // 1B - make the middle start label
    let startLabel2 = new PIXI.Text("R U worthy..?");
    startLabel2.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 32,
        fontFamily: 'Futura',
        fontStyle: 'italic',
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    startLabel2.x = 185;
    startLabel2.y = 300;
    startScene.addChild(startLabel2);

    // 1C - make the start game button
    let startButton = new PIXI.Text("Enter, ... if you dare!");
    startButton.style = buttonStyle;
    startButton.x = 80;
    startButton.y = sceneHeight - 100;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame);
    startButton.on('pointerover', e=>e.target.alpha = 0.7);
    startButton.on('pointerout', e=>e.currentTarget.alpha = 1.0);
    startScene.addChild(startButton);

    // 2 - set up 'gameScene'
    let textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 18,
        fontFamily: "Futura",
        stroke: 0xFF0000,
        strokeThickness: 4
    });

    // 2A - make score label
    scoreLabel = new PIXI.Text();
    scoreLabel.style = textStyle;
    scoreLabel.x = 5;
    scoreLabel.y = 5;
    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);

    // 2B - make life label
    lifeLabel = new PIXI.Text();
    lifeLabel.style = textStyle;
    lifeLabel.x = 5;
    lifeLabel.y = 26;
    gameScene.addChild(lifeLabel);
    decreaseLifeBy(0);

    // 3 - set up 'gameOverScene'
    // 3A - make game over text
    let gameOverText = new PIXI.Text("Game Over!\n          :-O");
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 64,
        fontFamily: "Futura",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    gameOverText.style = textStyle;
    gameOverText.x = 100;
    gameOverText.y = sceneHeight/2 - 160;
    gameOverScene.addChild(gameOverText);

    // 3B - make "play again?" button
    let playAgainButton = new PIXI.Text("Play Again?");
    playAgainButton.style = buttonStyle;
    playAgainButton.x = 150;
    playAgainButton.y = sceneHeight - 100;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup", startGame);
    playAgainButton.on('pointerover', e=>e.target.alpha = .7);
    playAgainButton.on('pointerout', e=>e.currentTarget.alpha = 1.0);
    gameOverScene.addChild(playAgainButton);

    // 4 - create a game over score display
    gameOverScoreLabel = new PIXI.Text();
    gameOverScoreLabel.style = textStyle;
    gameOverScoreLabel.x = 50;
    gameOverScoreLabel.y = sceneHeight/2 + 80;
    gameOverScene.addChild(gameOverScoreLabel);

}

function createExplosion(x,y,frameWidth, frameHeight)
{
    let w2 = frameWidth / 2;
    let h2 = frameHeight / 2;
    let expl = new PIXI.extras.AnimatedSprite(explosionTextures);
    expl.x = x - w2;
    expl.y = y - h2;
    expl.animationSpeed = 1/7;
    expl.loop = false;
    expl.onComplete = e=>gameScene.removeChild(expl);
    explosions.push(expl);
    gameScene.addChild(expl);
    expl.play();
}

// clicking the button calls startGame()
function startGame()
{
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    levelNum = 1;
    score = 0;
    life = 100;
    increaseScoreBy(0);
    decreaseLifeBy(0);
    //ship.x = 300;
    //ship.y = 550;
    loadLevel();
}

function increaseScoreBy(value)
{
    score+= value;
    scoreLabel.text = 'Score    ' + score;
}

function decreaseLifeBy(value)
{
    life -= value;
    life = parseInt(life);
    lifeLabel.text = 'Life      ' + life + '%';
}

function createCircles(numCircles)
{
    for(let i = 0; i < numCircles; i++)
    {
        let c = new Circle(10, 0xFFFF00);
        c.x = Math.random() * (sceneWidth - 50) + 25;
        c.y = Math.random() * (sceneHeight - 400) + 25;
        circles.push(c);
        gameScene.addChild(c);
    }
}

function loadLevel()
{
    createCircles(levelNum * 5);
    paused = false;
}

function loadSpriteSheet()
{
    // 16 animation frames are 64x64
    // second row
    let spriteSheet = PIXI.BaseTexture.fromImage("images/explosions.png");
    let width = 64;
    let height = 64;
    let numFrames = 16;
    let textures = [];
    for(let i = 0; i < numFrames; i++)
    {
        let frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(i*width, 64, width, height));
        textures.push(frame);
    }
    return textures;
}

/// Init states array to state textures
function loadSpriteSheetStates()
{
    // 16 animation frames are 64x64
    // second row
    let spriteSheet = PIXI.BaseTexture.fromImage("images/us_states.png");
    let width = 64;
    let height = 64;
    let statesPerRow = 9;
    
    // Skip the first images since img 1 is the USA and img 2 is the blank
    let startState = 2;
    let numRows = 6;
    //let numFrames = 50;
    let states = [];
    
    alaska = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(startState*width, 0, width, height));
    startState++;
    
    for(let i = 0; i < numRows; i++)
    {
      for (let j = startState; j < statesPerRow; j++) {
        let state = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(j*width, i*height, width, height));
        states.push(state);
      }
      startState = 0;
    }
    return states;
}

function endLevel()
{
    paused = true;

    // clear out level
    currStates.forEach(c=>gameScene.removeChild(c));
    currStates = [];

}

function newLevel(levelNum) {
    let alaskaStateObj = new State(2, alaska);
    randomlyPlaceState(alaskaStateObj);
    
    for(let i = 0; i < levelNum * 5; i++) {
        let randStateNum = Math.floor(Math.random()*states.length);
        let currState = new State(randStateNum, states[randStateNum]);
        randomlyPlaceState(currState);
    }
    
}

function randomlyPlaceState(currState) {
    currStates.push(currState);
    currState.x = Math.random() * (sceneWidth - 50) + 25;
    currState.y = Math.random() * (sceneHeight - 400) + 25;
    gameScene.addChild(currState);
}

function end()
{
//    paused = true;
//
//    // clear out level
//    circles.forEach(c=>gameScene.removeChild(c));
//    circles = [];
//
//    bullets.forEach(b=>gameScene.removeChild(b));
//    bullets = [];
//
//    explosions.forEach(e=>gameScene.removeChild(e));
//    explosions = [];
//
//    gameOverScoreLabel.text = 'Your Final Score: ' + score;
//
//    gameOverScene.visible = true;
//    gameScene.visible = false;
}

function gameLoop(){}
