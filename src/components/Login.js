import React, { Component } from "react";
import io from 'socket.io-client';

class Login extends Component {
    state = {
        username: '',
        id: new URLSearchParams(window.location.search).get('id')
    }

    onFriendlySubmit = event => {
        event.preventDefault();
        const user = this.state.username;
        const tId = this.state.id;
        var socket = io("https://react-flask-chess.herokuapp.com/");
        socket.on('connect', function() {
            socket.emit('join_match', {"username": user, "match_type": 'friendly', "id": tId});
        });
    }

    onRandomSubmit = event => {

        event.preventDefault();
        var socket = io("https://react-flask-chess.herokuapp.com/");
        socket.on('connect', function() {
            socket.emit('join_match', {"username": this.state.username, "match_type": 'random'});
        });
    }

    render() {
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
                <button type="submit" className="btn btn-primary btn-block">Random</button>
            </form>
        );
    }
}

export default Login;