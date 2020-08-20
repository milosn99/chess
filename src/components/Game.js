import React, { Component } from "react";
import PropTypes from "prop-types";
import Chess from "chess.js";
import Chessboard from "chessboardjsx";


class HumanVsHuman extends Component {
  static propTypes = { children: PropTypes.func };

  state = {
    fen: "start", //postava na pocetku
    dropSquareStyle: {}, //izgled polja na koje je pomjereno
    squareStyles: {}, //posebna polja
    pieceSquare: "", //polje na kojem se nalazi figura koja je kliknuta
    square: "", //posljenje kliknuto polje
    history: [], //prethodno odigrani potezi
    color: this.props.color, //boja igraca
    socket: this.props.socket, //socket na kom se igra
    id: this.props.id, //id meca
    winner: false, //da li je pobijedio ili nije
    username: this.props.username, //username igraca
    deadWhite:{
      "p": 0,
      "q": 0,
      "r": 0,
      "n": 0,
      "b": 0
    },
    deadBlack:{
      "p": 0,
      "q": 0,
      "r": 0,
      "n": 0,
      "b": 0
    }
    
  };

  componentDidMount() {
    this.game = new Chess();

    this.state.socket.on('opponent_move', data=>{

      if(this.state.id!==data.id) return;

      const piece = this.game.get(data.to);
      if(piece!==null) {
        if(piece.color==='b') this.state.deadBlack[piece.type]+=1;
        else this.state.deadWhite[piece.type]+=1;
      }

      let move = this.game.move({
        from: data.from,
        to: data.to,
        promotion: "q"
      })
  
      // nedozvoljen potez
      if (move === null) return;

      this.setState(({ history, pieceSquare }) => ({
        fen: this.game.fen(),
        history: this.game.history({ verbose: true }),
        squareStyles: squareStyling({ pieceSquare, history }),
      }));

      
    });

    this.state.socket.on('checkmate', data=>{

      setTimeout(() => {
        if(data.winner===this.state.username){
          this.setState({winner:true});
        }
  
        if(this.state.winner) alert('pobjeda');
        else alert('poraz');
        this.props.onOver();
      
      }, 500)
    });

    this.state.socket.on('stalemate', data=>{
      setTimeout(() => {
        alert('stalemate je');
        this.props.onOver();
      }, 500)
    });

    this.state.socket.on('check', data=>{
      setTimeout(() => {
        alert('sah');
      }, 500)
    });

    this.state.socket.on('game_over', data=>{
      setTimeout(() => {
        alert('kraj igre');
        this.props.onOver();
      }, 500)
    });

  }

  //brisanje hajlajtovanja
  removeHighlightSquare = () => {
    this.setState(({ pieceSquare, history }) => ({
      squareStyles: squareStyling({ pieceSquare, history })
    }));
  };

  // prikazivanje mogucih polja
  highlightSquare = (sourceSquare, squaresToHighlight) => {
    if(this.game.turn()!==this.state.color) return;
    const highlightStyles = [sourceSquare, ...squaresToHighlight].reduce(
      (a, c) => {
        return {
          ...a,
          ...{
            [c]: {
              background: "gray",
              boxShadow: "inset 0px 0px 10px 0px rgba(0,0,0,0.5)"
            }
          },
          ...squareStyling({
            history: this.state.history,
            pieceSquare: this.state.pieceSquare
          })
        };
      },
      {}
    );

    this.setState(({ squareStyles }) => ({
      squareStyles: { ...squareStyles, ...highlightStyles }
    }));
  };

  canMove = () => {
    if  (this.game.game_over() === true ||
    (this.game.turn() !== this.state.color)) {
         return false;
    } 
    return true;
  }

  
  isPromotion(piece,from,to) {
    if(piece.type==='p' && 
      ((from.charAt(1)==='7' && to.charAt(1)==='8') ||
      (from.charAt(1)==='2' && to.charAt(1)==='1'))) return true;
    else return false
  }

