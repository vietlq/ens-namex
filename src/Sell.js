import React from 'react'
import { Alert, Table, FormGroup, FormControl, InputGroup, Button, Form } from 'react-bootstrap'

const Sell = ({ match }) => (
  <div>
    <h2>Sell {match.params.name}</h2>
    <Alert bsStyle="danger">
      You do not own this domain.
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
    <Form inline>
      <FormGroup bsSize="large">
        <InputGroup>
          <FormControl type="number" placeholder="Offer amount" />
          <InputGroup.Addon>ETH</InputGroup.Addon>
        </InputGroup>{ ' ' }
        <InputGroup>
          <FormControl type="number" placeholder="TTL" />
          <InputGroup.Addon>seconds</InputGroup.Addon>
        </InputGroup>{ ' ' }
        <Button bsStyle="primary" bsSize="large">
          Submit
        </Button>
      </FormGroup>
    </Form>
  </div>
)

export default Sell