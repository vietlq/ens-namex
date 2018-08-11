import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { DrizzleProvider } from 'drizzle-react'

import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import DirectListing from './DirectListing.json'

const options = {
  contracts: [
    DirectListing
  ]
}

ReactDOM.render((
  <DrizzleProvider options={options}>
    <BrowserRouter>
      <App/>
    </BrowserRouter>
  </DrizzleProvider>
), document.getElementById('root'))
registerServiceWorker()
