import * as user from '../actions/user';

const initState = { };

const reducer = (state = initState, action) => {
	switch (action.type) {
		case user.LOGGED_GAMESPARKS_SUCCESSED: {
			return {...state,
				user: action.payload,
				fetchingGamesparkReauest: false
			}
		}
		case user.LOGGED_GAMESPARKS_FAILED: {
			return {...state,
				user: action.payload,
				fetchingGamesparkReauest: false
			}
		}
		case user.CHANGE_NAME_SUCCESSED: {
			return {...state,
				user: action.payload
			}
		}
		case user.CHANGE_NAME_FAILED: {
			return {...state,
				user: action.payload
			}
		}
        case user.CHANGE_AVATAR_SUCCESSED: {
            return {...state,
                user: action.payload
            }
        }
        case user.CHANGE_AVATAR_FAILED: {
            return {...state,
                user: action.payload
            }
        }
        case user.STORE_SESSION_ID: {
            return {...state,
                sessionId: action.payload.sessionId
            }
        }
		case user.STORE_REALTIME_SESSION: {
			console.log(action);
			return {...state,
				realtimeSession: action.payload
			}
		}
		default:
			return state
	}
}

export const getUser = state => state.app.user;
export const getSessionId = state => state.app.sessionId;
export const getRealtimeSession = state => state.app.realtimeSession;

export default reducer