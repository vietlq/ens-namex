import React, { Component } from 'react'
import { Alert, FormGroup, FormControl, InputGroup, Button, Form } from 'react-bootstrap'
import { sha3, toWei } from 'web3-utils'
import PropTypes from 'prop-types'
import { drizzleConnect } from 'drizzle-react'
import CustomContractData from './CustomContractData'
import { namehash } from './Name'

function labelhash(label) {
  return sha3(label.slice(0, -6))
}

class Sell extends Component {
  state = {}
  handleAmountChange = event => this.setState({amount: event.target.value})
  // TTL
  handleTimeChange = event => this.setState({time: event.target.value})
  transfer = async () => {
    let Registrar = this.context.drizzle.contracts.Registrar;
    let transferMethod = Registrar.methods.transfer;
    let DirectListing = this.context.drizzle.contracts.DirectListing;
    console.log('transferMethod => ');
    console.log(transferMethod);

    let transferMethodInstance = transferMethod(labelhash(this.props.match.params.name), DirectListing.address);
    console.log('transferMethodInstance => ', transferMethodInstance);

    transferMethodInstance.send().then((result) => {
      console.log('result => ', result);
    }).catch((error) => {
      console.log('error => ', error);
    });
  }
  offer = async () => {
    let DirectListing = this.context.drizzle.contracts.DirectListing;
    let offerMethod = DirectListing.methods.offer;
    // TTL + current epoch (everything in seconds)
    const expireAtEpoch = parseInt(this.state.time, 10) + Math.round((new Date()).getTime() / 1000);
    const offerAmount = toWei(this.state.amount, "ether");
    let offerMethodInstance = offerMethod(labelhash(this.props.match.params.name), offerAmount, Number(expireAtEpoch));

    console.log('offerAmount => ', offerAmount);
    console.log('About to offer the amount: ', this.state.amount);
    console.log('About to offer the amount in Number format: ', Number(this.state.amount));

    offerMethodInstance.send().then((result) => {
      console.log('result => ', result);
    }).catch((error) => {
      console.log('error => ', error);
    });
  }
  render() {
    return (
      <div>
        <h2>Sell {this.props.match.params.name}</h2>
        <h4>Labelhash: {labelhash(this.props.match.params.name)}</h4>
        <h4>Namehash: {namehash(this.props.match.params.name)}</h4>
        <CustomContractData
          contract="ENSRegistry"
          method="owner"
          methodArgs={[namehash(this.props.match.params.name)]}
          render={
            owner => {
              if ((owner !== this.props.accounts[0])
                && (owner !== this.context.drizzle.contracts.DirectListing.address))
              {
                return (
                  <Alert bsStyle="danger">
                    You do not own this domain.
                  </Alert>
                )
              }
              else
              {
                return <div/>
              }
            }
          }
        />
        <CustomContractData contract="ENSRegistry" method="owner" methodArgs={[namehash(this.props.match.params.name)]} render={
          owner => (owner !== this.context.drizzle.contracts.DirectListing.address) ? ( // TODO: and deed previous owner not accounts[0]
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