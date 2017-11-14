import * as game from '../actions/game';

const initState = {
    started: false,
    round: 1,
    questions: [],
};


const reducer = (state = initState, action) => {
    switch (action.type) {
        case game.SET_QUESTIONS:
            return {...state,
                questions: action.payload
            };
            break;
        case game.STARTED_GAME:
            return {...state,
                started: true
            };
            break;
        default:
            return state
    }
}

export default reducer