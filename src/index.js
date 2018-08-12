import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { DrizzleProvider } from 'drizzle-react'

import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import DirectListing from './contracts/DirectListing.json'
import ENSRegistry from './contracts/ENSRegistry.json'
import Registrar from './contracts/Registrar.json'

const options = {
  contracts: [
    DirectListing,
    ENSRegistry,
    Registrar
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
