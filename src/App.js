import React from 'react';
import './bootstrap.min.css';
import './App.css';
import io from 'socket.io-client';

import Login from "./components/Login";
import Game from './components/Game';

class App extends React.Component{
      state = {
        username: '',
        socket:io("https://react-flask-chess.herokuapp.com/"),
        id: new URLSearchParams(window.location.search).get('id'),
        redirect: null,
        color: '',
        match_started: false,
        match_created: false
      }

    componentDidMount() {
      this.state.socket.on('match_created', data => {
          if(this.state.id===data.id){
              alert(`Mec kreiran na ${data.id}. Cekam protivnika`);
              this.setState({id:data.id});
          }
      });

      this.state.socket.on('match_started', (data)=>{
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
      //this.setState({overlay:true});
    }


    onRandomSubmit = event => {
      this.state.socket.emit('join_match', {"username": this.state.username, "match_type": 'random'});
    }

    onUsernameChange = username => {
      this.setState({ username:username });
    };

    isLoggedIn = this.state.username && (this.state.match_started || this.state.match_created);

    render() {
        return (

          <div className="App">

              <div className="auth-wrapper">
                <div className="auth-inner">
                  {!this.isLoggedIn && <Login 
                                          onUsernameChange={this.onUsernameChange}
                                          onFriendlySubmit={this.onFriendlySubmit}
                                          onRandomSubmit={this.onRandomSubmit}/>
                    }
                  {this.isLoggedIn && <Game
                                        color={this.state.color}
                                        id={this.state.id}
                                        username={this.state.username}
                                        socket={this.state.socket}/>}
                </div>
              </div>

            </div>
        );
      }
}

export default App;
