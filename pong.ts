// import { observable, Observable, of, Subscriber } from "rxjs";
// import { interval, fromEvent, merge, from, zip, NextObserver, ObjectUnsubscribedError,timer } from 'rxjs'
// import { ComplexOuterSubscriber } from "rxjs/internal/innerSubscribe";
// import { map, scan, filter, flatMap, take, concat, takeUntil, takeWhile, groupBy} from 'rxjs/operators'
import { interval, fromEvent, from, zip, NextObserver, ObjectUnsubscribedError, Observable, timer, of, merge } from 'rxjs'
import { map, scan, filter, flatMap, take, concat, takeUntil, takeWhile, groupBy,} from 'rxjs/operators'


//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomArbitrary(min:number, max:number):number { 
  return Math.random() * (max - min) + min;
}


type State=Readonly<{
  yspeed:number
  xspeed:number 
  speedBall:number
}>

type Scores=Readonly<{
  playerscore:number
  computerscore:number
}>




class Human{constructor(public readonly paddle:HTMLElement){}}
class AI{constructor(public readonly paddle:HTMLElement,public readonly difficulty:number){}}

//https://www.reddit.com/r/learnprogramming/comments/q7jl3/pong_ball_deflection/c3vh3p2/?context=8&depth=9
class Vector{
  constructor(public readonly xspeed: number = 0,public readonly yspeed: number = 0,public readonly paddle:HTMLElement,public readonly posballY: number,public readonly ballSpeed:number){}
  readonly currentSpeed=()=>Math.sqrt(this.xspeed*this.xspeed+this.yspeed*this.yspeed)
  readonly angle=()=>((this.posballY-Number(this.paddle.getAttribute("y"))+25)/(10*0.5239+Math.PI/2))
  readonly xDirection=()=>-Math.sign(this.xspeed)*Math.sin(this.angle())
  readonly yDirection=()=>Math.sign(Math.cos(this.angle()))
  readonly ballVelocity=()=>Math.sqrt(Math.pow(this.xDirection()*this.ballSpeed,2)+Math.pow(this.yDirection()*this.ballSpeed,2))
}

