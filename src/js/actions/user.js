const prefix = "user";

export const LOGGED_GAMESPARKS_REQUEST = `${prefix}_logged_gamesparks_request`;
export const LOGGED_GAMESPARKS_SUCCESSED = `${prefix}_logged_gamesparks_successed`;
export const LOGGED_GAMESPARKS_FAILED = `${prefix}_logged_gamesparks_failed`;

export const CHANGE_NAME_REQUEST = `${prefix}_change_name_request`;
export const CHANGE_NAME_SUCCESSED = `${prefix}_change_name_successed`;
export const CHANGE_NAME_FAILED = `${prefix}_change_name_failed`;

export const FIND_MATCH_REQUEST = `${prefix}_find_match_request`;
export const CREATE_MATCH_REQUEST = `${prefix}_create_match_request`;
export const FIND_MATCH_SUCCESSED = `${prefix}_find_match_successed`;

export const STORE_SESSION_ID = `${prefix}_store_session_id`;
export const STORE_REALTIME_SESSION = `${prefix}_store_realtime_session`;

export const authUser = (uid) => {
    return (dispatch) => {
        dispatch({
            type: LOGGED_GAMESPARKS_REQUEST,
            payload: { uid },
        });
    }
}

export const findMatch = () => {
    return (dispatch) => {
        dispatch({
            type: FIND_MATCH_REQUEST,
        });
    }
}

export const changeName = (name) => {
	return (dispatch) => {
		dispatch({
			type: CHANGE_NAME_REQUEST,
			payload: { name },
		});
	}
}

