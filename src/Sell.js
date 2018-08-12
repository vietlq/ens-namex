import React, { Component } from 'react'
import { Alert, Table, FormGroup, FormControl, InputGroup, Button, Form } from 'react-bootstrap'
import { sha3 } from 'web3-utils'
import PropTypes from 'prop-types'

function labelhash(label) {
  return sha3(label.slice(0, -4))
}

class Sell extends Component {
  state = {}
  handleAmountChange = event => {
    this.setState({amount: event.target.value})
  }
  handleTimeChange = event => {
    this.setState({time: event.target.value})
  }
  render() {
    return (
      <div>
        <h2>Sell {this.props.match.params.name}</h2>
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
              <FormControl type="number" placeholder="Offer amount" onChange={this.handleAmountChange} />
              <InputGroup.Addon>ETH</InputGroup.Addon>
            </InputGroup>{ ' ' }
            <InputGroup>
              <FormControl type="number" placeholder="TTL" onChange={this.handleTimeChange} />
              <InputGroup.Addon>seconds</InputGroup.Addon>
            </InputGroup>{ ' ' }
            <Button bsStyle="primary" bsSize="large" onClick={() => this.context.drizzle.contracts.DirectListing.methods.offer(labelhash(this.props.match.params.name), Number(this.state.amount), Number(this.state.time)).send()}>
              Submit
            </Button>
          </FormGroup>
        </Form>
      </div>
    )
  }
}

Sell.contextTypes = {
  drizzle: PropTypes.object
}

export default Sell