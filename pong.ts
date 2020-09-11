// import { observable, Observable, of, Subscriber } from "rxjs";
// import { interval, fromEvent, merge, from, zip, NextObserver, ObjectUnsubscribedError,timer } from 'rxjs'
// import { ComplexOuterSubscriber } from "rxjs/internal/innerSubscribe";
// import { map, scan, filter, flatMap, take, concat, takeUntil, takeWhile, groupBy} from 'rxjs/operators'
import { interval, fromEvent, from, zip, NextObserver, ObjectUnsubscribedError, Observable, timer, of, merge, pipe } from 'rxjs'
import { map, scan, filter, flatMap, take, concat, takeUntil, takeWhile, groupBy, repeat, startWith, switchMap, first, publish, last, reduce,} from 'rxjs/operators'


//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomArbitrary(min:number, max:number):number { 
  return Math.random() * (max - min) + min;
}


type State=Readonly<{
  yvelocity:number
  xvelocity:number 
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
  readonly angle=()=>((this.posballY-Number(this.paddle.getAttribute("y"))+25)/(10*0.428+Math.PI/2))
  readonly vx=()=>-Math.sign(this.xspeed)*Math.sin(this.angle())*this.currentSpeed()
  readonly vy=()=>Math.cos(this.angle())*this.currentSpeed()
  readonly ballVelocity=()=>Math.sqrt(Math.pow(this.vx()*this.ballSpeed,2)+Math.pow(this.vy()*this.ballSpeed,2))


}

