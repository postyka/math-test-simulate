import { getUser } from '../app';
import config from '../../config';
import { put, take, takeEvery, all, select, call, fork } from 'redux-saga/effects'

export function * DeviceAuthenticationReques(deviceId) {
	const url = config.apiUrl.replace('{apiKey}', config.apiKey)
		+ '/rs/device/' + config.apiSecretKey + '/DeviceAuthenticationRequest';

	const body = {
		"@class": ".DeviceAuthenticationRequest",
		"deviceId": deviceId,
		"deviceOS": 'ANDROID',
	};

	yield put({type: 'WEBSOCKET_SEND', payload: body});

	return yield fetch(url, {
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		method: "POST",
		body: JSON.stringify(body)
	}).then(result => result.json())
		.then(result => {
			return result;
		}).catch(error => {
			return error;
		})
}

export function * ChangeUserDetailsRequest(payload) {
	const user = yield select(getUser);
	const url = config.apiUrl.replace('{apiKey}', config.apiKey)
		+ '/rs/device/' + config.apiSecretKey + '/ChangeUserDetailsRequest';

	const body = {
		"@class": ".ChangeUserDetailsRequest",
		"playerId": user.userId,
		"displayName": payload.name,
		"scriptData": {
			"totalScore": 0,
		}
	};

	return yield fetch(url, {
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		method: "POST",
		body: JSON.stringify(body)
	}).then(result => JSON.parse(result._bodyInit))
		.then(() => {
			return true;
		}).catch(() => {
			return false;
		});
}

export function * AccountDetailsRequest(user) {
	if (!user) {
         user = yield select(getUser);
    }

	const url = config.apiUrl.replace('{apiKey}', config.apiKey)
		+ '/rs/device/' + config.apiSecretKey + '/AccountDetailsRequest';

	const body = {
		"@class": ".AccountDetailsRequest",
		"playerId": user.userId,
	};

	return yield fetch(url, {
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		method: "POST",
		body: JSON.stringify(body)
	}).then(result => result.json())
		.then(result => {
			return result;
		}).catch(() => {
			return null;
		});
}

export function * GetUploadUrlRequest(user) {
    const url = config.apiUrl.replace('{apiKey}', config.apiKey)
        + '/rs/device/' + config.apiSecretKey + '/GetUploadUrlRequest';

    const body = {
        "@class": ".GetUploadUrlRequest",
        "playerId": user.userId,
    };

    return yield fetch(url, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(body)
    }).then(result => result.json())
        .then(result => {
            return result;
        }).catch(error => {
            return error;
        })
}

export function * GetUploadedRequest(user) {
    const url = config.apiUrl.replace('{apiKey}', config.apiKey)
        + '/rs/device/' + config.apiSecretKey + '/GetUploadedRequest';

    const body = {
        "@class": ".GetUploadedRequest",
        "playerId": user.userId,
		"uploadId": user.scriptData.avatarId
    };

    return yield fetch(url, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(body)
    }).then(result => result.json())
        .then(result => {
            return result;
        }).catch(error => {
            return error;
        })
}

export function * MatchmakingRequest() {
    const user = yield select(getUser);
    const body = {
        "@class": ".MatchmakingRequest",
        "playerId": user.userId,
        "skill": 0,
        "matchShortCode": "TEST",
    }

    yield put({type: 'WEBSOCKET_SEND', payload: body});
}

export function * FindPendingMatchesRequest() {
    const user = yield select(getUser)
    const body = {
        "@class": ".FindPendingMatchesRequest",
        "matchShortCode": "TEST",
    }
    yield put({type: 'WEBSOCKET_SEND', payload: body});
}

export function * sendTestData() {
    const body = {
        "@class": ".Game",
	};
    yield put({type: 'WEBSOCKET_SEND', payload: body});
}