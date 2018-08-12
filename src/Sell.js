import React, { Component } from 'react'
import { Alert, FormGroup, FormControl, InputGroup, Button, Form } from 'react-bootstrap'
import { sha3 } from 'web3-utils'
import PropTypes from 'prop-types'
import { drizzleConnect } from 'drizzle-react'
import CustomContractData from './CustomContractData'
import { namehash } from './Name'

function labelhash(label) {
  return sha3(label.slice(0, -4))
}

class Sell extends Component {
  state = {}
  handleAmountChange = event => this.setState({amount: event.target.value})
  handleTimeChange = event => this.setState({time: event.target.value})
  transfer = () => this.context.drizzle.contracts.Registrar.methods.transfer(labelhash(this.props.match.params.name), this.context.drizzle.contracts.DirectListing.address).send()
  offer = () => this.context.drizzle.contracts.DirectListing.methods.offer(labelhash(this.props.match.params.name), Number(this.state.amount), Number(this.state.time)).send()
  render() {
    return (
      <div>
        <h2>Sell {this.props.match.params.name}</h2>
        <CustomContractData contract="ENSRegistry" method="owner" methodArgs={[namehash(this.props.match.params.name)]} render={
          owner => owner !== this.props.accounts[0] && owner !== this.context.drizzle.contracts.DirectListing.address && (
            <Alert bsStyle="danger">
              You do not own this domain.
            </Alert>
          )} />
        <CustomContractData contract="ENSRegistry" method="owner" methodArgs={[namehash(this.props.match.params.name)]} render={
          owner => owner !== this.context.drizzle.contracts.DirectListing.address ? ( // TODO: and deed previous owner not accounts[0]
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
                <Button bsStyle="primary" bsSize="large" onClick={this.offer}>
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