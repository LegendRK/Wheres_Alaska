"use strict";
const app = new PIXI.Application(600,600,{backgroundColor: 0xf2f4ff});
document.body.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

// pre-load the images
PIXI.loader.add("images/us_states.png").on("progress", e=>{console.log('progress=${e.progress}')}).load(setup);

// aliases
let stage;

// game variables
let startScene, diffScene, helpScene;
let gameScene, ship, scoreLabel, lifeLabel, shootSound, hitSound, fireballSound, gameOverScoreLabel;
let gameOverScene;

let aliens = [];
let explosions = [];
let states = [];
let alaska;
let timer;

let time = 10;
let danTime = 20;
let normalTime = 10;
let alaskaTime = 5;

let alaskaTexture;
let currStates = [];
let explosionTextures;
let highScore = 0;
let scoreKey = "rgkdsgscore";
let score = 0;
let life = 100;
let levelNum = 1;
let paused = true;

function setup()
{
    stage = app.stage;
    
    
    // #0 - Get High Score from local storage
    highScore = localStorage.getItem(scoreKey);
    console.log(highScore);
    
    // #1 - Create the 'start' scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);

    // #1B = Create the "Set Difficulty" scene
    diffScene = new PIXI.Container();
    diffScene.visible = false;
    stage.addChild(diffScene);
    
    // #1C - Create the "Help" Scene
    helpScene = new PIXI.Container();
    helpScene.visible = false;
    stage.addChild(helpScene);
    
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
    states = loadSpriteSheetStates();

    // Now our 'startScene' is visible
    // Clicking the button calls startGame()
    console.log(states);

    //First level
    //newLevel(levelNum);
    
    // #8 - Start update loop
    app.ticker.add(gameLoop);

    // #9 - Start listening for click events on the canvas

}

function createLabelsAndButtons()
{
    let buttonStyle = new PIXI.TextStyle({
        fill: 0x96c5f7,
        fontSize: 48,
        fontFamily: "DK Honeyguide",
        
    });

    // 1 - set up 'startScene'
    // 1A - make the top start label
    let startLabel1 = new PIXI.Text("Where's Alaska?");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0xf2f4ff,
        fontSize: 72,
        fontFamily: 'DK Honeyguide',
        stroke: 0x96c5f7,
        strokeThickness: 6
    });
    startLabel1.x = 60;
    startLabel1.y = 120;
    startScene.addChild(startLabel1);

    // 1B - make the start game button
    let startButton = new PIXI.Text("Play");
    startButton.style = buttonStyle;
    startButton.x = sceneWidth/2 - 60;
    startButton.y = sceneHeight/2;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.cursor = 'url(images/point.png) 8 8, pointer';
    startButton.on("pointerup", startGame);
    startButton.on('pointerover', e=>e.target.alpha = 0.7);
    startButton.on('pointerout', e=>e.currentTarget.alpha = 1.0);
    startScene.addChild(startButton);

    // 1D - make the difficulty button
    let diffButton = new PIXI.Text("Difficulty");
    diffButton.style = buttonStyle;
    diffButton.x = sceneWidth/2 - 110;
    diffButton.y = sceneHeight/2 + 80;
    diffButton.interactive = true;
    diffButton.buttonMode = true;
    diffButton.cursor = 'url(images/point.png) 8 8, pointer';
    diffButton.on("pointerup", selectDifficulty);
    diffButton.on('pointerover', e=>e.target.alpha = 0.7);
    diffButton.on('pointerout', e=>e.currentTarget.alpha = 1.0);
    startScene.addChild(diffButton);
    
    // 1D - make the help button
    let helpButton = new PIXI.Text("Help");
    helpButton.style = buttonStyle;
    helpButton.x = sceneWidth/2 - 60;
    helpButton.y = sceneHeight/2 + 160;
    helpButton.interactive = true;
    helpButton.buttonMode = true;
    helpButton.cursor = 'url(images/point.png) 8 8, pointer';
    helpButton.on("pointerup", startGame);
    helpButton.on('pointerover', e=>e.target.alpha = 0.7);
    helpButton.on('pointerout', e=>e.currentTarget.alpha = 1.0);
    startScene.addChild(helpButton);
    
    // 1E - make the high score
    let startLabel2;
    if(highScore == null)
    {
        startLabel2 = new PIXI.Text("High Score: " + 0);
    }
    else
    {
        startLabel2 = new PIXI.Text("High Score: " + highScore);
    }
    startLabel2.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 21,
        fontFamily: 'DK Honeyguide',
        stroke: 0xFF0000,
        strokeThickness: 3
    });
    startLabel2.x = sceneWidth/2 - 75;
    startLabel2.y = sceneHeight - 30;
    startScene.addChild(startLabel2);
    
    // 1.5 - set up the 'difficulty scene'
    // 1A - make the top start label
    let topLabel = new PIXI.Text("Where's Alaska?");
    topLabel.style = new PIXI.TextStyle({
        fill: 0xf2f4ff,
        fontSize: 72,
        fontFamily: 'DK Honeyguide',
        stroke: 0x96c5f7,
        strokeThickness: 6
    });
    topLabel.x = 60;
    topLabel.y = 120;
    diffScene.addChild(topLabel);

    
    
    // 1.5A - set up the Dan Button
    let danButton = new PIXI.Text("Dan");
    danButton.style = buttonStyle;
    danButton.x = sceneWidth/2 - 60;
    danButton.y = sceneHeight/2;
    danButton.interactive = true;
    danButton.buttonMode = true;
    danButton.cursor = 'url(images/point.png) 8 8, pointer';
    danButton.on("pointerup", function() {time = danTime; goBackToMain();});
    danButton.on('pointerover', e=>e.target.alpha = 0.7);
    danButton.on('pointerout', e=>e.currentTarget.alpha = 1.0);
    diffScene.addChild(danButton);
    
    // 1.5B - set up the Normal Button
    let normalButton = new PIXI.Text("Normal");
    normalButton.style = buttonStyle;
    normalButton.x = sceneWidth/2 - 90;
    normalButton.y = sceneHeight/2 + 80;
    normalButton.interactive = true;
    normalButton.buttonMode = true;
    normalButton.cursor = 'url(images/point.png) 8 8, pointer';
    normalButton.on("pointerup", function() {time = normalTime; goBackToMain();});
    normalButton.on('pointerover', e=>e.target.alpha = 0.7);
    normalButton.on('pointerout', e=>e.currentTarget.alpha = 1.0);
    diffScene.addChild(normalButton);
    
    // 1.5C - set up the I LIVE in Alaska Button
    let alaskaButton = new PIXI.Text("I LIVE in Alaska");
    alaskaButton.style = buttonStyle;
    alaskaButton.x = sceneWidth/2 - 160;
    alaskaButton.y = sceneHeight/2 + 160;
    alaskaButton.interactive = true;
    alaskaButton.buttonMode = true;
    alaskaButton.cursor = 'url(images/point.png) 8 8, pointer';
    alaskaButton.on("pointerup", function() {time = alaskaTime; goBackToMain();});
    alaskaButton.on('pointerover', e=>e.target.alpha = 0.7);
    alaskaButton.on('pointerout', e=>e.currentTarget.alpha = 1.0);
    diffScene.addChild(alaskaButton);
    
    //1.5A - make the difficulty buttons
    
    // 1.75 - set up the help scene
    
    
    
    // 2 - set up 'gameScene'
    let textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 18,
        fontFamily: 'DK Honeyguide',
        stroke: 0xFF0000,
        strokeThickness: 4
    });

    // 2A - make score label
    scoreLabel = new PIXI.Text();
    scoreLabel.style = textStyle;
    scoreLabel.x = sceneWidth/2 - 40;
    scoreLabel.y = sceneHeight - 40;
    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);
    
    // 3 - set up 'gameOverScene'
    // 3A - make game over text
    let gameOverText = new PIXI.Text("Game Over!\n          :-O");
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 64,
        fontFamily: 'DK Honeyguide',
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
    newLevel(levelNum);
}

