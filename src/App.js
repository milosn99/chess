import React from 'react';
import './bootstrap.min.css';
import './App.css';
import io from 'socket.io-client';

import Login from "./components/Login";
import Game from './components/Game';

class App extends React.Component{
      state = {
        username: '',
        socket:io("http://127.0.0.1:5000/"),
        id: new URLSearchParams(window.location.search).get('id'),
        redirect: null,
        color: '',
        match_started: false,
        match_created: false,
        rep: null,
        open: false
      }

    componentDidMount() {
      this.state.socket.on('match_created', data => {
              alert(`Mec kreiran na ${data.id}. Cekam protivnika`);
              this.setState({id:data.id});
      });

      this.state.socket.on('match_started', (data)=>{
          if(this.state.username!==data.white_player &&
            this.state.username!==data.black_player) 
            return;
          if(this.state.username===data.white_player){
                  this.setState({color:'w'});
              }
          else if(this.state.username===data.black_player){
                  this.setState({color:'b'});
              }
          this.setState({match_started: true, id:data.id});
      });
    }

    onFriendlySubmit = event => {
      event.preventDefault();
      if(!this.state.username){
          alert("Unesi username");
          return;
      }
      if(!this.state.id){
          this.state.socket.emit('join_match', {"username": this.state.username, "match_type": 'friendly'});
      }
      else{
          this.state.socket.emit('join_match', {"username": this.state.username, "match_type": 'friendly', "id": this.state.id});
      }
    }


    onRandomSubmit = event => {
      event.preventDefault();
      this.state.socket.emit('join_match', {"username": this.state.username, "match_type": 'random'});
    }

    onUsernameChange = username => {
      this.setState({ username:username });
    };

    isOver = () => {
      this.setState({username:'', match_started: false, match_created: false, color:''});
    }

    render() {
      var isLoggedIn = this.state.username && (this.state.match_started || this.state.match_created);
      // const text=`Mec kreiran na ${this.state.id}. Cekam protivnika`;
      // isLoggedIn=true;
        return (
        
          <div className="App">
              <div className="auth-wrapper">
                <div className="auth-inner">
                  {!isLoggedIn && <Login 
                                          onUsernameChange={this.onUsernameChange}
                                          onFriendlySubmit={this.onFriendlySubmit}
                                          onRandomSubmit={this.onRandomSubmit}/>
                    }
                  {isLoggedIn && <Game
                                        color={this.state.color}
                                        id={this.state.id}
                                        username={this.state.username}
                                        socket={this.state.socket}
                                        onOver={this.isOver}/>}
                </div>
              </div>

              </div>
        );
      }
}

export default App;
