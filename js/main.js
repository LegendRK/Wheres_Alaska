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

/* game variables */

// scene variables
let startScene, diffScene, helpScene, gameScene, gameOverScene;

// label variables
let scoreLabel, highScoreLabel, lifeLabel, gameOverScoreLabel, gameOverHighScoreLabel;

// music variables
let gameMusic, selectSound, correctSound, wrongSound, danRight, danWrong, gameOverSound;

// object variables
let states = [];
let alaska;
let timer;

// pre-set values
let time = 10;
let danTime = 20;
let normalTime = 10;
let alaskaTime = 7;

// other variables
let alaskaTexture;
let currStates = [];
let scenes = [];
let music = [];
let danSounds = [];
let highScore = 0;
let scoreKey = "rgkdsgscore";
let score = 0;
let life = 100;
let levelNum = 1;
let paused = true;
let musicOn = true;
let dPressed = false;

// design variables
let labelFillColor = 0xf2f4ff;
let labelStrokeColor = 0x5987b6;
let buttonFillColor = 0xb9d9fb;
let buttonStrokeColor = 0x5987b6;
let musicOnLabel = PIXI.Texture.fromImage('images/music.png');
let musicOffLabel = PIXI.Texture.fromImage('images/musicCancel.png');

function setup()
{
    stage = app.stage;
    
    // #0 - Get High Score from local storage
    if(localStorage.getItem(scoreKey))
        highScore = localStorage.getItem(scoreKey);
    
    // #1 - Create the 'start' scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);
    scenes.push(startScene);

    // #1B = Create the "Set Difficulty" scene
    diffScene = new PIXI.Container();
    diffScene.visible = false;
    stage.addChild(diffScene);
    scenes.push(diffScene);
    
    // #1C - Create the "Help" Scene
    helpScene = new PIXI.Container();
    helpScene.visible = false;
    stage.addChild(helpScene);
    scenes.push(helpScene);
    
    // #2 - Create the main 'game' scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);
    scenes.push(gameScene);

    // #3 - Create the 'gameOver' scene and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);
    scenes.push(gameOverScene);
    
    console.log(scenes);
    
    // #4 - Create labels for all 3 scenes
    createLabelsAndButtons();

    // #5 - Load Sounds
    gameMusic = new Howl({
        src: ['sounds/game_music.mp3'],
        loop:1
    });
    music.push(gameMusic);
    
    selectSound = new Howl({
        src: ['sounds/select.wav'],
        volume:0.1
    });
    music.push(selectSound);
    
    correctSound = new Howl({
       src: ['sounds/correct.mp3'] 
    });
    music.push(correctSound);
    
    wrongSound = new Howl({
       src: ['sounds/wrong.wav'] 
    });
    music.push(wrongSound);
    
    danRight = new Howl({
        src: ['sounds/is_alaska.mp3']
    });
    music.push(danRight);
    
    danWrong = new Howl({
        src: ['sounds/not_alaska.mp3']
    });
    music.push(danWrong);
    
    gameOverSound = new Howl({
        src: ['sounds/game_over.wav'],
        volume:0.5
    });
    music.push(gameOverSound);
    
    // #6 - Load sprite sheet
    states = loadSpriteSheetStates();

    // #7 - Start update loop
    app.ticker.add(gameLoop);

    // #8 - Prevent help menu on right click 
    app.view.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    document.addEventListener('keydown', (e) => {
        if(e.keyCode == 68)
        {
            dPressed = !dPressed;
        }
    });

}

