import io from 'socket.io-client';
import React, { Component } from "react";
import { Redirect } from "react-router-dom";



class Login extends Component {
    state = {
        username: '',
        id: new URLSearchParams(window.location.search).get('id'),
        socket: io("https://react-flask-chess.herokuapp.com/"),
        redirect: null
    }

    onFriendlySubmit = event => {
        event.preventDefault();
        if(!this.state.id){
            this.state.socket.emit('join_match', {"username": this.state.username, "match_type": 'friendly'});
            this.state.socket.on('match_created', data => {
                alert(`Mec kreiran na ${data.value.id}. Cekam protivnika`);
            });
        }
        else{
            this.state.socket.emit('join_match', {"username": this.state.username, "match_type": 'friendly', "id": this.state.id});
        }
        this.state.socket.on('match_started', ()=>{
            this.setState({redirect: "/game"});
        });
    }

    onRandomSubmit = event => {
        event.preventDefault();
        this.state.socket.emit('join_match', {"username": this.state.username, "match_type": 'random'});

        this.state.socket.on('match_created', alert("asd"));
        this.state.socket.on('match_started', ()=>{
            this.setState({redirect: "/game"});
        });
    }

    render() {
        if (this.state.redirect) {
            return <Redirect to={this.state.redirect} />
          }
        
        return (
            <form>
                <h3>Chess Game</h3>

                <div className="form-group">
                    <label>Username</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Enter username"
                        value={this.state.username}
                        onChange={e=>{this.setState({username: e.target.value})}} />
                </div>

                <div className="form-group">
                    <div className="custom-control custom-checkbox">
                        <input type="checkbox" className="custom-control-input" id="customCheck1" />
                    </div>
                </div>

                <button 
                    onClick={this.onFriendlySubmit}
                    type="submit" 
                    className="btn btn-primary btn-block">
                        Friendly
                    </button>

                <button 
                    onClick={this.onRandomSubmit}
                    type="submit" 
                    className="btn btn-primary btn-block">Random</button>
            </form>
        );
    }
}

export default Login;