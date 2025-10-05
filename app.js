const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 8;
const cellSize = 50;
let score = 0;

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
    [[1]], 
    [[1,1]], 
    [[1],[1]], 
    [[1,1],[1,0]], 
    [[1,1],[0,1]], 
    [[1,1],[1,1]], 
    [[1,1,1],[1,0,0],[1,0,0]]
];

// blocks chờ kéo thả
let blocks = [];
function generateBlock(){
    const shape = shapes[Math.floor(Math.random()*shapes.length)];
    const color = randomColor();
    const x = 10 + Math.random()*(canvas.width-100);
    const y = canvas.height - 80; // nằm dưới canvas
    blocks.push({shape,color,x,y});
}
for(let i=0;i<3;i++) generateBlock();

let selectedBlock = null;
let offsetX=0, offsetY=0;

// mouse & touch
function getMousePos(e){
    const rect=canvas.getBoundingClientRect();
    if(e.touches) return {x:e.touches[0].clientX - rect.left, y:e.touches[0].clientY - rect.top};
    return {x:e.offsetX, y:e.offsetY};
}

canvas.addEventListener('mousedown', e=>selectBlock(getMousePos(e).x,getMousePos(e).y));
canvas.addEventListener('mousemove', e=>{
    if(selectedBlock){
        const pos=getMousePos(e);
        selectedBlock.x = pos.x - offsetX;
        selectedBlock.y = pos.y - offsetY;
    }
});
canvas.addEventListener('mouseup', tryPlace);

canvas.addEventListener('touchstart', e=>{e.preventDefault(); const pos=getMousePos(e); selectBlock(pos.x,pos.y);});
canvas.addEventListener('touchmove', e=>{e.preventDefault(); if(selectedBlock){const pos=getMousePos(e); selectedBlock.x=pos.x-offsetX; selectedBlock.y=pos.y-offsetY;}});
canvas.addEventListener('touchend', e=>{e.preventDefault(); tryPlace();});

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
    score += shape.flat().reduce((a,b)=>a+b,0);
    document.getElementById('score').innerText="Score: "+score;
    checkFull();
}

// check rows/cols + animation
function checkFull(){
    let combo=0;
    for(let y=0;y<gridSize;y++){
        if(grid[y].every(c=>c)){
            combo++;
            const color=grid[y][0].color;
            for(let x=0;x<gridSize;x++){
                animateClear(x,y,color);
                grid[y][x]=null;
            }
        }
    }
    for(let x=0;x<gridSize;x++){
        let full=true;
        for(let y=0;y<gridSize;y++) if(!grid[y][x]) full=false;
        if(full){
            combo++;
            const color=grid[0][x].color;
            for(let y=0;y<gridSize;y++){
                animateClear(x,y,color);
                grid[y][x]=null;
            }
        }
    }
    if(combo>1) score += combo*50;
    document.getElementById('score').innerText="Score: "+score;
}

// animation liền block
function animateClear(x,y,color){
    let alpha=1;
    function fade(){
        alpha-=0.1;
        if(alpha<=0) return;
        ctx.fillStyle=color;
        ctx.globalAlpha=alpha;
        ctx.fillRect(x*cellSize,y*cellSize,cellSize,cellSize);
        ctx.globalAlpha=1;
        ctx.strokeStyle='#fff';
        ctx.strokeRect(x*cellSize,y*cellSize,cellSize,cellSize);
        requestAnimationFrame(fade);
    }
    fade();
}

// draw
function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // draw grid
    for(let y=0;y<gridSize;y++){
        for(let x=0;x<gridSize;x++){
            ctx.fillStyle=grid[y][x]?grid[y][x].color:'#333';
            ctx.fillRect(x*cellSize,y*cellSize,cellSize,cellSize);
            ctx.strokeStyle='#fff';
            ctx.strokeRect(x*cellSize,y*cellSize,cellSize,cellSize);
        }
    }
    // draw blocks chờ kéo
    blocks.forEach(b=>{
        for(let i=0;i<b.shape.length;i++){
            for(let j=0;j<b.shape[i].length;j++){
                if(b.shape[i][j]){
                    ctx.fillStyle=b.color;
                    ctx.fillRect(b.x+j*cellSize,b.y+i*cellSize,cellSize,cellSize);
                    ctx.strokeStyle='#fff';
                    ctx.strokeRect(b.x+j*cellSize,b.y+i*cellSize,cellSize,cellSize);
                }
            }
        }
    });
    requestAnimationFrame(draw);
}
draw();
