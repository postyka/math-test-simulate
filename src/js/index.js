import React from 'react';
import '../scss/style.scss';
import ReactDOM from 'react-dom';
import App from './components/App';
import rootReducer from './reducers';
import rootSaga from './reducers/saga';
import Routes from './navigation/Routes';
import createSagaMiddleware from 'redux-saga';
import {createStore, applyMiddleware} from 'redux';

const sagaMiddleware = createSagaMiddleware();
const store = createStore(rootReducer, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(rootSaga);

ReactDOM.render(<App store={store}><Routes/></App>, document.getElementById('root'));
