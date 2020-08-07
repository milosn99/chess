import io from 'socket.io-client';
import React, { Component } from "react";
import {Redirect} from 'react-router-dom';


class Login extends Component {
    state = {
        username: '',
        socket:io("https://react-flask-chess.herokuapp.com/"),
        id: new URLSearchParams(window.location.search).get('id'),
        redirect: null,
        color: '',
    }

    componentDidMount() {
        this.state.socket.on('match_created', data => {
            if(this.state.id===data.id){
                alert(`Mec kreiran na ${data.id}. Cekam protivnika`);
                //this.setState({id:data.id});
            }
        });

        this.state.socket.on('match_started', (data)=>{
            if(this.state.id!==data.id){
                return;
            }
            if(this.state.username===data.white_player){
                    this.setState({color:'white'});
                }
            else if(this.state.username===data.black_player){
                    this.setState({color:'black'});
                }
            this.setState({redirect: "/game"});
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
        this.setState({overlay:true});
    }

    onRandomSubmit = event => {
        event.preventDefault();
        this.setState({redirect: `/game`});
        this.state.socket.emit('join_match', {"username": this.state.username, "match_type": 'random'});
    }

    render() {
        if (this.state.redirect) {
            return <Redirect to={{
                pathname: this.state.redirect
            }}
    />
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