  onDrop = ({ sourceSquare, targetSquare }) => {
    // provjera da li je potez dozvoljen
    const piece = this.game.get(sourceSquare);
    if(!this.canMove()) return;

    const piece2 = this.game.get(targetSquare);
    if(piece2!==null) {
      if(piece2.color==='b') this.state.deadBlack[piece2.type]+=1;
      else this.state.deadWhite[piece2.type]+=1;
    }

    let move = this.game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q"
    })

    // nedozvoljen potez
    if (move === null) return;
    this.setState(({ history, pieceSquare }) => ({
      fen: this.game.fen(),
      history: this.game.history({ verbose: true }),
      squareStyles: squareStyling({ pieceSquare, history })
    }));

    var rep = null;
    if(this.isPromotion(piece,sourceSquare,targetSquare)) rep='q';
    const tId=this.state.id;
    this.state.socket.emit('move', {'id': tId, 'from': sourceSquare, "to": targetSquare, 'replace': rep});
  };

  onMouseOverSquare = square => {
    // uzima listu mogucih poteza
    let moves = this.game.moves({
      square: square,
      verbose: true
    });

    // ako nema mogucih poteza return
    if (moves.length === 0) return;

    let squaresToHighlight = [];
    for (var i = 0; i < moves.length; i++) {
      squaresToHighlight.push(moves[i].to);
    }

    this.highlightSquare(square, squaresToHighlight);
  };

  onMouseOutSquare = square => this.removeHighlightSquare(square);

  // central squares get diff dropSquareStyles
  onDragOverSquare = square => {
    this.setState({
      dropSquareStyle: { boxShadow: "inset 0 0 1px 4px cornFlowerBlue" }
    });
  };

  onSquareClick = square => {
    const piece = this.game.get(this.state.pieceSquare);
    if(!this.canMove()) return;

    const piece2 = this.game.get(this.state.pieceSquare);
    if(piece2!==null) {
      if(piece2.color==='b') this.state.deadBlack[piece2.type]+=1;
      else this.state.deadWhite[piece2.type]+=1;
    }


    this.setState(({ history }) => ({
      squareStyles: squareStyling({ pieceSquare: square, history }),
      pieceSquare: square
    }));

    let move = this.game.move({
      from: this.state.pieceSquare,
      to: square,
      promotion: "q"
    });

    const from = this.state.pieceSquare;
    // nedozvoljen potez
    if (move === null) return;

    this.setState({
      fen: this.game.fen(),
      history: this.game.history({ verbose: true }),
      pieceSquare: ""
    });
    
    var rep = null;  
    if(this.isPromotion(piece,from,square)) rep='q';
    const tId = this.state.id;
    this.state.socket.emit('move', {'id': tId,'from': from, "to": square, 'replace': rep});
  };

  onSquareRightClick = square =>
    this.setState({
      squareStyles: { [square]: { backgroundColor: "darkBlue" } }
    });

  calcWidth = ({ screenWidth, screenHeight }) =>{ 
    return screenWidth>screenHeight? screenWidth/2.3:screenHeight/2.3;
  }
    
  render() {
    const { fen, dropSquareStyle, squareStyles } = this.state;

    return this.props.children({
      squareStyles,
      position: fen,
      onMouseOverSquare: this.onMouseOverSquare,
      onMouseOutSquare: this.onMouseOutSquare,
      onDrop: this.onDrop,
      dropSquareStyle,
      onDragOverSquare: this.onDragOverSquare,
      onSquareClick: this.onSquareClick,
      onSquareRightClick: this.onSquareRightClick,
      calcWidth: this.calcWidth,
      deadBlack: this.state.deadBlack,
      deadWhite: this.state.deadWhite
    });
  }
}

export default function Game(props) {
  return (
      <div><HumanVsHuman color={props.color} 
                    socket={props.socket} 
                    id={props.id} 
                    username={props.username}
                    onOver={props.onOver}>
        {({
          position,
          onDrop,
          onMouseOverSquare,
          onMouseOutSquare,
          squareStyles,
          dropSquareStyle,
          onDragOverSquare,
          onSquareClick,
          onSquareRightClick,
          calcWidth,
          deadWhite,
          deadBlack
        }) => (
          <div className="human-vs-human"><div className="igra"><Chessboard 
            id="humanVsHuman"
            calcWidth={calcWidth}
            position={position}
            onDrop={onDrop}
            onMouseOverSquare={onMouseOverSquare}
            onMouseOutSquare={onMouseOutSquare}
            boardStyle={{
              borderRadius: "5px",
              boxShadow: `0 5px 15px rgba(0, 0, 0, 0.5)`
            }}
            squareStyles={squareStyles}
            dropSquareStyle={dropSquareStyle}
            onDragOverSquare={onDragOverSquare}
            onSquareClick={onSquareClick}
            onSquareRightClick={onSquareRightClick}
            lightSquareStyle={{ backgroundColor: "#e0e0ff" }}
            darkSquareStyle={{ backgroundColor: "#353586" }}
          /></div>
          <div className="info">
          {props.black_player} <br/>
          pjesak: {deadBlack["p"]} <br/>
          konj: {deadBlack["n"]} <br/>
          kraljica:{deadBlack["q"]} <br/>
          lovac:{deadBlack["b"]} <br/>
          top:{deadBlack["r"]} <br/> <br/>
          {props.white_player} <br/>
          pjesak: {deadWhite["p"]} <br/>
          konj: {deadWhite["n"]} <br/>
          kraljica:{deadWhite["q"]} <br/>
          lovac:{deadWhite["b"]} <br/>
          top:{deadWhite["r"]} <br/>
        </div></div>
        )}
      </HumanVsHuman>
      </div>
  );
}

const squareStyling = ({ pieceSquare, history }) => {
  const sourceSquare = history.length && history[history.length - 1].from;
  const targetSquare = history.length && history[history.length - 1].to;

  return {
    [pieceSquare]: { backgroundColor: "rgba(255, 255, 0, 0.4)" },
    ...(history.length && {
      [sourceSquare]: {
        backgroundColor: "rgba(255, 255, 0, 0.4)"
      }
    }),
    ...(history.length && {
      [targetSquare]: {
        backgroundColor: "rgba(255, 255, 0, 0.4)"
      }
    })
  };
};
