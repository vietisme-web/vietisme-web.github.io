const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let players = {};
let monsters = {};
let playerId;
let speed = 5;

// handle mobile buttons
document.getElementById('up').addEventListener('click',()=>move(0,-speed));
document.getElementById('down').addEventListener('click',()=>move(0,speed));
document.getElementById('left').addEventListener('click',()=>move(-speed,0));
document.getElementById('right').addEventListener('click',()=>move(speed,0));

function move(dx,dy){
    if(players[playerId]){
        players[playerId].x += dx;
        players[playerId].y += dy;
        socket.emit('move',{x:players[playerId].x, y:players[playerId].y});
    }
}

// keyboard controls
document.addEventListener('keydown', e=>{
    if(e.key==='w') move(0,-speed);
    if(e.key==='s') move(0,speed);
    if(e.key==='a') move(-speed,0);
    if(e.key==='d') move(speed,0);
});

// draw loop
function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // draw monsters
    for(let id in monsters){
        let m = monsters[id];
        ctx.fillStyle='red';
        ctx.fillRect(m.x,m.y,20,20);
        ctx.fillStyle='black';
        ctx.fillText(`L${m.level}`,m.x,m.y-2);
    }

    // draw players
    for(let id in players){
        let p = players[id];
        ctx.fillStyle = id===playerId?'blue':'orange';
        ctx.fillRect(p.x,p.y,20,20);
        ctx.fillStyle='black';
        ctx.fillText(p.name,p.x,p.y-5);
    }

    requestAnimationFrame(draw);
}
draw();

// socket events
socket.on('init', data=>{
    players = data.players;
    playerId = socket.id;
    monsters = {};
    data.monsters.forEach(m=>monsters[m.id]=m);
});

socket.on('updatePlayers', data=>{
    players = data;
});

socket.on('updateMonsters', data=>{
    monsters = {};
    data.forEach(m=>monsters[m.id]=m);
});

socket.on('monsterKilled', data=>{
    if(data.drop) alert(`Monster dropped: ${data.drop}`);
});
