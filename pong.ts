import { observable, Observable, of, Subscriber } from "rxjs";
import { interval, fromEvent, merge, from, zip, NextObserver, ObjectUnsubscribedError,timer } from 'rxjs'
import { ComplexOuterSubscriber } from "rxjs/internal/innerSubscribe";
import { map, scan, filter, flatMap, take, concat, takeUntil, takeWhile, groupBy} from 'rxjs/operators'


//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomArbitrary(min:number, max:number):number { 
  return Math.random() * (max - min) + min;
}

type State=Readonly<{
  yMovement:number
  xMovement:number 
  speed:number
}>

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
    score()    
    const random=getRandomArbitrary(-1,1.01)
    const random2=getRandomArbitrary(-1,1.01)

    
    const initialState:State=
    {yMovement:2,
      xMovement:-5,
      speed:2
    }
    const physics=(s:State):State=>{
      if (Number(ball.getAttribute("cy"))>589||Number(ball.getAttribute("cy"))<11)
      return{
        yMovement:-s.yMovement,
        xMovement:s.xMovement,
        speed:s.speed
      }
      if (Number(ball.getAttribute("cx"))<(Number(playerpaddle.getAttribute("x"))+10+11)&&(
      (Number(ball.getAttribute("cx"))+10+11>Number(playerpaddle.getAttribute("x"))))&&(Number(ball.getAttribute("cy"))+11+3>Number(playerpaddle.getAttribute("y")))&&
      Number(ball.getAttribute("cy"))<Number(playerpaddle.getAttribute("y"))+11+3+50){
      return{
        yMovement:s.yMovement,
        xMovement:-s.xMovement,
        speed:s.speed
      }}
      else{
        return s
      }
    }


//     (ball.position.X > (paddle.position.X - radius - paddle.Width / 2)) &&
// (ball.position.X < (paddle.position.X + radius + paddle.Width / 2)) &&
// (ball.position.Y < paddle.position.Y) &&
// (ball.position.Y > (paddle.position.Y - radius - paddle.Height / 2))



    //Observable to start game off with then will be subsscribed into various streams.

    const startGame$=interval(60).pipe(takeWhile(x=>(Number(ball.getAttribute("cx"))<600) && Number(ball.getAttribute("cx"))>0))
    // const startGame=interval(10).pipe(filter(x=>true))
    // pipe(map(x=>Number(ball.getAttribute("cx"))>Number(playerpaddle.getAttribute("cx"))?-Number(ball.getAttribute("cx")):Number(ball.getAttribute("cx")))).
    // subscribe(_=>(ball.setAttribute("cx",String(Number(ball.getAttribute("cx"))+_)),ball.setAttribute("cy",String(Number(ball.getAttribute("cy"))+(random>0 && random2<0?random2*-1:random2)))))
    // (takeWhile(_=>(Number(ball.getAttribute(cx"))<600)&&(Number(ball.getAttribute("cx"))>0))).

    //subscribe(x=>ball.setAttribute("cx",String(Number(ball.getAttribute("cx")+x))))

  


    //This is for ball movement
    startGame$.pipe(scan(physics,initialState)).subscribe(x=>(ball.setAttribute("cx",String(Number(ball.getAttribute("cx"))+x.xMovement*x.speed)),ball.setAttribute("cy",String((Number(ball.getAttribute("cy")))+x.yMovement*x.speed))))

    


    //Ball collision for y axis
    // startGame$.pipe(map(x=>Number(ball.getAttribute("cy")))).pipe(filter((y:number)=>y>589||y<11)).subscribe(x=>physics(initialState))

    // //Ball collision with player paddle
    // startGame$.pipe(map(x=>([Number(ball.getAttribute("cy")),Number(ball.getAttribute("cx")),Number(playerpaddle.getAttribute("x")),Number(playerpaddle.getAttribute("y"))]))).
    // pipe(filter((y:number[])=>y[1]-20<=y[2]))
    // .subscribe(x=>paddleLogic(initialState))
 


  
  
  }

  function score():void {
    const div=document.getElementById("game")
    const playerScore=document.createElement("number")
    playerScore.setAttribute("value","0")
    div.append(playerScore)
    playerScore.innerHTML="Player Score: "+ playerScore.getAttribute("value")
    const computerScore=document.createElement("number")
    computerScore.style.marginLeft="15%"
    computerScore.setAttribute("value","0")
    computerScore.innerHTML="Computer Score: " + computerScore.getAttribute("value")
    div.appendChild(computerScore)}
  

   
    
    // if(y + dy > canvas.height || y + dy < 0) {
    //   dy = -dy;
   
    
  
  
  // the following simply runs your pong function on window load.  Make sure to leave it in place.
  if (typeof window != 'undefined')
    window.onload = ()=>{
      pong();

    }
  
  

