import React, { Component } from "react";
import io from 'socket.io-client';
import Chessboard from 'chessboardjsx';

class Game extends Component {
    
    render(){
        return <div><Chessboard position="start" draggable={false}/></div>
    }
}

export default Game;