function createLabelsAndButtons()
{
    /*----------------------------------
            PRESET STYLES
    ------------------------------------*/
    let buttonStyle = new PIXI.TextStyle({
        fill: buttonFillColor,
        fontSize: 48,
        fontFamily: "FuturaHand",
        stroke: buttonStrokeColor,
        strokeThickness: 4
    });
    
    let buttonLabelStyle = new PIXI.TextStyle({
        fill: buttonFillColor,
        fontSize: 24,
        fontFamily: 'FuturaHand',
        stroke: buttonStrokeColor,
        strokeThickness: 4
    });

    let helpTextStyle = new PIXI.TextStyle({
        fill: labelFillColor,
        fontSize: 28,
        fontFamily: 'FuturaHand',
        stroke: labelStrokeColor,
        strokeThickness: 4
    });
    
     let helpTextStyleMini = new PIXI.TextStyle({
        fill: labelFillColor,
        fontSize: 18,
        fontFamily: 'FuturaHand',
        stroke: labelStrokeColor,
        strokeThickness: 2
    });
    
    let scoreStyle = new PIXI.TextStyle({
        fill: labelFillColor,
        fontSize: 32,
        fontFamily: 'FuturaHand',
        stroke: labelStrokeColor,
        strokeThickness: 6
    })
    
    
    /*----------------------------------
                   SCENES
    ------------------------------------*/
    // 1 - set up 'startScene'
    // 1A - make the top start label
    let startLabel1 = new PIXI.Text("Where's Alaska?");
    startLabel1.style = new PIXI.TextStyle({
        fill: labelFillColor,
        fontSize: 72,
        fontFamily: 'FuturaHand, arial, sans-serif',
        stroke: labelStrokeColor,
        strokeThickness: 5
    });
    startLabel1.x = sceneWidth/2 - 270;
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
    startButton.on("pointerup", function(){if(musicOn) selectSound.play(); startGame();});
    startButton.on('pointerover', e=>e.target.alpha = 0.7);
    startButton.on('pointerout', e=>e.currentTarget.alpha = 1.0);
    startScene.addChild(startButton);

    // 1C - make the difficulty button
    let diffButton = new PIXI.Text("Difficulty");
    diffButton.style = buttonStyle;
    diffButton.x = sceneWidth/2 - 100;
    diffButton.y = sceneHeight/2 + 80;
    diffButton.interactive = true;
    diffButton.buttonMode = true;
    diffButton.cursor = 'url(images/point.png) 8 8, pointer';
    diffButton.on("pointerup", function(){if(musicOn) selectSound.play(); selectDifficulty();});
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
    helpButton.on("pointerup", function(){if(musicOn) selectSound.play(); getHelp();});
    helpButton.on('pointerover', e=>e.target.alpha = 0.7);
    helpButton.on('pointerout', e=>e.currentTarget.alpha = 1.0);
    startScene.addChild(helpButton);
    
    // 1E - make the high score
    if(highScoreLabel == null)
    {
        highScoreLabel = new PIXI.Text("High Score: " + 0);
    }
    else
    {
        highScoreLabel = new PIXI.Text("High Score: " + highScore);
    }
    highScoreLabel.style = new PIXI.TextStyle({
        fill: labelFillColor,
        fontSize: 21,
        fontFamily: 'FuturaHand, arial, sans-serif',
        stroke: labelStrokeColor,
        strokeThickness: 3
    });
    highScoreLabel.x = sceneWidth/2 - 90;
    highScoreLabel.y = sceneHeight - 40;
    startScene.addChild(highScoreLabel);
    
    // 2 - set up the 'difficulty scene'
    let topLabel = new PIXI.Text("Where's Alaska?");
    topLabel.style = new PIXI.TextStyle({
        fill: labelFillColor,
        fontSize: 72,
        fontFamily: 'FuturaHand, arial, sans-serif',
        stroke: labelStrokeColor,
        strokeThickness: 5
    });
    topLabel.x = sceneWidth/2 - 270;
    topLabel.y = 120;
    diffScene.addChild(topLabel);
    
    // 2A - set up the Dan Button
    let danButton = new PIXI.Text("Dan");
    danButton.style = buttonStyle;
    danButton.x = sceneWidth/2 - 50;
    danButton.y = sceneHeight/2;
    danButton.interactive = true;
    danButton.buttonMode = true;
    danButton.cursor = 'url(images/point.png) 8 8, pointer';
    danButton.on("pointerup", function() {if(musicOn) selectSound.play(); time = danTime; goBackToMain();});
    danButton.on('pointerover', e=>{e.target.alpha = 0.7; danLabel.visible = true;});
    danButton.on('pointerout', e=>{e.currentTarget.alpha = 1.0; danLabel.visible = false;});
    diffScene.addChild(danButton);
    
    // 2B - set up the Dan Button Label
    let danLabel = new PIXI.Text("Easy mode. Timer is set at 20 seconds");
    danLabel.style = buttonLabelStyle;
    danLabel.x = sceneWidth/2 - 210;
    danLabel.y = sceneHeight/2 - 60;
    danLabel.visible = false;
    diffScene.addChild(danLabel);
    
    // 2C - set up the Normal Button
    let normalButton = new PIXI.Text("Normal");
    normalButton.style = buttonStyle;
    normalButton.x = sceneWidth/2 - 80;
    normalButton.y = sceneHeight/2 + 80;
    normalButton.interactive = true;
    normalButton.buttonMode = true;
    normalButton.cursor = 'url(images/point.png) 8 8, pointer';
    normalButton.on("pointerup", function() {if(musicOn) selectSound.play(); time = normalTime; goBackToMain();});
    normalButton.on('pointerover', e=>{e.target.alpha = 0.7; normalLabel.visible = true;});
    normalButton.on('pointerout', e=>{e.currentTarget.alpha = 1.0; normalLabel.visible = false;});
    diffScene.addChild(normalButton);
    
    // 2D - set up the Normal Button label
    let normalLabel = new PIXI.Text("Normal mode. Timer is set at 10 seconds");
    normalLabel.style = buttonLabelStyle;
    normalLabel.x = sceneWidth/2 - 230;
    normalLabel.y = sceneHeight/2 - 60;
    normalLabel.visible = false;
    diffScene.addChild(normalLabel);
    
    // 2E - set up the I LIVE in Alaska Button
    let alaskaButton = new PIXI.Text("I LIVE in Alaska");
    alaskaButton.style = buttonStyle;
    alaskaButton.x = sceneWidth/2 - 170;
    alaskaButton.y = sceneHeight/2 + 160;
    alaskaButton.interactive = true;
    alaskaButton.buttonMode = true;
    alaskaButton.cursor = 'url(images/point.png) 8 8, pointer';
    alaskaButton.on("pointerup", function() {if(musicOn) selectSound.play(); time = alaskaTime; goBackToMain();});
    alaskaButton.on('pointerover', e=>{e.target.alpha = 0.7; alaskaLabel.visible = true;});
    alaskaButton.on('pointerout', e=>{e.currentTarget.alpha = 1.0; alaskaLabel.visible = false;});
    diffScene.addChild(alaskaButton);
    
    // 2F - set up the I LIVE in Alaska button label
    let alaskaLabel = new PIXI.Text("Hard mode. Timer is set at 5 seconds");
    alaskaLabel.style = buttonLabelStyle;
    alaskaLabel.x = sceneWidth/2 - 210;
    alaskaLabel.y = sceneHeight/2 - 60;
    alaskaLabel.visible = false;
    diffScene.addChild(alaskaLabel);
    
    // 3 - set up the help scene
    
    // 3A - set up the help labels
    let helpText = [];
    helpText.push(new PIXI.Text("Where in the world is Alaska? \n"));
    helpText.push(new PIXI.Text("Who knows? But it's your job to find out! \n"));
    helpText.push(new PIXI.Text("Click and drag states to move them around. \n"));
    helpText.push(new PIXI.Text("Double-click on Alaska to advance! \n"));
    helpText.push(new PIXI.Text("If you're wrong, the timer goes faster! \n"));
    helpText.push(new PIXI.Text("Right click on states to remove them! \n"));
    helpText.push(new PIXI.Text("If you right click on Alaska, GAME OVER! \n"));
    helpText.push(new PIXI.Text("Are you a professional cartographer?* \n"));
    helpText.push(new PIXI.Text("Or are you just a Dan? \n"));
    helpText.push(new PIXI.Text("* Or a regular human being. \n"))
    for(let text = 0; text < helpText.length; text++)
    {
        helpText[text].style = helpTextStyle;
        helpText[text].y = 30 + 60*text;
        
        switch(text)
        {
            case 0:
                helpText[text].x = 85;
                break;
            case 1:
                helpText[text].x = 15;
                break;
            case 2:
                helpText[text].x = 15;
                break;
            case 3:
                helpText[text].x = 55;
                break;
            case 4:
                helpText[text].x = 35;
                break;
            case 5:
                helpText[text].x = 50;
                break;
            case 6:
                helpText[text].x = 15;
                break;
            case 7:
                helpText[text].x = 25;
                break;
            case 8:
                helpText[text].x = 125;
                break;
            case 9:
                helpText[text].x = sceneWidth/2 - 120;
                helpText[text].style = helpTextStyleMini;
                helpText[text].y = sceneHeight - 20;
                break;
            
        }
        
            
        helpScene.addChild(helpText[text]);
    }
    
    // 3B - create the back button
    let backButton = new PIXI.Text("Back");
    backButton.style = buttonStyle;
    backButton.x = sceneWidth - 120;
    backButton.y = sceneHeight - 70;
    backButton.interactive = true;
    backButton.buttonMode = true;
    backButton.cursor = 'url(images/point.png) 8 8, pointer';
    backButton.on("pointerup", function(){ if(musicOn) selectSound.play(); goBackToMain();});
    backButton.on('pointerover', e=>e.target.alpha = 0.7);
    backButton.on('pointerout', e=>e.currentTarget.alpha = 1.0);
    helpScene.addChild(backButton);

    
    // 4 - set up 'gameScene'
    let textStyle = new PIXI.TextStyle({
        fill: labelFillColor,
        fontSize: 18,
        fontFamily: 'FuturaHand',
        stroke: labelStrokeColor,
        strokeThickness: 4
    });

    // 4A - make score label
    scoreLabel = new PIXI.Text();
    scoreLabel.style = new PIXI.TextStyle({
        fill:labelFillColor,
        fontSize: 21,
        fontFamily: 'FuturaHand',
        stroke: labelStrokeColor,
        strokeThickness: 3
    });;
    scoreLabel.x = sceneWidth/2 - 40;
    scoreLabel.y = sceneHeight - 40;
    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);
    
    // 5 - set up 'gameOverScene'
    // 5A - make game over text
    let gameOverText = new PIXI.Text("Game Over!");
    textStyle = new PIXI.TextStyle({
        fill: labelFillColor,
        fontSize: 64,
        fontFamily: 'FuturaHand',
        stroke: labelStrokeColor,
        strokeThickness: 6
    });
    gameOverText.style = textStyle;
    gameOverText.x = sceneWidth/2 - 150;
    gameOverText.y = sceneHeight/2 - 150;
    gameOverScene.addChild(gameOverText);

    // 5B - make "play again?" button
    let playAgainButton = new PIXI.Text("Play Again?");
    playAgainButton.style = buttonStyle;
    playAgainButton.x = sceneWidth/2 - 120;
    playAgainButton.y = sceneHeight - 70;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup", startGame);
    playAgainButton.on('pointerover', e=>e.target.alpha = .7);
    playAgainButton.on('pointerout', e=>e.currentTarget.alpha = 1.0);
    gameOverScene.addChild(playAgainButton);
    
    // 5C - make a back to menu button
    let backToMenuButton = new PIXI.Text("Back to Menu");
    backToMenuButton.style = buttonStyle;
    backToMenuButton.x = sceneWidth/2 - 140;
    backToMenuButton.y = sceneHeight - 140;
    backToMenuButton.interactive = true;
    backToMenuButton.buttonMode = true;
    backToMenuButton.on("pointerup", goBackToMain);
    backToMenuButton.on('pointerover', e=>e.target.alpha = .7);
    backToMenuButton.on('pointerout', e=>e.currentTarget.alpha = 1.0);
    gameOverScene.addChild(backToMenuButton);
    
    // 6 - create a game over score display
    gameOverScoreLabel = new PIXI.Text();
    gameOverScoreLabel.style = scoreStyle;
    gameOverScoreLabel.x = sceneWidth/2 - 130;
    gameOverScoreLabel.y = sceneHeight/2 - 10;
    gameOverScene.addChild(gameOverScoreLabel);
    
    // 7 - create the game over high score display
    gameOverHighScoreLabel = new PIXI.Text();
    gameOverHighScoreLabel.style = scoreStyle;
    gameOverHighScoreLabel.x = sceneWidth/2 - 130;
    gameOverHighScoreLabel.y = sceneHeight/2 + 70;
    gameOverScene.addChild(gameOverHighScoreLabel);
    
    // 8 - create the volume button
    let musicButton = new PIXI.Sprite(musicOnLabel);
    musicButton.buttonMode = true;
    musicButton.cursor = 'url(images/point.png) 8 8, pointer';
    musicButton.anchor.set(0.5);
    musicButton.position.x = sceneWidth - 30;
    musicButton.position.y = 30;
    musicButton.interactive = true;
    musicButton.on('pointerup', 
        function()
        {
            if(this.texture == musicOnLabel)
            {
                this.texture = musicOffLabel;
                
                // turn off all current music
                stopAllMusic();
                
                musicOn = false;
            }
            else if(this.texture = musicOffLabel)
            {
                this.texture = musicOnLabel;
                
                musicOn = true;
            }
        }
    );
    musicButton.on('pointerover', e=>e.target.alpha = .7);
    musicButton.on('pointerout', e=>e.currentTarget.alpha = 1.0);
    
    startScene.addChild(musicButton);
    
}

