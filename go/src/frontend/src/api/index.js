// // api/index.js
// import fetch from 'unfetch';

// state = {
//   el: '#app',
//   data: {
//     ws: null,
//     serverUrl: "ws://localhost:8080/ws",
//     roomInput: null,
//     rooms: [],
//     user: {
//       name: ""
//     },
//     users: []
//   }
// }

// // const checkStatus = response => {
// //   if(response.ok) {
// //       return response;
// //   } else {
// //       let error = new Error(response.statusText);
// //       error.response = response;
// //       response.json().then(e => {
// //           error.error = e;
// //       });
// //       return Promise.reject(error);
// //   }
// // }

// // server func
// connect = async () => {
//   this.connectToWebsocket();
// }

// connectToWebsocket = async (serverUrl, name) => {
//   const {data: {ws, serverUrl, user: {name}}} = this.state;
//   this.setState({data: {ws: new WebSocket(serverUrl +"?name=" + name)}});
//   await this.state.data.ws.addEventListener('open', (event) => { this.onWebsocketOpen(event) });
//   await this.state.data.ws.addEventListener('message', (event) => { this.handleNewMessage(event) });
// }

// onWebsocketOpen = () => {
//   console.log("connected to WS!");
// }

// handleNewMessage = (event) => {
//   let data = event.data;
//   console.log("data = " + data)
//     data = data.split(/\r?\n/);

//     for (let i = 0; i < data.length; i++) {
//       let msg = JSON.parse(data[i]);
//       switch (msg.action) {
//         case "send-message":
//           this.handleChatMessage(msg);
//           break;
//         case "user-join":
//           this.handleUserJoined(msg);
//           break;
//         case "user-left":
//           this.handleUserLeft(msg);
//           break;
//         case "room-joined":
//           this.handleRoomJoined(msg);
//           break;
//         default:
//           break;
//       }
//     }
// }

// handleChatMessage = (msg) => {
//   const {data: {room: {id, messages}}} = this.state;
//   id = this.findRoom(msg.target.id);
//     if (typeof room !== "undefined") {
//       messages.push(msg);
//     }
// }

// findRoom = (roomId) => {
//   const {data: {rooms}} = this.state;
//   for (let i = 0; i < rooms.length; i++) {
//     if (rooms[i].id === roomId) {
//       return rooms[i];
//     }
//   }
// }

// handleUserJoined = (msg) => {
//   const {data: {users}} = this.state;
//   users.push(msg.sender);
// }

// handleUserLeft = (msg) => {
//   const {data: {users}} = this.state;
//   for (let i = 0; i < users.length; i++) {
//     if (users[i].id == msg.sender.id) {
//       users.splice(i, 1);
//     }
//   }
// }

// handleRoomJoined = (msg) => {
//   const {data: {rooms}, room: {id, messages}} = this.state;
//   id = msg.target;
//   id.name = id.private ? msg.sender.name : id.name;
//   messages = [];
//   rooms.push(id);
// }

// joinPrivateRoom = (room) => {
//   const {data: {ws}} = this.state;
//   ws.send(JSON.stringify({ action: 'join-room-private', message: room.id }));
// }

// export {connect, connectToWebsocket, onWebsocketOpen, handleNewMessage, handleChatMessage, 
//   handleUserJoined, handleUserLeft, handleRoomJoined, sendMessage, findRoom, joinRoom, leaveRoom, joinPrivateRoom};
 
// // let connect = (cb, name) => {
// //   var socket = new WebSocket("ws://localhost:8080/name/ws");
// //   console.log("connectioning");

// //   socket.onopen = () => {
// //     console.log("Successfully Connected");
// //     connectToThePool(name);
// //   };

// //   socket.onmessage = msg => {
// //     console.log(msg);
// //     cb(msg)
// //   };

// //   socket.onclose = event => {
// //     console.log("Socket Closed Connection: ", event);
// //   };

// //   socket.onerror = error => {
// //     console.log("Socket Error: ", error);
// //   };
// // };

// // export const connect = (socket) => {
// //   console.log("connectioning");

// //   socket.onopen = () => {
// //     console.log("Successfully Connected");
// //     // connectToThePool(name);
// //   };
// //   socket.onmessage = msg => {
// //     console.log(msg);
// //     // cb(msg)
// //   };
// //   socket.onclose = event => {
// //     console.log("Socket Closed Connection: ", event);
// //   };
// //   socket.onerror = error => {
// //     console.log("Socket Error: ", error);
// //   };
// // }

// // export const connectToThePool = nameOfPool => 
// // fetch('/', {
// //     headers: {
// //         'Content-Type': 'application/json'
// //     },
// //     method: 'POST',
// //     body: JSON.stringify(nameOfPool)
// // }).then(checkStatus);

// // let sendMsg = msg => {
// //   console.log("sending msg: ", msg);
// //   // socket.send(msg);
// // };

// // export { sendMsg };