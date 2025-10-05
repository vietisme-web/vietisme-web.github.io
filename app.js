const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const tileSize = 40;
const mapWidth = 15;
const mapHeight = 15;

// simple map 0=grass,1=wall
let map = [];
for(let y=0;y<mapHeight;y++){
    let row=[];
    for(let x=0;x<mapWidth;x++){
        row.push(Math.random()<0.1?1:0); // 10% wall
    }
    map.push(row);
}

// player
let player = {x:1, y:1, hp:100, exp:0, level:1, inv:[]};

// monsters
let monsters = [];
function spawnMonster(){
    let x = Math.floor(Math.random()*mapWidth);
    let y = Math.floor(Math.random()*mapHeight);
    if(map[y][x]===0) monsters.push({x,y,hp:20,level:1});
}
for(let i=0;i<5;i++) spawnMonster();

// inventory
function addItem(item){
    player.inv.push(item);
    renderInventory();
}
function renderInventory(){
    let ul = document.getElementById('invList');
    ul.innerHTML='';
    player.inv.forEach(i=>{
        let li = document.createElement('li');
        li.innerText=i;
        ul.appendChild(li);
    });
}

// draw
function draw(){
    // map
    for(let y=0;y<mapHeight;y++){
        for(let x=0;x<mapWidth;x++){
            ctx.fillStyle=map[y][x]===0?'#9acd32':'#555';
            ctx.fillRect(x*tileSize,y*tileSize,tileSize,tileSize);
        }
    }

    // monsters
    monsters.forEach(m=>{
        ctx.fillStyle='red';
        ctx.fillRect(m.x*tileSize,m.y*tileSize,tileSize,tileSize);
        ctx.fillStyle='black';
        ctx.fillText(`L${m.level}`, m.x*tileSize+5, m.y*tileSize+15);
    });

    // player
    ctx.fillStyle='blue';
    ctx.fillRect(player.x*tileSize,player.y*tileSize,tileSize,tileSize);
    ctx.fillStyle='white';
    ctx.fillText(`Lv${player.level}`, player.x*tileSize+5, player.y*tileSize+15);
}

function gameLoop(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    draw();
    requestAnimationFrame(gameLoop);
}
gameLoop();

// movement
function move(dx,dy){
    let nx=player.x+dx;
    let ny=player.y+dy;
    if(nx<0||ny<0||nx>=mapWidth||ny>=mapHeight) return;
    if(map[ny][nx]===1) return;

    // check monster
    let monster = monsters.find(m=>m.x===nx && m.y===ny);
    if(monster){
        monster.hp-=10;
        player.hp-=2;
        if(monster.hp<=0){
            if(Math.random()<0.5) addItem('Gold');
            monsters = monsters.filter(m=>m!==monster);
        }
        return;
    }

    player.x=nx;
    player.y=ny;
}

document.addEventListener('keydown', e=>{
    if(e.key==='w') move(0,-1);
    if(e.key==='s') move(0,1);
    if(e.key==='a') move(-1,0);
    if(e.key==='d') move(1,0);
});

// mobile buttons
document.getElementById('up').addEventListener('click', ()=>move(0,-1));
document.getElementById('down').addEventListener('click', ()=>move(0,1));
document.getElementById('left').addEventListener('click', ()=>move(-1,0));
document.getElementById('right').addEventListener('click', ()=>move(1,0));
