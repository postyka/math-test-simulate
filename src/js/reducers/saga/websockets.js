import CryptoJS from 'crypto-js';
import config from '../../config';
import {eventChannel} from 'redux-saga';
import * as userActions from '../../actions/user';
import * as gameActions from '../../actions/game';
import {getSessionId} from '../app';
import {put, take, all, select, call, fork, race, cancel} from 'redux-saga/effects';

export function * socketTaskManager() {
    while(true) {
        const { payload } = yield take('WEBSOCKET_START_TASK');
        const task = yield fork(connectSocket);
        let uri = payload ? payload.redirectUri : config.apiUrlWS.replace('{apiKey}', config.apiKey);
        yield put({ type: 'WEBSOCKET_AUTH', payload: { uri, task }});
    }
}

function * connectSocket() {
    while (true) {
        const { payload  } = yield take('WEBSOCKET_AUTH');
        try {
            const socket = new WebSocket(payload.uri);
            const channel = yield call(initSocketListener, socket, config.apiSecretKey);
            yield race({
                task: all([
                    call(internalListener, socket),
                    call(externalListener, channel, payload.task)
                ]),
            });
        } catch (e) {
            console.warn(e);
        }
    }
}

function * internalListener (socket) {
    while (true) {
        const { payload } = yield take('WEBSOCKET_SEND');
        if (payload.token === undefined) {
            const sessionId = yield select(getSessionId);
            payload['sessionId'] = sessionId;
        }
        socket.send(JSON.stringify(payload));

    }
}

function * externalListener (chanel, task) {
    while (true) {
        const action = yield take(chanel);
        if (action.type === 'REDIRECT') {
            yield put({ type: 'WEBSOCKET_START_TASK', payload: action.payload });
            yield cancel(task);
        } else if (action.type === userActions.FIND_MATCH_SUCCESSED) {
            yield put({ type: action.type, payload: action.payload });
            yield put({ type: gameActions.STARTED_GAME});
            yield put({ type: 'REALTIME_START', payload: action.payload });
        } else {
            yield put({type: action.type, payload: action.payload});
        }
    }
}

function initSocketListener(socket, secret) {
    return eventChannel(emit => {
        let authToken, redirectUri, sessionId;
        socket.onmessage = (event) => {
            // LOG
            console.log(event);

            let msg;
            try {
                msg = JSON.parse(event.data)
            } catch (e) {
                return;
            }

            if (msg['authToken']) {
                authToken = msg['authToken']
            }
            if (msg['connectUrl']) {
                redirectUri = msg['connectUrl']
            }

            if (msg['@class'] === '.AuthenticatedConnectResponse') {
                if (msg['nonce']) {
                    const reply = {
                        '@class': '.AuthenticatedConnectRequest',
                        hmac: CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(msg['nonce'], secret))
                    }
                    socket.send(JSON.stringify(reply))
                } else if (msg['sessionId']) {
                    socket.requestCounter = 0;
                    socket.pendingRequests = {};
                    socket.keepAliveInterval = setInterval(() => {
                        socket.send(' ')
                    }, 30000);
                    emit({ type: userActions.STORE_SESSION_ID, payload:{ sessionId: msg['sessionId'] }});
                }
            } else if (msg['@class'] === '.FindPendingMatchesResponse') {
                if(msg['error'] && msg['error']['match'] === 'NOT_IN_PROGRESS'){
                    emit({ type: userActions.CREATE_MATCH_REQUEST });
                }
            } else if (msg['@class'] === '.MatchFoundMessage') {
                emit({ type:userActions.FIND_MATCH_SUCCESSED, payload:msg});
            }
        };

        socket.onopen = (event) => {
            console.log(event);
        }

        socket.onerror = (event) => {
            console.warn(event)
        };

        socket.onclose = (event) => {
            if(redirectUri) {
                emit({ type: 'REDIRECT', payload: { redirectUri }});
            }
            console.log(event)
        }

        return () => {
            socket.close()
        }
    });
}