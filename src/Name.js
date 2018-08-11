import React from 'react'
import { Link } from 'react-router-dom'
import { Alert, Table } from 'react-bootstrap'
// import { drizzleConnect } from 'drizzle-react'
import CustomContractData from './CustomContractData'
import { utf8ToHex } from 'web3-utils'

const transformStatus = value => {
  return !!value.price ? <span>For sale</span> : <span>Unknown</span>
}

const Name = ({ match }) => (
  <div>
    <h2>{match.params.name}</h2>
    <Alert bsStyle="info">
      You own this domain. Want to <Link to={`/name/${match.params.name}/sell`}>sell it</Link>?
    </Alert>
    <Alert bsStyle="info">
      You own this domain, and have listed it for sale. Want to <Link to={`/name/${match.params.name}/sell`}>cancel the sale</Link>?
    </Alert>
    <Alert bsStyle="warning">
      This domain is not for sale.
    </Alert>
    <Alert bsStyle="success">
      This domain is for sale! Put in an offer.
    </Alert>
    <Table bordered condensed>
      <tbody>
        <tr>
          <th>Status</th>
          <td><CustomContractData contract="DirectListing" method="offerings" methodArgs={[utf8ToHex(match.params.name)]} transform={transformStatus} /></td>
        </tr>
        <tr>
          <th>Owner</th>
          <td><CustomContractData contract="DirectListing" method="offerings" methodArgs={[utf8ToHex(match.params.name)]} returnKey="nodeOwner" /></td>
        </tr>
        <tr>
          <th>Price</th>
          <td><CustomContractData contract="DirectListing" method="offerings" methodArgs={[utf8ToHex(match.params.name)]} returnKey="price" /></td>
        </tr>
        <tr>
          <th>Expires at</th>
          <td><CustomContractData contract="DirectListing" method="offerings" methodArgs={[utf8ToHex(match.params.name)]} returnKey="expireAt" /></td>
        </tr>
      </tbody>
    </Table>
  </div>
)

// const mapStateToProps = state => {
//   return {
//     drizzleStatus: state.drizzleStatus,
//     SimpleStorage: state.contracts.DirectListing
//   }
// }

// export default drizzleConnect(Name, mapStateToProps)

export default Name
