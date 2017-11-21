import {put, take, takeEvery, all, select, call, fork, race, cancel} from 'redux-saga/effects';

import * as userActions from '../../actions/user';
import * as userSaga from './user';
import * as realtimeActions from '../../actions/game';

import * as websocketsSaga from './websockets';
import * as realtimeSaga from './realtime';

export default function * rootSaga() {
    yield fork(websocketsSaga.socketTaskManager);
    yield fork(realtimeSaga.realtimeTaskManager);
    yield put({ type: 'WEBSOCKET_START_TASK' });
    yield all([
        bindUserActions(),
    ])
}

function * authSaga({payload}) {
    const result = yield call(userSaga.DeviceAuthenticationReques, payload.uid);
    if (result.authToken !== undefined) {
        const user = yield call(userSaga.AccountDetailsRequest, result);
        yield put({type: userActions.LOGGED_GAMESPARKS_SUCCESSED, payload: user});
    } else {
        yield put({type: userActions.LOGGED_GAMESPARKS_FAILED, payload: result});
    }
}

function * changeName({payload}) {
    const result = yield call(userSaga.ChangeUserDetailsRequest, payload);

    if (result) {
        const user = yield call(userSaga.AccountDetailsRequest);
        yield put({type: userActions.CHANGE_NAME_SUCCESSED, payload: user});
    } else {
        yield put({type: userActions.CHANGE_NAME_FAILED, payload: error});
    }
}

function * bindUserActions() {
    yield takeEvery(userActions.LOGGED_GAMESPARKS_REQUEST, authSaga);
    yield takeEvery(userActions.CHANGE_NAME_REQUEST, changeName);
    yield takeEvery(userActions.FIND_MATCH_REQUEST, userSaga.FindPendingMatchesRequest);
    yield takeEvery(userActions.CREATE_MATCH_REQUEST, userSaga.MatchmakingRequest);
    yield takeEvery(realtimeActions.SEND_ANSWER, realtimeSaga.sendAnswer);
}
