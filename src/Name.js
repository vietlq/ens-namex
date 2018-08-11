import React from 'react'
import { Link } from 'react-router-dom'
import { Alert, Table } from 'react-bootstrap'

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
          <td>For sale</td>
        </tr>
        <tr>
          <th>Other info</th>
          <td>Yes</td>
        </tr>
      </tbody>
    </Table>
  </div>
)

export default Name
