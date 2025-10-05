const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
let clients = [];

wss.on('connection', function(ws){
  clients.push(ws);
  ws.on('message', function(message){
    // gửi cho tất cả client trừ người gửi
    clients.forEach(c=>{
      if(c!==ws && c.readyState===WebSocket.OPEN) c.send(message);
    });
  });

  ws.on('close', function(){
    clients = clients.filter(c=>c!==ws);
  });
});

console.log('WebSocket server running on ws://localhost:8080');
