const socket = io();
let game = new Chess();
let board;
let room = '';

document.getElementById('joinRoomBtn').addEventListener('click', ()=>{
    room = document.getElementById('room').value;
    if(room) socket.emit('joinRoom', room);
});

socket.on('updatePlayers', players=>{
    console.log('Players in room:', players);
});

function onDragStart(source, piece, position, orientation){
    if(game.game_over()) return false;
    if((game.turn()==='w' && piece.search(/^b/)!==-1) ||
       (game.turn()==='b' && piece.search(/^w/)!==-1)) return false;
}

function onDrop(source, target){
    let move = game.move({from:source, to:target, promotion:'q'});
    if(move===null) return 'snapback';
    socket.emit('move',{room, move});
}

function onSnapEnd(){
    board.position(game.fen());
}

board = Chessboard('board', {
    draggable:true,
    position:'start',
    onDragStart:onDragStart,
    onDrop:onDrop,
    onSnapEnd:onSnapEnd
});

// chat
document.getElementById('sendChat').addEventListener('click', ()=>{
    let msg = document.getElementById('chatInput').value;
    if(msg && room) socket.emit('chat',{room, user:'me', msg});
    document.getElementById('chatInput').value='';
});

socket.on('chat', data=>{
    let box = document.getElementById('chatBox');
    box.innerHTML += `<p><b>${data.user}:</b> ${data.msg}</p>`;
});
