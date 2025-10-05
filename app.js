const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 8;
const cellSize = 50;
let score = 0;
let combo = 0;

// grid 8x8
let grid = [];
for(let y=0;y<gridSize;y++){
    let row=[];
    for(let x=0;x<gridSize;x++) row.push(null);
    grid.push(row);
}

// colors
function randomColor(){ 
    const colors=['#ff6666','#66ff66','#6666ff','#ffcc66','#66ffff','#cc66ff']; 
    return colors[Math.floor(Math.random()*colors.length)];
}

// block shapes 1x1 → 3x3 + L-shape
const shapes = [
    [[1]], // 1x1
    [[1,1]], // 2x1
    [[1],[1]], // 1x2
    [[1,1],[1,0]], // L
    [[1,1],[0,1]], // L rotated
    [[1,1],[1,1]], // 2x2
    [[1,1,1],[1,0,0],[1,0,0]] // 3x3
];

let blocks = [];
function generateBlock(){
    const shape = shapes[Math.floor(Math.random()*shapes.length)];
    const color = randomColor();
    blocks.push({shape,color,x:10,y:420});
}
for(let i=0;i<3;i++) generateBlock();

let selectedBlock = null;
let offsetX=0, offsetY=0;

// mouse events
canvas.addEventListener('mousedown', e=>{
    const mx=e.offsetX, my=e.offsetY;
    selectBlock(mx,my);
});
canvas.addEventListener('mousemove', e=>{
    if(selectedBlock){
        selectedBlock.x=e.offsetX-offsetX;
        selectedBlock.y=e.offsetY-offsetY;
    }
});
canvas.addEventListener('mouseup', tryPlace);

// touch events
canvas.addEventListener('touchstart', e=>{
    const rect = canvas.getBoundingClientRect();
    const mx = e.touches[0].clientX - rect.left;
    const my = e.touches[0].clientY - rect.top;
    selectBlock(mx,my);
});
canvas.addEventListener('touchmove', e=>{
    if(selectedBlock){
        const rect = canvas.getBoundingClientRect();
        selectedBlock.x = e.touches[0].clientX - rect.left - offsetX;
        selectedBlock.y = e.touches[0].clientY - rect.top - offsetY;
    }
});
canvas.addEventListener('touchend', tryPlace);

function selectBlock(mx,my){
    blocks.forEach(b=>{
        const w=cellSize*b.shape[0].length;
        const h=cellSize*b.shape.length;
        if(mx>b.x && mx<b.x+w && my>b.y && my<b.y+h){
            selectedBlock=b;
            offsetX=mx-b.x;
            offsetY=my-b.y;
        }
    });
}

function tryPlace(){
    if(!selectedBlock) return;
    let placed=false;
    for(let y=0;y<gridSize;y++){
        for(let x=0;x<gridSize;x++){
            if(canPlace(x,y,selectedBlock.shape)){
                placeBlock(x,y,selectedBlock.shape,selectedBlock.color);
                blocks.splice(blocks.indexOf(selectedBlock),1);
                generateBlock();
                placed=true;
                break;
            }
        }
        if(placed) break;
    }
    selectedBlock=null;
}

function canPlace(gx,gy,shape){
    for(let i=0;i<shape.length;i++){
        for(let j=0;j<shape[i].length;j++){
            if(shape[i][j]){
                if(gx+j>=gridSize || gy+i>=gridSize) return false;
                if(grid[gy+i][gx+j]) return false;
            }
        }
    }
    return true;
}

function placeBlock(gx,gy,shape,color){
    for(let i=0;i<shape.length;i++){
        for(let j=0;j<shape[i].length;j++){
            if(shape[i][j]) grid[gy+i][gx+j]={color};
        }
    }
    checkFull();
    score += shape.flat().reduce((a,b)=>a+b,0);
    document.getElementById('score').innerText="Score: "+score;
}

function checkFull(){
    let cleared=false;
    combo=0;
    // rows
    for(let y=0;y<gridSize;y++){
        if(grid[y].every(c=>c)){
            combo++;
            for(let x=0;x<gridSize;x++){
                animateClear(x,y,grid[y][x].color);
                grid[y][x]=null;
            }
        }
    }
    // cols
    for(let x=0;x<gridSize;x++){
        let full=true;
        for(let y=0;y<gridSize;y++){
            if(!grid[y][x]) full=false;
        }
        if(full){
            combo++;
            for(let y=0;y<gridSize;y++){
                animateClear(x,y,grid[y][x].color);
                grid[y][x]=null;
            }
        }
    }
    if(combo>1) score+=combo*50; // bonus
    document.getElementById('score').innerText="Score: "+score;
    updateLeaderboard();
}

// simple animation
function animateClear(x,y,color){
    let alpha=1;
    function fade(){
        alpha-=0.1;
        if(alpha<=0) return;
        ctx.fillStyle=color;
        ctx.globalAlpha=alpha;
        ctx.fillRect(x*cellSize,y*cellSize,cellSize-2,cellSize-2);
        ctx.globalAlpha=1;
        requestAnimationFrame(fade);
    }
    fade();
}

// offline leaderboard
let leaderboard=[];
function updateLeaderboard(){
    leaderboard.push(score);
    leaderboard.sort((a,b)=>b-a);
    leaderboard=leaderboard.slice(0,5);
    const lb = document.getElementById('leaderboard');
    lb.innerHTML='';
    leaderboard.forEach(s=>{
        const li=document.createElement('li');
        li.innerText=s;
        lb.appendChild(li);
    });
}

// draw
function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // grid
    for(let y=0;y<gridSize;y++){
        for(let x=0;x<gridSize;x++){
            ctx.fillStyle=grid[y][x]?grid[y][x].color:'#333';
            ctx.fillRect(x*cellSize,y*cellSize,cellSize-2,cellSize-2);
        }
    }
    // blocks to place
    blocks.forEach(b=>{
        for(let i=0;i<b.shape.length;i++){
            for(let j=0;j<b.shape[i].length;j++){
                if(b.shape[i][j]){
                    ctx.fillStyle=b.color;
                    ctx.fillRect(b.x+j*cellSize,b.y+i*cellSize,cellSize-2,cellSize-2);
                }
            }
        }
    });
    requestAnimationFrame(draw);
}
draw();
