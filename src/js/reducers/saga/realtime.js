import myRTSession from '../my-rt-session';
import {eventChannel} from 'redux-saga';
import {put, take, all, select, call, fork, race, cancel} from 'redux-saga/effects';
import * as gameActions from '../../actions/game';

export function * realtimeTaskManager() {
    while (true) {
        const {payload} = yield take('REALTIME_START');
        try {
            myRTSession.start(payload['accessToken'], payload['host'], payload['port']);
            const channel = yield call(realtimeListener);
            yield race({
                task: all([
                    call(internalListener),
                    call(externalListener, channel)
                ]),
            });
        } catch (e) {
            console.warn(e);
        }
    }
}


function * internalListener() {
    while (true) {
        const {payload} = yield take('REALTIME_SEND');
        const data = RTData.get();
        data.setLong(1, 100);
        myRTSession.session.sendRTData(1, GameSparksRT.deliveryIntent.RELIABLE, data, []);
    }
}

function * externalListener(chanel) {
    while (true) {
        const action = yield take(chanel);
        yield put({type: action.type, payload: action.payload});
    }
}

function realtimeListener() {
    return eventChannel(emit => {
            myRTSession.onPacket = (packet) => {
                let data = null;
                for (let i = 0; i < GameSparksRT.MAX_RTDATA_SLOTS; i += 1) {
                    if(packet.data.data[i].asString()) {
                        data = JSON.parse(packet.data.data[i].asString().slice(1, -1));
                        break;
                    }
                }

                if (myRTSession.onPacketCB != null) {
                    myRTSession.onPacketCB(packet);
                }

                if (packet.opCode === 2) {
                    emit({ type: gameActions.SET_QUESTIONS, payload: data});
                }
            };

            const iv = setInterval(() => {
                myRTSession.session.update();
            }, 10);

            return () => {
                clearInterval(iv)
            }
        }
    )
}

export function * sendAnswer({ payload }) {
    console.log(payload)
}