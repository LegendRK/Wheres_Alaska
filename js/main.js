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
let gameScene, ship, scoreLabel, lifeLabel, gameMusic, selectSound, gameOverSound, gameOverScoreLabel;
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
    
    gameMusic = new Howl({
        src: ['sounds/game_music.wav'],
        loop:1
    });
    
    
    selectSound = new Howl({
        src: ['sounds/select.wav'],
        volume:0.1
    });

    
    gameOverSound = new Howl({
        src: ['sounds/game_over.wav'],
        volume:0.5
    });
    
    
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
        fill: 0xb9d9fb,
        fontSize: 48,
        fontFamily: "DK Honeyguide",
        stroke: 0x5987b6,
        strokeThickness: 4
    });

    // 1 - set up 'startScene'
    // 1A - make the top start label
    let startLabel1 = new PIXI.Text("Where's Alaska?");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0xf2f4ff,
        fontSize: 72,
        fontFamily: 'DK Honeyguide',
        stroke: 0x5987b6,
        strokeThickness: 5
    });
    startLabel1.x = 60;
    startLabel1.y = 120;
    startScene.addChild(startLabel1);

    // 1B - make the start game button
    let startButton = new PIXI.Text("Play");
    startButton.style = buttonStyle;
    startButton.x = sceneWidth/2 - 50;
    startButton.y = sceneHeight/2;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.cursor = 'url(images/point.png) 8 8, pointer';
    startButton.on("pointerup", function(){selectSound.play(); startGame();});
    startButton.on('pointerover', e=>e.target.alpha = 0.7);
    startButton.on('pointerout', e=>e.currentTarget.alpha = 1.0);
    startScene.addChild(startButton);

    // 1D - make the difficulty button
    let diffButton = new PIXI.Text("Difficulty");
    diffButton.style = buttonStyle;
    diffButton.x = sceneWidth/2 - 100;
    diffButton.y = sceneHeight/2 + 80;
    diffButton.interactive = true;
    diffButton.buttonMode = true;
    diffButton.cursor = 'url(images/point.png) 8 8, pointer';
    diffButton.on("pointerup", function(){selectSound.play(); selectDifficulty();});
    diffButton.on('pointerover', e=>e.target.alpha = 0.7);
    diffButton.on('pointerout', e=>e.currentTarget.alpha = 1.0);
    startScene.addChild(diffButton);
    
    // 1D - make the help button
    let helpButton = new PIXI.Text("Help");
    helpButton.style = buttonStyle;
    helpButton.x = sceneWidth/2 - 50;
    helpButton.y = sceneHeight/2 + 160;
    helpButton.interactive = true;
    helpButton.buttonMode = true;
    helpButton.cursor = 'url(images/point.png) 8 8, pointer';
    helpButton.on("pointerup", function(){selectSound.play(); getHelp();});
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
        fontFamily: 'PoetsenOne',
        stroke: 0xFF0000,
        strokeThickness: 3
    });
    startLabel2.x = sceneWidth/2 - 90;
    startLabel2.y = sceneHeight - 30;
    startScene.addChild(startLabel2);
    
    // 1.5 - set up the 'difficulty scene'
    let topLabel = new PIXI.Text("Where's Alaska?");
    
    topLabel.style = new PIXI.TextStyle({
        fill: 0xf2f4ff,
        fontSize: 72,
        fontFamily: 'DK Honeyguide',
        stroke: 0x5987b6,
        strokeThickness: 5
    });
    topLabel.x = 60;
    topLabel.y = 120;
    diffScene.addChild(topLabel);
    
    let buttonLabelStyle = new PIXI.TextStyle({
        fill: 0xf2f4ff,
        fontSize: 24,
        fontFamily: 'DK Honeyguide',
        stroke: 0x76a6d8,
        strokeThickness: 4
    });
    
    // 1.5A - set up the Dan Button
    let danButton = new PIXI.Text("Dan");
    danButton.style = buttonStyle;
    danButton.x = sceneWidth/2 - 50;
    danButton.y = sceneHeight/2;
    danButton.interactive = true;
    danButton.buttonMode = true;
    danButton.cursor = 'url(images/point.png) 8 8, pointer';
    danButton.on("pointerup", function() {selectSound.play(); time = danTime; goBackToMain();});
    danButton.on('pointerover', e=>{e.target.alpha = 0.7; danLabel.visible = true;});
    danButton.on('pointerout', e=>{e.currentTarget.alpha = 1.0; danLabel.visible = false;});
    diffScene.addChild(danButton);
    
    let danLabel = new PIXI.Text("Easy mode. Timer is set at 20 seconds");
    danLabel.style = buttonLabelStyle;
    danLabel.x = sceneWidth/2 - 180;
    danLabel.y = sceneHeight/2 - 60;
    danLabel.visible = false;
    diffScene.addChild(danLabel);
    
    // 1.5B - set up the Normal Button
    let normalButton = new PIXI.Text("Normal");
    normalButton.style = buttonStyle;
    normalButton.x = sceneWidth/2 - 80;
    normalButton.y = sceneHeight/2 + 80;
    normalButton.interactive = true;
    normalButton.buttonMode = true;
    normalButton.cursor = 'url(images/point.png) 8 8, pointer';
    normalButton.on("pointerup", function() {selectSound.play(); time = normalTime; goBackToMain();});
    normalButton.on('pointerover', e=>{e.target.alpha = 0.7; normalLabel.visible = true;});
    normalButton.on('pointerout', e=>{e.currentTarget.alpha = 1.0; normalLabel.visible = false;});
    diffScene.addChild(normalButton);
    
    let normalLabel = new PIXI.Text("Normal mode. Timer is set at 10 seconds");
    normalLabel.style = buttonLabelStyle;
    normalLabel.x = sceneWidth/2 - 200;
    normalLabel.y = sceneHeight/2 - 60;
    normalLabel.visible = false;
    diffScene.addChild(normalLabel);
    
    // 1.5C - set up the I LIVE in Alaska Button
    let alaskaButton = new PIXI.Text("I LIVE in Alaska");
    alaskaButton.style = buttonStyle;
    alaskaButton.x = sceneWidth/2 - 150;
    alaskaButton.y = sceneHeight/2 + 160;
    alaskaButton.interactive = true;
    alaskaButton.buttonMode = true;
    alaskaButton.cursor = 'url(images/point.png) 8 8, pointer';
    alaskaButton.on("pointerup", function() {selectSound.play(); time = alaskaTime; goBackToMain();});
    alaskaButton.on('pointerover', e=>{e.target.alpha = 0.7; alaskaLabel.visible = true;});
    alaskaButton.on('pointerout', e=>{e.currentTarget.alpha = 1.0; alaskaLabel.visible = false;});
    diffScene.addChild(alaskaButton);
    
    let alaskaLabel = new PIXI.Text("Hard mode. Timer is set at 5 seconds");
    alaskaLabel.style = buttonLabelStyle;
    alaskaLabel.x = sceneWidth/2 - 180;
    alaskaLabel.y = sceneHeight/2 - 60;
    alaskaLabel.visible = false;
    diffScene.addChild(alaskaLabel);
    
    // 1.75 - set up the help scene
    // 1.75A - -set up the labels
    let helpTextStyle = new PIXI.TextStyle({
        fill: 0xf2f4ff,
        fontSize: 32,
        fontFamily: 'DK Honeyguide',
        stroke: 0x96c5f7,
        strokeThickness: 4
    });
    
     let helpTextStyleMini = new PIXI.TextStyle({
        fill: 0xf2f4ff,
        fontSize: 14,
        fontFamily: 'DK Honeyguide',
        stroke: 0x96c5f7,
        strokeThickness: 2
    });
    
    let helpText = [];
    helpText.push(new PIXI.Text("Where in the world is Alaska? \n"));
    helpText.push(new PIXI.Text("Who knows? But it's your job to find out! \n"));
    helpText.push(new PIXI.Text("Click and drag states to move them around. \n"));
    helpText.push(new PIXI.Text("Double-click on Alaska to advance! \n"));
    helpText.push(new PIXI.Text("If you're wrong, the timer goes faster! \n"));
    helpText.push(new PIXI.Text("Are you a professional cartographer?* \n"));
    helpText.push(new PIXI.Text("Or are you just a Dan? \n"));
    helpText.push(new PIXI.Text("* Or a regular human being. \n"))
    for(let text = 0; text < helpText.length; text++)
    {
        helpText[text].style = helpTextStyle;
        helpText[text].y = 120 + 60*text;
        
        switch(text)
        {
            case 0:
                helpText[text].x = 80;
                break;
            case 1:
                helpText[text].x = 15;
                break;
            case 2:
                helpText[text].x = 10;
                break;
            case 3:
                helpText[text].x = 50;
                break;
            case 4:
                helpText[text].x = 30;
                break;
            case 5:
                helpText[text].x = 20;
                break;
            case 6:
                helpText[text].x = 120;
                break;
            case 7:
                helpText[text].x = sceneWidth/2 - 100;
                helpText[text].style = helpTextStyleMini;
                helpText[text].y = sceneHeight - 20;
                break;
            case 8:
                helpText[text].x = 80;
                break;
        }
        
            
        helpScene.addChild(helpText[text]);
    }
    
    // 1.75B - create the back button
    let backButton = new PIXI.Text("Back");
    backButton.style = buttonStyle;
    backButton.x = sceneWidth - 120;
    backButton.y = sceneHeight - 70;
    backButton.interactive = true;
    backButton.buttonMode = true;
    backButton.cursor = 'url(images/point.png) 8 8, pointer';
    backButton.on("pointerup", function(){selectSound.play(); goBackToMain();});
    backButton.on('pointerover', e=>e.target.alpha = 0.7);
    backButton.on('pointerout', e=>e.currentTarget.alpha = 1.0);
    helpScene.addChild(backButton);

    
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
    scoreLabel.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 21,
        fontFamily: 'PoetsenOne',
        stroke: 0xFF0000,
        strokeThickness: 3
    });;
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
    gameMusic.play();
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

function getHelp()
{
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = false;
    helpScene.visible = true;
    diffScene.visible = false;
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
    gameMusic.stop();
    
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