const resetBall=(ball:HTMLElement)=>{
  ball.setAttribute("cx","300")
  ball.setAttribute("cy","300")
  ball.setAttribute("vx","2")
  ball.setAttribute("vy","-3")
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

    ball.setAttribute("vx","2")
    ball.setAttribute("vy","-3")
    const initialState:State=
    {yvelocity:Number(ball.getAttribute("vy")),
      xvelocity:Number(ball.getAttribute("vx")),
      speedBall:2,
  
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
        yvelocity:-s.yvelocity,
        xvelocity:s.xvelocity,
        speedBall:s.speedBall
      }


      if (user instanceof Human
        
      &&(Number(ball.getAttribute("cx"))<(Number(playerpaddle.getAttribute("x"))+10+11)&&(
      (Number(ball.getAttribute("cx"))+10+11>Number(playerpaddle.getAttribute("x"))))&&(Number(ball.getAttribute("cy"))+11+3>Number(playerpaddle.getAttribute("y")))&&
      Number(ball.getAttribute("cy"))<Number(playerpaddle.getAttribute("y"))+11+3+50)){ 
      return {
        yvelocity:new Vector(s.xvelocity,s.yvelocity,playerpaddle,Number(ball.getAttribute("cy")),s.speedBall).vy(),
        xvelocity:new Vector(s.xvelocity,s.yvelocity,computerpaddle,Number(ball.getAttribute("cy")),s.speedBall).vx(),
        speedBall:s.speedBall
      } }
     
      if(user2 instanceof AI&& (Number(ball.getAttribute("cx"))<(Number(computerpaddle.getAttribute("x"))+10+11)&&(
        (Number(ball.getAttribute("cx"))+10+11>Number(computerpaddle.getAttribute("x"))))&&(Number(ball.getAttribute("cy"))+11+3>Number(computerpaddle.getAttribute("y")))&&
        Number(ball.getAttribute("cy"))<Number(computerpaddle.getAttribute("y"))+11+3+50))
        { return{
          yvelocity:new Vector(s.xvelocity,s.yvelocity,computerpaddle,Number(ball.getAttribute("cy")),s.speedBall).vy(),
          xvelocity:new Vector(s.xvelocity,s.yvelocity,computerpaddle,Number(ball.getAttribute("cy")),s.speedBall).vx(),
         
          speedBall:s.speedBall
        }
      }
      else{
        return s
      }
    }

    const restartGame=fromEvent

    //Endgame condition
    const startGame$=interval(60).pipe(takeWhile(x=>(Number(aiscore.getAttribute("value"))<7 && Number(playerscore.getAttribute("value"))<7))).pipe(repeat())
    startGame$.pipe(filter(x=>(Number(ball.getAttribute("cx"))>590) || Number(ball.getAttribute("cx"))<10)).subscribe(x=>{resetBall(ball)})
  
    //AI movement
    startGame$.pipe(map(x=>({x:Number(ball.getAttribute("cx")),y:Number(ball.getAttribute("cy"))}))).subscribe(obj=>Number(computerpaddle.getAttribute("y"))<0?computerpaddle.setAttribute("y",String(obj.y-20)):computerpaddle.setAttribute("y",String(-obj.y-20)))
    startGame$.pipe(map(x=>({x:Number(ball.getAttribute("cx")),y:Number(ball.getAttribute("cy"))}))).subscribe(obj=>Number(computerpaddle.getAttribute("y"))<545?computerpaddle.setAttribute("y",String(obj.y-20)):computerpaddle.setAttribute("y",String(-obj.y-20)))

    // const toggleStream=interval(60).pipe(map(x=>Number(ball.getAttribute("cx"))>590 || Number(ball.getAttribute("cx"))<10))
    // const resultStream=toggleStream.pipe(filter(x=>x==true)).subscribe(x=>startGame$.takeUntil(toggleStream))

    const playerscore=document.getElementById("playerscore")
    const aiscore=document.getElementById("computerscore")

    //This is for ball movement
      // const ballMovement=startGame$.pipe(scan((x:State)=>physics(x)(new Human(playerpaddle),new AI(computerpaddle,1)),initialState)).pipe(takeWhile(x=>(Number(ball.getAttribute("cx"))<590) && Number(ball.getAttribute("cx"))>10))    //.subscribe(x=>(ball.setAttribute("cx",String(Number(ball.getAttribute("cx"))+x.xvelocity*x.speedBall)),ball.setAttribute("cy",String((Number(ball.getAttribute("cy")))+x.yvelocity*x.speedBall))))
    const ballMovement=startGame$.pipe(map(x=>({yvelocity:Number(ball.getAttribute("vy")),
    xvelocity:Number(ball.getAttribute("vx")),
    speedBall:7,}))).pipe(map(x=>physics(x)(new Human(playerpaddle),new AI(computerpaddle,1)))).
    subscribe(x=>{
    ball.setAttribute("cx",String(Number(ball.getAttribute("cx"))+x.xvelocity*x.speedBall)),
    ball.setAttribute("cy",String((Number(ball.getAttribute("cy")))+x.yvelocity*x.speedBall)),
    ball.setAttribute("vy",String(x.yvelocity)),
    ball.setAttribute("vx",String(x.xvelocity))
  })
    //update score when player win the round
    startGame$ .pipe(filter(x=>Number(ball.getAttribute("cx"))>590))
    .subscribe(x=>(updateScoreboard(updatescore({playerscore:Number(playerscore.getAttribute("value")),computerscore:Number(aiscore.getAttribute("value"))})(playerscore))))
  
 
    //update score when cpu win  the round
    startGame$ .pipe(filter(x=>Number(ball.getAttribute("cx"))<10))
    .subscribe(x=>(updateScoreboard(updatescore(
      {playerscore:Number(playerscore.getAttribute("value")),
    computerscore:Number(aiscore.getAttribute("value"))
  }
    )(aiscore))))

    // startGame$.pipe()
    const restart=document.getElementById("restart")
    fromEvent(restart,"click").subscribe(x=>{resetScoreboard(),resetBall(document.getElementById("ball"))})
    
    
  
  
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
    playerscore.setAttribute("value",String(s.playerscore))
    aiscore.setAttribute("value",String(s.computerscore))
  }

  const resetScoreboard=():void=>{
    const playerscore=document.getElementById("playerscore")
    const aiscore=document.getElementById("computerscore")
    playerscore.innerHTML="Player Score: "+ 0
    aiscore.innerHTML="Computer Score: "+ 0
    playerscore.setAttribute("value","0")
    aiscore.setAttribute("value","0")

  }
 

    
    // if(y + dy > canvas.height || y + dy < 0) {
    //   dy = -dy;
  
  // the following simply runs your pong function on window load.  Make sure to leave it in place.
  if (typeof window != 'undefined')
    window.onload = ()=>{
      fromEvent(document.getElementById("start"),"click").pipe(take(1)).subscribe(x=>pong())
      // fromEvent(document.getElementById("restart"),"click").subscribe(x=>(windowClear(),alert()))
      const restart=document.getElementById("restart")
      


    }
  
  

