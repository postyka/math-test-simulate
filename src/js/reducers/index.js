import { combineReducers } from "redux";
import app from './app';
import game from './game';

const rootReducer = combineReducers({
	app,
	game,
});

export default rootReducer;