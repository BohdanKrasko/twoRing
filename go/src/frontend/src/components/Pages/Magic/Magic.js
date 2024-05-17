import React, { useState, Component } from 'react';
import '../../../App.css';
import { Modal, Button, Input, Tag, Divider } from 'antd';
import {
  SyncOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import plane from '../../Images/plane.png'
import ring from '../../Images/ring.png'
import './Magic.css'

const { TextArea } = Input;

class Magic extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
        el: '#app',
        rooms: [],
        serverUrl: "ws://54.86.95.112:80/ws",
        roomInput: null,
        users: [],
        isEnterEnterRoomModalVisibility: false,
        data: {
          ws: null,
        },
        textModal: false,
        ringModal: false,
        tagWait: true
    };
  }

//   componentDidMount () {
// 		this._isMounted = true;
// 	}

async componentDidMount() {

    // this.user.push({name: this.props.match.params.roomName});
    await this.setState({roomInput: this.props.match.params.roomName})
    await this.connect();
    await this.joinRoom()

  }

//   componentWillUnmount() {
// 		this._isMounted = false;
// 	}

openEnterEnterRoom = () => this.setState({isEnterEnterRoomModalVisibility: true})

closeEnterEnterRoom = () => this.setState({isEnterEnterRoomModalVisibility: false})

closeTextModal = async () => await  this.setState({textModal: false})
openTextModal = async () => await this.setState({textModal: true})

closeRingModal = async () => await  this.setState({ringModal: false})
openRingModal = async () => await this.setState({ringModal: true})
 
closeWaitTag = async () =>  this.setState({tagWait: false})
openWaitTag = async () => this.setState({tagWait: true})

sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

handleOk = () => {
    this.closeEnterEnterRoom(false); 
  };
// server func
async connect() {
    await this.connectToWebsocket();
}

  async connectToWebsocket() {
    await this.setState({data: {ws: await new WebSocket(this.state.serverUrl + "?name=" + this.props.match.params.roomName)}})
    await this.state.data.ws.addEventListener('open', async (event) => { await this.onWebsocketOpen(event) });
    await this.state.data.ws.addEventListener('message',async  (event) => { await this.handleNewMessage(event) });
    await this.state.data.ws.addEventListener('close', async (event) => {await this.onWebsocketClose(event) });
  }

  async onWebsocketOpen() {
    console.log("connected to WS!");
    this.currentReconnectDelay = 1000;
  }

  onWebsocketClose() {
    this.ws = null;

    setTimeout(() => {
      this.reconnectToWebsocket();
    }, this.currentReconnectDelay);

  }

  reconnectToWebsocket() {
    if (this.currentReconnectDelay < this.maxReconnectDelay) {
      this.currentReconnectDelay *= 2;
    }
    this.connectToWebsocket();
  }

  async handleNewMessage(event) {
    let data = event.data;
    console.log("handleNewMessage " + data)
    data = data.split(/\r?\n/);
    

    for (let i = 0; i < data.length; i++) {
      let msg = JSON.parse(data[i]);
      if (msg.message.includes("joined the room")) {
        this.closeWaitTag()
        await this.sleep(2000) 
         this.openEnterEnterRoom()
        await this.sleep(5000) 
        this.closeEnterEnterRoom();
        await this.openTextModal();
      }
      switch (msg.action) {
        case "send-message":
            console.log('send-message')
          this.handleChatMessage(msg);
          break;
        case "user-join":
            console.log("user-join")
          this.handleUserJoined(msg);
          break;
        case "user-left":
            console.log("user-left")
          this.handleUserLeft(msg);
          break;
        case "room-joined":
            console.log("room-joined")
          this.handleRoomJoined(msg);
          break;
        default:
          break;
      }

    }
  }

  handleChatMessage(msg) {
    const room = this.findRoom(msg.target.id);
    if (typeof room !== "undefined") {
      room.messages.push(msg);
    }
  }

  handleUserJoined(msg) {
    console.log("msg j" + JSON.stringify(msg))
    if(!this.userExists(msg.sender)) {
      this.state.users.push(msg.sender);
    }
  }

  handleUserLeft(msg) {
      console.log("msg " + JSON.stringify(msg))
    for (let i = 0; i < this.state.users.length; i++) {
      if (this.state.users[i].id == msg.sender.id) {
        this.state.users.splice(i, 1);
        return;
      }
    }
  }

  handleRoomJoined(msg) {
    let room = msg.target;
    room.name = room.private ? msg.sender.name : room.name;
    room["messages"] = [];
    room.newMessage = "jhgsdjhckjsdhkcnksdjn" //////////////////////////
    this.state.rooms.push(room)
    console.log(this.state)
  }

  async sendMessage(room) {
      console.log(room.id)
      console.log(room.name)
    if (room.newMessage !== "") {
        await this.state.data.ws.send(JSON.stringify({
            action: 'send-message',
            message: room.newMessage,
            target: {
            id: room.id,
            name: room.name
            }
        }));
        room.newMessage = "";
    }
  }

  findRoom(roomId) {
    for (let i = 0; i < this.state.rooms.length; i++) {
      if (this.state.rooms[i].id === roomId) {
        return this.state.rooms[i];
      }
    }
  }

  async joinRoom() {
      console.log("joinRoom " + this.state.roomInput)
      let roomName = this.state.roomInput
      this.state.data.ws.onopen = async () =>  await this.state.data.ws.send(JSON.stringify({ action: 'join-room', message: roomName}));
      this.setState({roomInput: ""})
  }

  leaveRoom(room) {
    this.state.data.ws.onopen = async () =>  await this.state.data.ws.send(JSON.stringify({ action: 'leave-room', message: room.id }));

    for (let i = 0; i < this.state.rooms.length; i++) {
      if (this.state.rooms[i].id === room.id) {
        this.state.rooms.splice(i, 1);
        break;
      }
    }
  }

