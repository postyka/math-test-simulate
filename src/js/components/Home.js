import React, {Component} from 'react';
import {connect} from 'react-redux';
import Game from './Game';
import {authUser, findMatch} from '../actions/user';

class Home extends Component {
    state = {
        IDFV: '599F9C00-92DC-4B5C-9464-7971F01F8370',
        userInfo: false,
    }

    render() {
        const {user, match} = this.props;
        const {IDFV, userInfo} = this.state;

        return (
            <div className="app row justify-content-md-center">
                <div className="col-sm-8 col-sm-offset-2">
                    <h3>Authentication</h3>
                    <div className="input-group">
                        <span className="input-group-addon" id="basic-addon1">IDFV device ID</span>
                        <input type="text" className="form-control" placeholder="IDFV"
                               onChange={(e) => this.setState({IDFV: e.target.value})}
                               value={IDFV}/>
                        <span className="input-group-btn">
                            <button className="btn btn-primary"
                                    type="button"
                                    onClick={() => this.props.authUser(IDFV)}
                            >Auth</button>
                        </span>
                    </div>
                    <label className="status">Status: { user !== undefined ? 'Online' : 'Offline' }</label>
                    <div className="input-group">
                        <button className="btn btn-link" type="button"
                                onClick={() => this.setState({userInfo: !userInfo})}
                        >{ userInfo ? 'Hide user info' : 'Show user info'}
                        </button>
                        { user !== undefined && userInfo ?
                            (<pre className="json-print">{JSON.stringify(user, undefined, 2)}</pre>) : null
                        }
                    </div>
                    <hr/>
                    <h3>Matchmaking</h3>
                    <div className="input-group">
                        <button className="btn btn-primary" type="button"
                                onClick={() => this.props.findMatch()}
                        >Find opponent
                        </button>
                    </div>
                    <label>Match ID: {match ? match.matchId : 'No match'}</label>
                    <hr/>
                    <Game/>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.app.user,
        match: state.app.match,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        authUser: (IDFV) => authUser(IDFV)(dispatch),
        findMatch: () => findMatch()(dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);