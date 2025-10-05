const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

let players = {};
let monsters = [];

function spawnMonster() {
    monsters.push({
        id: Math.random().toString(36).substr(2,5),
        x: Math.floor(Math.random()*500),
        y: Math.floor(Math.random()*500),
        hp: 10,
        level: 1
    });
}

setInterval(()=>{
    if(monsters.length < 5) spawnMonster();
}, 5000);

io.on('connection', socket => {
    console.log('player connected', socket.id);
    players[socket.id] = {x: 50, y:50, hp:100, name: socket.id.substr(0,4)};

    socket.emit('init',{players, monsters});

    socket.on('move', data=>{
        if(players[socket.id]){
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            io.emit('updatePlayers', players);
        }
    });

    socket.on('attack', monsterId=>{
        let m = monsters.find(m=>m.id===monsterId);
        if(m){
            m.hp -= 5;
            if(m.hp <=0){
                // drop item tỉ lệ 50%
                let drop = Math.random() < 0.5 ? 'Gold' : null;
                io.emit('monsterKilled',{monsterId, drop});
                monsters = monsters.filter(mon=>mon.id!==monsterId);
            }
            io.emit('updateMonsters', monsters);
        }
    });

    socket.on('disconnect',()=>{
        delete players[socket.id];
        io.emit('updatePlayers', players);
    });
});

http.listen(3000, ()=>console.log('Server running on http://localhost:3000'));
