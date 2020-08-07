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
    color: this.props.color,
    socket: this.props.socket,
    id: this.props.id
  };

  componentDidMount() {
    this.game = new Chess();

    this.state.socket.on('move', data=>{

      if(this.state.id!==data.id) return;

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
        squareStyles: squareStyling({ pieceSquare, history })
      }));
    })
  }

  //brisanje hajlajtovanja
  removeHighlightSquare = () => {
    this.setState(({ pieceSquare, history }) => ({
      squareStyles: squareStyling({ pieceSquare, history })
    }));
  };

  // prikazivanje mogucih polja
  highlightSquare = (sourceSquare, squaresToHighlight) => {
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

  onDrop = ({ sourceSquare, targetSquare }) => {
    // provjera da li je potez dozvoljen
    if(!this.canMove()) return;

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

    const tId=this.state.id;
    this.state.socket.emit('move', {'id':{tId}, 'from':{sourceSquare}, "to":{targetSquare}, 'replace':'none'});
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
      dropSquareStyle:
        square === "e4" || square === "d4" || square === "e5" || square === "d5"
          ? { backgroundColor: "cornFlowerBlue" }
          : { boxShadow: "inset 0 0 1px 4px rgb(255, 255, 0)" }
    });
  };

  onSquareClick = square => {
    if(!this.canMove()) return;

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
    
    const tId = this.state.id;
    this.state.socket.emit('move', {'id':{tId},'from':{from}, "to":{square}, 'replace':'none'});
  };

  onSquareRightClick = square =>
    this.setState({
      squareStyles: { [square]: { backgroundColor: "darkBlue" } }
    });

    
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
      onSquareRightClick: this.onSquareRightClick
    });
  }
}

export default function Game(props) {
  return (
    <div>
      <HumanVsHuman color={props.color} socket={props.socket} id={props.id}>
        {({
          position,
          onDrop,
          onMouseOverSquare,
          onMouseOutSquare,
          squareStyles,
          dropSquareStyle,
          onDragOverSquare,
          onSquareClick,
          onSquareRightClick
        }) => (
          <Chessboard
            id="humanVsHuman"
            width={320}
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
            lightSquareStyle={{ backgroundColor: "AliceBlue" }}
            darkSquareStyle={{ backgroundColor: "CornFlowerBlue" }}
          />
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