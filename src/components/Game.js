import React, { Component, useState } from 'react'
import Board from './Board';
import { getItem, setItem } from '../utils/helper';

export default class Game extends Component {
    constructor(props) {
        super(props);
        let currentGame = getItem("currentGame");
        let data = JSON.parse(getItem("gameDetail"));
        if(!currentGame || !data) {
            this.state = {
                isPvPmode: true,
                xIsNext: true,
                stepNumber: 0,
                history: [
                    { squares: Array(9).fill(null) }
                ]
            };
            setItem("gameDetail", JSON.stringify([this.state]));
            setItem("currentGame", "0");
        }
        data = JSON.parse(getItem("gameDetail"));
        currentGame = getItem("currentGame");
        this.state = data[currentGame];
    }
    
    setMode(event) {
        this.setState({mode : event.target.value});
    }

    jumpTo(step){
        const data = JSON.parse(getItem("gameDetail"));
        const currentGame = Math.floor(step / 10);
        data[currentGame].stepNumber = step % 10;
        data[currentGame].xIsNext = ((step % 2) === 0);
        setItem("gameDetail", JSON.stringify(data));
        setItem("currentGame", currentGame);
        this.setState(data[currentGame]);
    }

    handleClick(i) {
        let history = this.state.history.slice(0, this.state.stepNumber + 1);
        let current = history[history.length - 1];
        let squares = current.squares.slice();
        let winner = calculateWinner(squares);
        if (winner || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        winner = calculateWinner(squares);

        if(!winner && !this.state.isPvPmode && this.state.stepNumber < 8) {
            console.log("AI");
            history.push({ squares: squares });
            this.state.xIsNext = !this.state.xIsNext;
            let next;
            while(1) {
                next = Math.floor(Math.random() * 9);
                if(!squares[next]) break;
            }
            squares[next] = this.state.xIsNext ? 'X' : 'O';
        }
        const data = JSON.parse(getItem("gameDetail"));
        const currentGame = getItem("currentGame");
        data[currentGame] = {
            ...data[currentGame],
            history: history.concat({
                squares: squares
            }),
            xIsNext: !this.state.xIsNext,
            stepNumber: history.length
        };
        setItem("gameDetail", JSON.stringify(data));
        this.setState({
            history: history.concat({
                squares: squares
            }),
            xIsNext: !this.state.xIsNext,
            stepNumber: history.length
        });
    }

    CreateNewGame() {
        if(!this.state.mode) {
            alert("please select mode");
            return;
        }
        const currentGame = Number(getItem("currentGame")) + 1;
        const newGame = {
            isPvPmode: this.state.mode === "PvP",
            xIsNext: true,
            stepNumber: 0,
            history: [
                { squares: Array(9).fill(null) }
            ]
        };
        const data = JSON.parse(getItem("gameDetail"));
        data[currentGame] = newGame;
        setItem("currentGame", currentGame);
        setItem("gameDetail", JSON.stringify(data));
        this.setState(newGame);
    }

    render() {
        const moves = [];
        const status = [];

        let history, current, winner;

        const data = JSON.parse(getItem("gameDetail"));
        data.map((d, i) => {
            history = d.history;
            current = history[d.stepNumber];
            winner = calculateWinner(current.squares);

            moves[i] = history.map((step, move) => {
                const desc = move ? 'Go to #' + move : 'Start the Game';
                return (
                    <li key={move}>
                        <button onClick={() => { this.jumpTo(i * 10 + move) }}>
                            {desc}
                        </button>
                    </li>
                )
            });
    
            if (winner) {
                status[i] = 'Winner is ' + winner;
            } else {
                status[i] = 'Next Player is ' + (d.xIsNext ? 'X' : 'O');
            }
        });
        
        history = this.state.history;
        current = history[this.state.stepNumber];

        return (
            <>
                <div className="game">
                    <div className="game-board">
                        <Board onClick={(i) => this.handleClick(i)}
                            squares={current.squares} />
                    </div>
                </div>
                <div onChange={this.setMode.bind(this)} style={{padding: 20}}>
                    <input type="radio" value="PvP" name="mode"/> PvP
                    <input type="radio" value="PvC" name="mode"/> PvC
                    <button onClick={() => this.CreateNewGame()} style={{marginLeft: 10}}>New Game</button>
                </div>
                <div className="game">
                    {data.map((d, i) => {
                        return (
                            <div className="game-info">
                                <div>{d.isPvPmode ? 'PvP Mode' : 'PvC Mode'}</div>
                                <div>{status[i]}</div>
                                <ul>{moves[i]}</ul>
                            </div>
                        );
                    })}
                </div>
            </>
        )
    }
}

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[b] === squares[c]) {
            return squares[a];
        }
    }

    return null;
}