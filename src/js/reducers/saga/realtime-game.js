import {eventChannel} from 'redux-saga';
import {put, take, all, select, call, fork, race, cancel} from 'redux-saga/effects';

export function * socketTaskManager() {
    while(true) {
        const { payload } = yield take('REALTIME_START_TASK');
        const task = yield fork(connectSocket);
        let uri = 'wss://' + payload.host + ':' + payload.port;
        yield put({ type: 'REALTIME_CONNECT', payload: { uri, task, accessToken: payload.accessToken }});
    }
}

function * connectSocket() {
    while (true) {
        const { payload  } = yield take('REALTIME_CONNECT');
        try {
            const socket = new WebSocket(payload.uri);
            socket.binaryType = "arraybuffer";
            const channel = yield call(initSocketListener, socket, payload.accessToken);
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
        const { payload } = yield take('REALTIME_SEND');
        console.log(payload);
        //socket.send(JSON.stringify(payload));
    }
}

function * externalListener (chanel, task) {
    while (true) {
        const action = yield take(chanel);
        yield put({type: action.type, payload: action.payload});
    }
}

function initSocketListener(socket, accessToken) {
    return eventChannel(emit => {
        socket.onmessage = (event) => {
            // LOG
            console.log(event);
        };

        socket.onopen = (event) => {
            emit({ type: 'REALTIME_SEND', payload: body });
        }

        socket.onerror = (event) => {
            console.warn(event)
        };

        socket.onclose = (event) => {
            console.log(event)
        }

        return () => {
            socket.close()
        }
    });
}