//   async joinPrivateRoom(room) {
//       console.log("room = " + JSON.stringify(room))
//     this.state.data.ws.onopen = async () =>  await this.state.data.ws.send(JSON.stringify({ action: 'join-room-private', message: room.id }));
//   }

  userExists(user) {
    for (let i = 0; i < this.state.users.length; i++) {
      if (this.state.users[i].id === user.id) {
        return true;
      }
    }
    return false;
  } 

  render() {
    // this.openEnterEnterRoom();
    
    return (
      <>
      <div id="divElement">
      {/* <TextArea rows={4} /> */}
        {/* <Button onClick={async () => {
            await this.sendMessage(this.state.rooms[0])
        }} size="large">
          Secret Room
        </Button> */}
        <div id="tag2">
          <Tag color="green" visible={this.state.tagWait}>Wait for a magic ...</Tag>
        </div>
        
        <Modal
          visible={this.state.isEnterEnterRoomModalVisibility} 
          onCancel={this.closeEnterEnterRoom} 
          centered="true" footer={null} closable="false">
            <Divider orientation="Center">I fly to you &#128156;</Divider>
            <div>
              <img id="plane" width = "100%" height = "100%" src={plane}/>
            </div>
            <div id="tag">
              <Tag icon={<SyncOutlined spin />} color="processing">
                Yyyyyeeeee almost done)
              </Tag>
            </div>
        </Modal>
      </div>
      <div>
      <Modal visible={this.state.textModal} footer={null} width="80%">
            {/* <Divider orientation="Center">Will you my girlfrend?</Divider> */}
            <div id="text">
              <div id="tag2">
                <Tag color="magenta">Коли перший раз тебе побачив то на хвилину просто завмер не розумів що відбувається.</Tag>
              </div>
              <div id="tag2">
                <Tag color="red">І в голові була тільки одна думка як познайомитися з тобою) і да ти вже знаєш до чого додумався)</Tag>
              </div>
              <div id="tag2">
                <Tag color="volcano">Коли ми разом час проходить дууууже швидко інколи хочеть просто разом сидіти в обнімку до ранку.</Tag>
              </div>
              <div id="tag2">
                <Tag color="orange">Сподіваюсь всі минулі рази тобі сподобалися, да були різні моменти наприклад могло світло потухнути, або сфітлофовор не робити бо машини там не їздять)</Tag>
              </div>
              <div id="tag2">
                <Tag color="gold">Ми не так довго знайомі і можливо багато чого не знаємо один про одного, але з кожним новим фактом ми завжди находили щось спільне навіть варіант лаб був однаковий, а це про щось говорить да да)</Tag>
              </div>
              <div id="tag2">
                <Tag color="lime">І хочу сказати тобі одні слова знову не тільки написавши їх, а і в живу.</Tag>
              </div>
              <div id="tag2">
                <Tag color="green">Ти </Tag>
              </div>
              <div id="tag2">
                <Tag color="cyan">мені </Tag>
              </div>
              <div id="tag2">
                <Tag color="blue"> подобаєшся.</Tag>
              </div>
              <div id="tag2">
                <Tag color="geekblue">Давай бути разом.</Tag>
              </div>
            </div>
            <Button onClick={() => {
              this.closeTextModal();
              this.openRingModal()
            }} size="large">
                Натисни мене
              </Button>
        </Modal>
      </div>
      <div id="divElement">
        <Modal visible={this.state.ringModal} footer={null}>
            <Divider orientation="Center">Will you my girlfrend?</Divider>
            <div>
              <img id="ring" width = "100%" height = "100%" src={ring}/>
            </div>
        </Modal>
      </div>
      </>
    );
  }
}

export default Magic