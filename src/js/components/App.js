import React from 'react';
import {Provider} from 'react-redux';
import { BrowserRouter } from 'react-router-dom'

const App = ({store, children}) => <BrowserRouter>
    <div>
        <Provider store={store}>
            {children}
        </Provider>
    </div>
</BrowserRouter>

export default App;