// clicking the button calls startGame()
function startGame()
{
    currStates = [];
    gameOverScene.removeChild(alaska);
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    levelNum = 1;
    score = 0;
    life = 100;
    increaseScoreBy(0);
    if(musicOn)
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

function stopAllMusic()
{
    for(let track of music)
    {
        track.stop();
    }
}

function increaseScoreBy(value)
{
    score += value;
    scoreLabel.text = 'Score    ' + score;
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
    if(musicOn)
    {
        if(timer.time == danTime && dPressed)
        {
            danRight.play();
        }
        else
        {
            correctSound.play();   
        }
    }
    endLevel();
    levelNum++;
    
    // add to the score
    // add to the score
    if(timer.time == danTime)
        score += Math.floor((timer.width/timer.originalWidth) * 100);
    else if(timer.time == normalTime)
        score += Math.floor((timer.width/timer.originalWidth) * 200);
    else if(timer.time == alaskaTime)
        score += Math.floor((timer.width/timer.originalWidth) * 300);
    
    newLevel(levelNum);
}

function endLevel(keepAlaska = false)
{
    if(keepAlaska) {
        alaska.interactive = false;
        gameOverScene.addChild(alaska);
    }
    
    paused = true;
    
    // clear out level
    currStates.forEach(c=>gameScene.removeChild(c));
    currStates = [];
    
    // remove the timer
    gameScene.removeChild(timer);
    gameScene.removeChild(alaska);
    
    // update the high score in local storage
    if(score > highScore)
    {
        highScore = score;
        localStorage.setItem(scoreKey, score);
    }

}

function newLevel(levelNum) {
    alaska = new State(-1, alaskaTexture, startNextLevel, releaseStates);
    randomlyPlaceState(alaska);
    
    for(let i = 0; i < levelNum * 5; i++) {
        let randStateNum = Math.floor(Math.random()*states.length);
        let currState = new State(randStateNum, states[randStateNum], penalize, releaseStates);
        randomlyPlaceState(currState);
    }
    
    // create the timer
    timer = new Timer(sceneWidth, time);
    gameScene.addChild(timer);
    
}

function releaseStates() {
    for(var state of currStates) {
        state.isMouseTarget = false;
    }
    alaska.isMouseTarget = false;
}

function randomlyPlaceState(currState) {
    currStates.push(currState);
    currState.x = Math.random() * (sceneWidth - 100) + 50;
    currState.y = Math.random() * (sceneHeight - 100) + 50;
    gameScene.addChild(currState);
}

function end(){
    endLevel(true);
    if(musicOn)
    {   
        gameMusic.stop();
        gameOverSound.play();
    }
    gameOverScene.visible = true;
    gameScene.visible = false;
}

function penalize()
{
    if(musicOn)
    {
        if(timer.time == danTime && dPressed)
        {    
            danWrong.play();
        }
        else
        {
            wrongSound.play();
        }
    }
    
    timer.multiplier += 0.5;
}

function gameLoop()
{
    // START SCENE CODE
    // update the high score label
    if(startScene.visible == true)
    {
        highScoreLabel.text = "High Score : " + highScore;
    }
    
    // GAME SCENE CODE
    // keep track of the timer
    if(timer && gameScene.visible == true)
    {
        if(timer.width > 0)
            timer.countdown();
        
        if(timer.width <= 0 && gameOverScene.visible == false)
            end();
    }
    
    // update the score for game scene
    scoreLabel.text = "Score: " + score;
    
    // GAME OVER SCENE CODE
    if(gameOverScene.visible == true)
    {
        gameOverScoreLabel.text = "Final Score: " + score;
        gameOverHighScoreLabel.text = "High Score: " + highScore;
    }
}
