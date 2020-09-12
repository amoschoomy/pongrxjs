import { interval, fromEvent, from, zip, NextObserver, ObjectUnsubscribedError, Observable, timer, of, merge, pipe } from 'rxjs'
import { map, scan, filter, flatMap, take, concat, takeUntil, takeWhile, groupBy, repeat, startWith, switchMap, first, publish, last, reduce,} from 'rxjs/operators'

//Class RNG to generate pseudorandom numbers
//Taken from Week 4 Tutorial FIT2102 
class RNG {
  // LCG using GCC's constants
  m = 0x80000000// 2**31
  a = 1103515245
  c = 12345
  state
  constructor(seed) {
    this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1));
  }
  nextInt() {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state;
  }
  nextFloat() {
    // returns in range [0,1]
    return this.nextInt() / (this.m - 1);
  }
}

//Interface for ball state
type BallState=Readonly<{
  yvelocity:number
  xvelocity:number 
  speedBall:number
}>

//Interface for player and computer score
type Scores=Readonly<{
  playerscore:number
  computerscore:number
}>

//Interface for state of the paddle
type PaddleState=Readonly<{
  xpos:number
  ypos:number
}>



//class for human paddle
class Human{constructor(public readonly paddle:HTMLElement){}}

//class for AI paddle, difficulty is default unless specified by user
class AI{constructor(public readonly paddle:HTMLElement,public readonly difficulty=1){}}

type Controller= AI|Human

// Math vector calculations for ball x velocity and y velocity
//Referenced from:
//https://www.reddit.com/r/learnprogramming/comments/q7jl3/pong_ball_deflection/c3vh3p2/?context=8&depth=9
class Vector{
  constructor(public readonly xspeed: number = 0,public readonly yspeed: number = 0,public readonly paddle:HTMLElement,public readonly posballY: number,public readonly ballSpeed:number){}
  readonly currentSpeed=():number=>Math.sqrt(this.xspeed*this.xspeed+this.yspeed*this.yspeed)
  readonly angle=():number=>((this.posballY-Number(this.paddle.getAttribute("y"))+25)/(10*0.428+Math.PI/2))
  readonly vx=():number=>-Math.sign(this.xspeed)*Math.sin(this.angle())*this.currentSpeed()
  readonly vy=():number=>Math.cos(this.angle())*this.currentSpeed()
  readonly ballVelocity=():number=>Math.sqrt(Math.pow(this.vx()*this.ballSpeed,2)+Math.pow(this.vy()*this.ballSpeed,2))


}


//Function to reset ball attributes
const resetBall=(ball:HTMLElement)=>{
  ball.setAttribute("cx","300")
  ball.setAttribute("cy","300")
  ball.setAttribute("vx",String(new RNG(69).nextFloat()*4-1))
  ball.setAttribute("vy",String(new RNG(126).nextFloat()*4-1))
}

