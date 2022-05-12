import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { getChainOptions, WalletProvider } from '@terra-money/wallet-provider'
import { Provider } from 'react-redux';
import store from './store/store'

getChainOptions().then((chainOptions) => {
  ReactDOM.render(
    <React.StrictMode>
      <Provider store={store}>
      <WalletProvider {...chainOptions}>
        <App />
      </WalletProvider>
      </Provider>
    </React.StrictMode>,
    document.getElementById('root')
  )
})

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
