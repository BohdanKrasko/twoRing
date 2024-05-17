import React, { useState, Component } from 'react';
import '../../../App.css';
import { Modal, Button, Input } from 'antd';
import { Link } from 'react-router-dom';
import './EnterRoom.css'
import { connect } from '../../../api'

class EnterRoom extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    // let temp = JSON.parse(this.props.message);
    this.state = {
      // message: temp
      el: '#app',
      roomName: '',
      data: {
        isEnterEnterRoomModalVisibility: false
      }
    };
  }
  
  openEnterEnterRoom = () => this.setState({isEnterEnterRoomModalVisibility: true})

	closeEnterEnterRoom = () => this.setState({isEnterEnterRoomModalVisibility: false})

  setRoomName = () => this.setState( {roomName: document.getElementById('poolName').value})

  handleOk = () => {
    // const {data: {ws, user: {name}}} = this.state;
    // // this.setState({data: {user: {name: document.getElementById('poolName').value}}});
    // this.setRoomId()
    // console.log("serverUrl: " + this.state.data.serverUrl);
    // console.log("name: " + this.state.data.room.id);
    // this.setState({data: {ws: new WebSocket(this.state.data.serverUrl + "?name=" + this.state.data.room.id)}});
    
    this.closeEnterEnterRoom(false);
    
  };

  render() {

    return (
      <>
      <div id="divElement">
        <Button onClick={this.openEnterEnterRoom} size="large">
          Secret Room
        </Button>
        
        <Modal title="Name of Room" 
          visible={this.state.isEnterEnterRoomModalVisibility} 
          onOk={this.handleOk} onCancel={this.closeEnterEnterRoom} 
          centered="true" footer={null} closable="false">
          <Input placeholder="Room name. 719" id="poolName" autocomplete="off" onChange={() => {
            this.setState({roomName: document.getElementById('poolName').value})
          }
            }/>
          <Link to={`/${this.state.roomName}/magic`}>
              <Button onClick={this.handleOk} size="large">
                Join
              </Button>
           </Link>
        </Modal>
      </div>
      </>
    );
  }
}


export default EnterRoom