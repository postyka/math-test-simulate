import React, {Component} from 'react';
import {connect} from 'react-redux';
import {authUser, findMatch, sendData} from '../actions/user';

class Home extends Component {
    state = {
        IDFV: '599F9C00-92DC-4B5C-9464-7971F01F8370',
        userInfo: false,
    }

    render() {
        const {user} = this.props;
        const {IDFV, userInfo} = this.state;

        return (
            <div className="app row justify-content-md-center">
                <div className="col-sm-8 col-sm-offset-2">
                    <label>Authentication</label>
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
                    <label>Game</label>
                    <div className="input-group">
                        <button className="btn btn-primary" type="button"
                                onClick={() => this.props.findMatch()}
                        >Find opponent
                        </button>
                        <button className="btn btn-primary" type="button"
                                onClick={() => this.props.sendData()}
                        >Send
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.app.user,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        authUser: (IDFV) => authUser(IDFV)(dispatch),
        findMatch: () => findMatch()(dispatch),
        sendData: () => sendData()(dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);