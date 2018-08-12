import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { DrizzleProvider } from 'drizzle-react'

import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import DirectListing from './DirectListing.json'
import ENSRegistry from './ENSRegistry.json'

const options = {
  contracts: [
    DirectListing,
    ENSRegistry
  ]
}

ReactDOM.render((
    <BrowserRouter>
      <DrizzleProvider options={options}>
        <App/>
      </DrizzleProvider>
    </BrowserRouter>
), document.getElementById('root'))
registerServiceWorker()