function pong():void {
    // Inside this function you will use the classes and functions 
    // from rx.js
    // to add visuals to the svg element in pong.html, animate them, and make them interactive.
    // Study and complete the tasks in observable exampels first to get ideas.
    // Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/ 
    // You will be marked on your functional programming style
    // as well as the functionality that you implement.
    // Document your code!  



    const button=document.getElementById("start")
    const ball=document.getElementById("ball")
    const playerpaddle=document.getElementById("player")
    const computerpaddle=document.getElementById("computer")
    const arrowUp=fromEvent(document,"keydown").pipe(filter((x:KeyboardEvent)=>x.key=="ArrowUp")).pipe(map((x)=>(-10))).subscribe((x:number)=> (Number(playerpaddle.getAttribute("y"))>5?(playerpaddle.setAttribute("y",String(x+Number(playerpaddle.getAttribute("y"))))):0))
    const arrowDown=fromEvent(document,'keydown').pipe(filter((x:KeyboardEvent)=>x.key=="ArrowDown")).pipe(map(x=>(10))).subscribe((x:number)=> (Number(playerpaddle.getAttribute("y"))<545?(playerpaddle.setAttribute("y",String(x+Number(playerpaddle.getAttribute("y"))))):0))
    // const arrowRight=fromEvent(document,"keydown").pipe(filter((x:KeyboardEvent)=>x.key=="ArrowRight")).pipe(map(x=>10)).subscribe((x:number)=> (Number(playerpaddle.getAttribute("x"))<280?(playerpaddle.setAttribute("x",String(x+Number(playerpaddle.getAttribute("x"))))):0))
    // const arrowLeft=fromEvent(document,"keydown").pipe(filter((x:KeyboardEvent)=>x.key=="ArrowLeft")).pipe(map(x=>(-10))).subscribe((x:number)=> (Number(playerpaddle.getAttribute("x"))>0?(playerpaddle.setAttribute("x",String(x+Number(playerpaddle.getAttribute("x"))))):0))
    scoreboard()    
    const random=getRandomArbitrary(-1,1.01)
    const random2=getRandomArbitrary(-1,1.01)

    
    const initialState:State=
    {yspeed:2,
      xspeed:3,
      speedBall:1,
  
    }
    const initialScore:Scores={
      playerscore:0,
      computerscore:0
    }

    //https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript/Bounce_off_the_walls
    
    const physics=(s:State)=>(user:Human,user2:AI):State=>
    {
      if (Number(ball.getAttribute("cy"))>589||Number(ball.getAttribute("cy"))<11)
      return{
        yspeed:-s.yspeed,
        xspeed:s.xspeed,
        speedBall:s.speedBall
      }


      if (user instanceof Human
        
      &&(Number(ball.getAttribute("cx"))<(Number(playerpaddle.getAttribute("x"))+10+11)&&(
      (Number(ball.getAttribute("cx"))+10+11>Number(playerpaddle.getAttribute("x"))))&&(Number(ball.getAttribute("cy"))+11+3>Number(playerpaddle.getAttribute("y")))&&
      Number(ball.getAttribute("cy"))<Number(playerpaddle.getAttribute("y"))+11+3+50)){ 
      return {
        yspeed:new Vector(s.xspeed,s.yspeed,playerpaddle,Number(ball.getAttribute("cy")),s.speedBall).yDirection(),
        xspeed:-s.xspeed,
        speedBall:new Vector(s.xspeed,s.yspeed,playerpaddle,Number(ball.getAttribute("cy")),s.speedBall).ballVelocity()
      } }
     
      if(user2 instanceof AI&& (Number(ball.getAttribute("cx"))<(Number(computerpaddle.getAttribute("x"))+10+11)&&(
        (Number(ball.getAttribute("cx"))+10+11>Number(computerpaddle.getAttribute("x"))))&&(Number(ball.getAttribute("cy"))+11+3>Number(computerpaddle.getAttribute("y")))&&
        Number(ball.getAttribute("cy"))<Number(computerpaddle.getAttribute("y"))+11+3+50))
        { return{
          yspeed:new Vector(s.xspeed,s.yspeed,computerpaddle,Number(ball.getAttribute("cy")),s.speedBall).yDirection(),
          xspeed:-s.xspeed,
          speedBall:new Vector(s.xspeed,s.yspeed,computerpaddle,Number(ball.getAttribute("cy")),s.speedBall).ballVelocity()
        }
      }
      else{
        return s
      }
    }



//     (ball.position.X > (paddle.position.X - radius - paddle.Width / 2)) &&
// (ball.position.X < (paddle.position.X + radius + paddle.Width / 2)) &&
// (ball.position.Y < paddle.position.Y) &&
// (ball.position.Y > (paddle.position.Y - radius - paddle.Height / 2))



    //Observable to start game off with then will be subsscribed into various streams.

    const startGame$=interval(60).pipe(takeWhile(x=>(Number(ball.getAttribute("cx"))<590) && Number(ball.getAttribute("cx"))>10))
   


    //AI movement
    // startGame$.pipe(map(x=>({x:Number(ball.getAttribute("cx")),y:Number(ball.getAttribute("cy"))}))).subscribe(obj=>Number(computerpaddle.getAttribute("y"))<0?computerpaddle.setAttribute("y",String(obj.y+10)):computerpaddle.setAttribute("y",String(-obj.y-10)))
    // startGame$.pipe(map(x=>({x:Number(ball.getAttribute("cx")),y:Number(ball.getAttribute("cy"))}))).subscribe(obj=>Number(computerpaddle.getAttribute("y"))<545?computerpaddle.setAttribute("y",String(obj.y+10)):computerpaddle.setAttribute("y",String(-obj.y-10)))




    const playerscore=document.getElementById("playerscore")
    const aiscore=document.getElementById("computerscore")

    //This is for ball movement
    startGame$.pipe(scan((x:State)=>physics(x)(new Human(playerpaddle),new AI(computerpaddle,1)),initialState)).subscribe(x=>(ball.setAttribute("cx",String(Number(ball.getAttribute("cx"))+x.xspeed*x.speedBall)),ball.setAttribute("cy",String((Number(ball.getAttribute("cy")))+x.yspeed*x.speedBall))))

    startGame$ .pipe(filter(x=>Number(ball.getAttribute("cx"))>585))
    .subscribe(x=>(playerscore.setAttribute("value",String(Number(playerscore.getAttribute("value")))),updateScoreboard(updatescore({playerscore:Number(playerscore.getAttribute("value")),computerscore:Number(aiscore.getAttribute("value"))})(playerscore))))
  
 

    startGame$ .pipe(filter(x=>Number(ball.getAttribute("cx"))<15))
    .subscribe(x=>(updateScoreboard(updatescore(
      {playerscore:Number(playerscore.getAttribute("value")),
    computerscore:Number(aiscore.getAttribute("value"))
  }
    )(aiscore))))
  
  
  
  }

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

  const updateScoreboard=(s:Scores):void=>{
    const playerscore=document.getElementById("playerscore")
    const aiscore=document.getElementById("computerscore")
    playerscore.innerHTML="Player Score: "+ s.playerscore
    aiscore.innerHTML="Computer Score: "+ s.computerscore
  }

  
   
    
    // if(y + dy > canvas.height || y + dy < 0) {
    //   dy = -dy;
   
    
  
  
  // the following simply runs your pong function on window load.  Make sure to leave it in place.
  if (typeof window != 'undefined')
    window.onload = ()=>{
      pong();

    }
  
  