function selectDifficulty()
{
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = false;
    helpScene.visible = false;
    diffScene.visible = true;
}

function goBackToMain()
{
    startScene.visible = true;
    gameOverScene.visible = false;
    gameScene.visible = false;
    helpScene.visible = false;
    diffScene.visible = false;
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
    
    alaskaTexture = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(startState*width, 0, width, height));
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

function startNextLevel() {
    endLevel();
    levelNum++;
    
    // add to the score
    score += Math.floor((timer.width/timer.originalWidth) * 100);    
    
    // update the high score in local storage
    if(score > highScore)
        localStorage.setItem(scoreKey, score);
    
    newLevel(levelNum);
}

function endLevel()
{
    paused = true;

    // clear out level
    currStates.forEach(c=>gameScene.removeChild(c));
    currStates = [];

}

function newLevel(levelNum) {
    alaska = new State(2, alaskaTexture, startNextLevel);
    randomlyPlaceState(alaska);
    
    for(let i = 0; i < levelNum * 5; i++) {
        let randStateNum = Math.floor(Math.random()*states.length);
        let currState = new State(randStateNum, states[randStateNum], penalize);
        randomlyPlaceState(currState);
    }
    
    // create the timer
    if(timer)
        gameScene.removeChild(timer);

    timer = new Timer(sceneWidth, time);
    gameScene.addChild(timer);
    
}

function randomlyPlaceState(currState) {
    currStates.push(currState);
    currState.x = Math.random() * (sceneWidth - 25) + 25;
    currState.y = Math.random() * (sceneHeight - 25) + 25;
    gameScene.addChild(currState);
}

function end(){
    endLevel();
    gameOverScene.visible = true;
    gameScene.visible = false;
}

function penalize()
{
    timer.multiplier += 0.5;
}

function gameLoop()
{
    // keep track of the timer
    if(timer)
    {
        if(timer.width > 0)
            timer.countdown();
        
        if(timer.width <= 0)
            end();
    }
    
    // update the score
    scoreLabel.text = "Score: " + score;
    
    
}
