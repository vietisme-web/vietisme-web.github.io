const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 8;
const cellSize = 50;

// grid
let grid = [];
for(let y=0;y<gridSize;y++){
    grid.push(Array(gridSize).fill(null));
}

// colors cho shape
const shapeColors = [
    '#ff6666','#66ff66','#6666ff','#ffcc66','#66ffff','#cc66ff','#ff66cc'
];

// shapes
const shapes = [
    [[1]], 
    [[1,1]], 
    [[1],[1]], 
    [[1,1],[1,0]], 
    [[1,1],[0,1]], 
    [[1,1],[1,1]], 
    [[1,1,1],[1,0,0],[1,0,0]]
];

// 3 block chờ
let blocks = [];
function generateBlocks(){
    blocks=[];
    const startY = gridSize*cellSize + 20; // dưới grid
    for(let i=0;i<3;i++){
        const shapeIndex = Math.floor(Math.random()*shapes.length);
        const shape = shapes[shapeIndex];
        const color = shapeColors[shapeIndex % shapeColors.length];
        const x = 20 + i*180;
        const y = startY;
        blocks.push({shape,color,x,y,placed:false,initX:x,initY:y});
    }
}
generateBlocks();

// drag & drop
let selectedBlock = null;
let offsetX=0, offsetY=0;

function getPos(e){
    const rect = canvas.getBoundingClientRect();
    if(e.touches) return {x:e.touches[0].clientX-rect.left, y:e.touches[0].clientY-rect.top};
    return {x:e.offsetX, y:e.offsetY};
}

canvas.addEventListener('mousedown', e=>startDrag(getPos(e)));
canvas.addEventListener('mousemove', e=>{
    if(selectedBlock){
        const pos=getPos(e);
        selectedBlock.x = pos.x - offsetX;
        selectedBlock.y = pos.y - offsetY;
    }
});
canvas.addEventListener('mouseup', dropBlock);

canvas.addEventListener('touchstart', e=>{e.preventDefault(); startDrag(getPos(e));});
canvas.addEventListener('touchmove', e=>{e.preventDefault(); if(selectedBlock){const pos=getPos(e); selectedBlock.x=pos.x-offsetX; selectedBlock.y=pos.y-offsetY;}});
canvas.addEventListener('touchend', e=>{e.preventDefault(); dropBlock();});

function startDrag(pos){
    for(let b of blocks){
        const w = b.shape[0].length*cellSize;
        const h = b.shape.length*cellSize;
        if(pos.x>b.x && pos.x<b.x+w && pos.y>b.y && pos.y<b.y+h && !b.placed){
            selectedBlock=b;
            offsetX=pos.x-b.x;
            offsetY=pos.y-b.y;
            return;
        }
    }
}

function dropBlock(){
    if(!selectedBlock) return;
    const gx = Math.floor(selectedBlock.x / cellSize);
    const gy = Math.floor(selectedBlock.y / cellSize);
    if(canPlace(gx,gy,selectedBlock.shape)){
        placeBlock(gx,gy,selectedBlock.shape,selectedBlock.color);
        selectedBlock.placed=true;
        checkFull();
        generateNextBlocksIfNeeded();
    } else {
        // trả block về vị trí cũ
        selectedBlock.x = selectedBlock.initX;
        selectedBlock.y = selectedBlock.initY;
    }
    selectedBlock=null;
}

function generateNextBlocksIfNeeded(){
    if(blocks.every(b=>b.placed)) generateBlocks();
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
}

// check xóa row/col
function checkFull(){
    // rows
    for(let y=0;y<gridSize;y++){
        if(grid[y].every(c=>c)){
            const color=grid[y][0].color;
            for(let x=0;x<gridSize;x++){
                animateClear(x,y,color);
                grid[y][x]=null;
            }
        }
    }
    // cols
    for(let x=0;x<gridSize;x++){
        let full=true;
        for(let y=0;y<gridSize;y++) if(!grid[y][x]) full=false;
        if(full){
            const color=grid[0][x].color;
            for(let y=0;y<gridSize;y++){
                animateClear(x,y,color);
                grid[y][x]=null;
            }
        }
    }
}

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

function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // grid
    for(let y=0;y<gridSize;y++){
        for(let x=0;x<gridSize;x++){
            ctx.fillStyle=grid[y][x]?grid[y][x].color:'#333';
            ctx.fillRect(x*cellSize,y*cellSize,cellSize,cellSize);
            ctx.strokeStyle='#fff';
            ctx.strokeRect(x*cellSize,y*cellSize,cellSize,cellSize);
        }
    }

    // draw blocks chờ dưới lưới
    for(let b of blocks){
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
    }

    requestAnimationFrame(draw);
}
draw();