//Pong function to run the game
function pong():void {
    // Inside this function you will use the classes and functions 
    // from rx.js
    // to add visuals to the svg element in pong.html, animate them, and make them interactive.
    // Study and complete the tasks in observable exampels first to get ideas.
    // Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/ 
    // You will be marked on your functional programming style
    // as well as the functionality that you implement.
    // Document your code!  



    //Get other elements from HTML
    const ball=document.getElementById("ball")
    const playerpaddle=document.getElementById("player")
    const computerpaddle=document.getElementById("computer")
    

    //Obseravble stream for keyboard input
    //arrow up movement
    const arrowUp=fromEvent(document,"keydown").
    pipe(filter((x:KeyboardEvent)=>x.key=="ArrowUp")).
    pipe(filter(x=>Number(playerpaddle.getAttribute("y"))>5)).
    pipe(map((x)=>(-10)))

    //Observable stream for keyboard input
    //arrow down movement
    const arrowDown=fromEvent(document,'keydown').
    pipe(filter((x:KeyboardEvent)=>x.key=="ArrowDown")).
    pipe(filter(x=>Number(playerpaddle.getAttribute("y"))<545)).
    pipe(map(x=>(10)))

    //Function to update player paddle movement
    const movement=(x:number,paddle:PaddleState):PaddleState=>{
      return{
        xpos:paddle.xpos,
        ypos:paddle.ypos+x
      }
    }

    //Initial state of player paddle: Following HTML hardcoded value
    const initialPlayerPaddleState:PaddleState={
      xpos:20,
      ypos:300
    }

    //Initial State of player paddle: Following HTML hardcoded value
    const initialAIPaddleState:PaddleState={
      xpos:550,
      ypos:280
    }


    //Merge the keyboard input stream together and subscribe to movement function
    //Uses the scan function where it will accumulate value at each key arrow movement and released for the paddle to move
    const paddlemovement=merge(arrowUp,arrowDown).
    pipe(scan((x:PaddleState,y:number)=>movement(y,x),initialPlayerPaddleState)).
    subscribe(x=>playerpaddle.setAttribute("y",String(x.ypos)))
    


    //Creates scoreboard at canvas //Function can be found at line 290++
    scoreboard()

    const playerscore=document.getElementById("playerscore")
    const aiscore=document.getElementById("computerscore")

    //Initial state of player scores
    const initialScore:Scores={
      playerscore:0,
      computerscore:0
    }

    //Ball reflection referecned from:
    //https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript/Bounce_off_the_walls

    //Function to modify physics of the state of ball, takes in a State type and returns a State object
    const physics=(s:BallState)=>(user:Controller,user2:Controller):BallState=>
    {
      if (Number(ball.getAttribute("cy"))>589||Number(ball.getAttribute("cy"))<11) //If ball touches the top and bottom wall, reverse y velocity
      return{
        yvelocity:-s.yvelocity,
        xvelocity:s.xvelocity,
        speedBall:s.speedBall
      }

      // Logic of ball collision of paddle referenced from
      //https://www.informit.com/articles/article.aspx?p=2180417&seqNum=2
        
        //Each condition checks for player paddle  colliision with ball depending on pos of ball and paddle.
        if(Number(ball.getAttribute("cx"))<(Number(user.paddle.getAttribute("x"))+Number(ball.getAttribute("r"))+Number(user.paddle.getAttribute("width"))+1)
        &&(
        (Number(ball.getAttribute("cx"))+1+Number(ball.getAttribute("r"))+Number(user.paddle.getAttribute("width"))+1>Number(user.paddle.getAttribute("x"))))
        &&(Number(ball.getAttribute("cy"))+Number(ball.getAttribute("r"))+4>Number(user.paddle.getAttribute("y")))&&
        Number(ball.getAttribute("cy"))<Number(user.paddle.getAttribute("y"))+Number(ball.getAttribute("r"))+4+Number(user.paddle.getAttribute("height"))){ 
        return {
          yvelocity:new Vector(s.xvelocity,s.yvelocity,user.paddle,Number(ball.getAttribute("cy")),s.speedBall).vy(),
          xvelocity:new Vector(s.xvelocity,s.yvelocity,user2.paddle,Number(ball.getAttribute("cy")),s.speedBall).vx(),
          speedBall:s.speedBall
        } }

        //Same logic applied to user 2
        if((Number(ball.getAttribute("cx"))<(Number(user2.paddle.getAttribute("x"))+1+Number(ball.getAttribute("r"))+Number(user.paddle.getAttribute("width")))
        &&(
        (Number(ball.getAttribute("cx"))+Number(ball.getAttribute("r"))+Number(user.paddle.getAttribute("width"))+1>Number(user2.paddle.getAttribute("x"))))&&
        (Number(ball.getAttribute("cy"))+Number(ball.getAttribute("r"))+4>Number(user2.paddle.getAttribute("y")))&&
        Number(ball.getAttribute("cy"))<Number(user2.paddle.getAttribute("y"))+Number(ball.getAttribute("r"))+4+Number(user.paddle.getAttribute("height"))))

        { return{
          yvelocity:new Vector(s.xvelocity,s.yvelocity,user2.paddle,Number(ball.getAttribute("cy")),s.speedBall).vy(),
          xvelocity:new Vector(s.xvelocity,s.yvelocity,user2.paddle,Number(ball.getAttribute("cy")),s.speedBall).vx(),
          speedBall:s.speedBall
        }
      }
      else{ //if no colliison remain original state
        return s
      }
    }



    //startGame$ observable created using interval. Interval emits numbers over a specified amount of time,
    //In game logic is basically how fast is the game frame.

    //takeWhile refers to the endgame condition of the game, which either player have to get a score of 7 before the game(observable) ends
    // Repeat the observable if "Restart Game" button is clicked
    const startGame$=interval(60).pipe(takeWhile(x=>(Number(aiscore.getAttribute("value"))<7 && Number(playerscore.getAttribute("value"))<7))).pipe(repeat())

    //This is the logic for ball out of canvas. If the ball is out of canvas, we reset the ball position
    startGame$.pipe(filter(x=>(Number(ball.getAttribute("cx"))>590) || Number(ball.getAttribute("cx"))<10)).subscribe(x=>{resetBall(ball)})
  
    //AI movement following the ball, going upwards movement
    startGame$.pipe(map((x:number)=>({x:Number(ball.getAttribute("cx")),y:Number(ball.getAttribute("cy"))}))).
    subscribe(obj=>Number(computerpaddle.getAttribute("y"))<0?computerpaddle.setAttribute("y",String(obj.y-20)):computerpaddle.setAttribute("y",String(-obj.y-20)))

    //AI movement following the ball, going downwards movement
    startGame$.pipe(map((x:number)=>({x:Number(ball.getAttribute("cx")),y:Number(ball.getAttribute("cy"))}))).
    subscribe((obj)=>Number(computerpaddle.getAttribute("y"))<545?computerpaddle.setAttribute("y",String(obj.y-20)):computerpaddle.setAttribute("y",String(-obj.y-20)))


    const aiplayer=new AI(document.getElementById("computer"),1) //ai paddle object
    const humanplayer=new Human(document.getElementById("player")) //player paddle object


    //This is for ball movement
    //First we map the observable to the current ball State
    //Apply physics function to the current ball state
    //Result of the function, we apply the values to the ball to move the ball accordingly
    const ballMovement=startGame$.pipe(map(x=>({yvelocity:Number(ball.getAttribute("vy")),
    xvelocity:Number(ball.getAttribute("vx")),
    speedBall:6,}))).
    pipe(map((x:BallState)=>physics(x)(humanplayer,aiplayer))).
    subscribe((x:BallState)=>{
    ball.setAttribute("cx",String(Number(ball.getAttribute("cx"))+x.xvelocity*x.speedBall)),
    ball.setAttribute("cy",String((Number(ball.getAttribute("cy")))+x.yvelocity*x.speedBall)),
    ball.setAttribute("vy",String(x.yvelocity)),
    ball.setAttribute("vx",String(x.xvelocity))
  })


    //update score when player win the round, if the ball is past the canvas of CPU side, then we update the score for player
    //using updateScoreboard and update score function --- details of the functions below
    startGame$ .pipe(filter((x:number)=>Number(ball.getAttribute("cx"))>590))
    .subscribe((x:number)=>(updateScoreboard(updatescore({playerscore:Number(playerscore.getAttribute("value")),computerscore:Number(aiscore.getAttribute("value"))})(playerscore))))
  
 
    //update score when CPU win the round, if the ball is past the canvas of player side, then we update the score for player
    //using updateScoreboard and update score function --- details of the functions below
    startGame$ .pipe(filter((x:number)=>Number(ball.getAttribute("cx"))<10))
    .subscribe((x:number)=>(updateScoreboard(updatescore(
      {playerscore:Number(playerscore.getAttribute("value")),
    computerscore:Number(aiscore.getAttribute("value"))
  }
    )(aiscore))))


    const restart=document.getElementById("restart") //Get restart game button element from HTML

    //Creates an mouse event observable that subsribes on click of the restart game button. 
    //Resets the scoreboard
    //Resets the ball position
    fromEvent(restart,"click").subscribe((x:Event)=>{resetScoreboard(),resetBall(document.getElementById("ball"))})
    
    
  
  
  }




  //Function to construct the scoreboard on webpage
  //Appends element to webpage,
  function scoreboard():void {
    const div=document.getElementById("game")
    const playerScore=document.createElement("number")
    playerScore.setAttribute("value","0")
    playerScore.setAttribute("id","playerscore")
    div.append(playerScore)
    playerScore.innerHTML="Player Score: "+ playerScore.getAttribute("value")
    const computerScore=document.createElement("number")
    computerScore.style.marginLeft="15%"
    computerScore.setAttribute("value","0")
    computerScore.setAttribute("id","computerscore")
    computerScore.innerHTML="Computer Score: " + computerScore.getAttribute("value")
    div.appendChild(computerScore)}
  
  //function to update score of player or cpu
  //takes in a score state and then paddle to return update score state  
  const updatescore=(s:Scores)=>(winner:HTMLElement):Scores=>{
    if (winner.id==="playerscore")
    return{
      playerscore:s.playerscore+1,
      computerscore:s.computerscore
    }
    else{
      return{
        playerscore:s.playerscore,
        computerscore:s.computerscore+1
      }
    }
  }

  //update scoreboard html using score state
  const updateScoreboard=(s:Scores):void=>{
    const playerscore=document.getElementById("playerscore")
    const aiscore=document.getElementById("computerscore")
    playerscore.innerHTML="Player Score: "+ s.playerscore
    aiscore.innerHTML="Computer Score: "+ s.computerscore
    playerscore.setAttribute("value",String(s.playerscore))
    aiscore.setAttribute("value",String(s.computerscore))
  }

  //Reset scoreboard in the event of someone restarting game. Resets HTML elements in scoreboard
  const resetScoreboard=():void=>{
    const playerscore=document.getElementById("playerscore")
    const aiscore=document.getElementById("computerscore")
    playerscore.innerHTML="Player Score: "+ 0
    aiscore.innerHTML="Computer Score: "+ 0
    playerscore.setAttribute("value","0")
    aiscore.setAttribute("value","0")

  }

  
  // the following simply runs your pong function on window load.  Make sure to leave it in place.
  if (typeof window != 'undefined')
    window.onload = ()=>{
      fromEvent(document.getElementById("start"),"click").pipe(take(1)).subscribe(x=>pong()) // //start game button needs to be clicked to start game
      //Can only be clicked once      


    }
  
  

