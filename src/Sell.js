import React, { Component } from 'react'
import { Alert, Table, FormGroup, FormControl, InputGroup, Button, Form } from 'react-bootstrap'
import { sha3 } from 'web3-utils'
import PropTypes from 'prop-types'
import { drizzleConnect } from 'drizzle-react'
import CustomContractData from './CustomContractData'

function namehash(name) {
  var node = '0x0000000000000000000000000000000000000000000000000000000000000000';
  if (name != '') {
      var labels = name.split(".");
      for(var i = labels.length - 1; i >= 0; i--) {
          node = sha3(node + sha3(labels[i]).slice(2), {encoding: 'hex'});
      }
  }
  return node.toString();
}

function labelhash(label) {
  return sha3(label.slice(0, -4))
}

class Sell extends Component {
  state = {}
  handleAmountChange = event => this.setState({amount: event.target.value})
  handleTimeChange = event => this.setState({time: event.target.value})
  transfer = () => this.context.drizzle.contracts.Registrar.methods.transfer(labelhash(this.props.match.params.name), this.context.drizzle.contracts.DirectListing.address)
  buy = () => this.context.drizzle.contracts.DirectListing.methods.offer(labelhash(this.props.match.params.name), Number(this.state.amount), Number(this.state.time)).send()
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
        <CustomContractData contract="ENSRegistry" method="owner" methodArgs={[labelhash(this.props.match.params.name)]} render={
          owner => owner !== this.context.drizzle.contracts.DirectListing.address ? (
            <Button bsStyle="primary" bsSize="large" onClick={this.transfer}>
              Transfer to Exchange
            </Button>
          ) : (
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
                <Button bsStyle="primary" bsSize="large" onClick={this.buy}>
                  Submit
                </Button>
              </FormGroup>
            </Form>
          )} />
      </div>
    )
  }
}

Sell.contextTypes = {
  drizzle: PropTypes.object
}

const mapStateToProps = state => {
  return {
    ENSRegistry: state.contracts.ENSRegistry,
    accounts: state.accounts
  }
}

export default drizzleConnect(Sell, mapStateToProps)

// export default Sell