import React, {Component} from 'react';
import {connect} from 'react-redux';

class Game extends Component {
    state = {
        seconds: 0,
        intervalId: null
    };

    componentDidUpdate() {
        if (this.props.started && !this.state.intervalId) {
            const intervalId = setInterval(this.update, 10)
            this.setState({ intervalId });
        } else if (this.state.seconds > 10) {
            clearInterval(this.state.intervalId);
            this.setState({ intervalId : null, seconds: 0 });
        }
    }

    update = () => {
        this.setState({ seconds: this.state.seconds + 0.01 });
    }

    renderGame = () => {
        const {round, started, questions} = this.props;
        const {seconds} = this.state;
        if (started && questions.length) {
           var result = [];
           for (var i = 0; i < 10; i++) {
               result.push(questions[i]._id.$oid);
           }
           console.log(JSON.stringify(result))

            return (
                <div>
                    <label>Round {round} of 10</label>
                    <div className="question">{questions[round - 1].text}</div>
                    <div className="w3-light-grey">
                        <div className="w3-green" style={{height: '24px', width: (seconds * 10) + '%'}}></div>
                    </div>
                    <div className="answer">Answer</div>
                    <div className="answer">Answer</div>
                    <div className="answer">Answer</div>
                    <div className="answer">Answer</div>
                </div>
            );
        } else {
            return (<label>Game not started</label>);
        }
    }

    render() {
        return (
            <div>
                <h3>Game</h3>
                { this.renderGame() }
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        round: state.game.round,
        started: state.game.started,
        questions: state.game.questions,
    }
}

const mapDispatchToProps = dispatch => {
    return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(Game);