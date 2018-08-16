import React, { Component } from 'react'
import { Alert, FormGroup, FormControl, InputGroup, Button, Form } from 'react-bootstrap'
import { sha3, toWei } from 'web3-utils'
import PropTypes from 'prop-types'
import { drizzleConnect } from 'drizzle-react'
import CustomContractData from './CustomContractData'
import { namehash } from './Name'
import Deed from './contracts/Deed.json'

function labelhash(label) {
  return sha3(label.slice(0, -6))
}

class Sell extends Component {
  state = {"deedOwner": null, "deedPrevOwner": null}
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
  getOwners = async (deedAddr) => {
    const web3 = this.context.drizzle.web3;
    //console.log("this.props.web3 => ", this.props.web3);
    //console.log("web3 => ", web3);
    //console.log("web3.eth => ", web3.eth);
    //console.log("Deed.abi => ", Deed.abi);
    const DeedContract = new web3.eth.Contract(Deed.abi, deedAddr);
    console.log("DeedContract => ", DeedContract);
    const deedOwner = await DeedContract.methods.owner().call({from: this.props.accounts[0]});
    const deedPrevOwner = await DeedContract.methods.previousOwner().call({from: this.props.accounts[0]});
    this.state.deedOwner = deedOwner;
    this.state.deedPrevOwner = deedPrevOwner;
    return (
      <div>
        <h4>The Deed's Owner: {deedOwner}</h4>
        <h4>The Deed's Previous Owner: {deedPrevOwner}</h4>
      </div>
    )
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
                && (owner !== this.context.drizzle.contracts.DirectListing.address)) {
                return (
                  <Alert bsStyle="danger">
                    You do not own this domain.
                  </Alert>
                )
              } else {
                return <div/>
              }
            }
          }
        />

        <CustomContractData
          contract="DirectListing"
          method="deedAddr"
          methodArgs={[labelhash(this.props.match.params.name)]}
          accounts={this.props.accounts}
          render={
            deedAddr => {
              if (!deedAddr) {
                return (<div/>)
              } else {
                /*
                const web3 = this.context.drizzle.web3;
                //console.log("this.props.web3 => ", this.props.web3);
                //console.log("web3 => ", web3);
                //console.log("web3.eth => ", web3.eth);
                //console.log("Deed.abi => ", Deed.abi);
                const DeedContract = new web3.eth.Contract(Deed.abi, deedAddr);
                console.log("DeedContract => ", DeedContract);
                const deedOwner = DeedContract.methods.owner().call({from: this.props.accounts[0]}).then(result => {
                  console.log('DeedContract.owner(): result => ', result);
                }).catch(error => {
                  console.log('DeedContract.owner(): error => ', error);
                });
                const deedPrevOwner = DeedContract.methods.previousOwner().call({from: this.props.accounts[0]}).then(result => {
                  console.log('DeedContract.previousOwner(): result => ', result);
                }).catch(error => {
                  console.log('DeedContract.previousOwner(): error => ', error);
                });
                const callResult = Promise.all([deedOwner, deedPrevOwner]);
                console.log('callResult => ', callResult);
                return (
                  <div>
                  </div>
                )
                */
                this.getOwners(deedAddr).then(result => {
                  console.log('this.state => ', this.state);
                  return result;
                }).catch(error => {
                  return (<div/>)
                });
                return (
                  <div>
                    <h4>Deed Owner: {this.state.deedOwner}</h4>
                    <h4>Deed Previous Owner: {this.state.deedPrevOwner}</h4>
                  </div>
                )
              }
            }
          }
        />

        <CustomContractData
          contract="ENSRegistry"
          method="owner"
          methodArgs={[namehash(this.props.match.params.name)]}
          accounts={this.props.accounts}
          render={
            owner => {
              if ((owner !== this.context.drizzle.contracts.DirectListing.address)) {
                console.log("accounts => ", this.props.accounts);

                return (
                  // TODO: and deed previous owner not accounts[0]
                  <CustomContractData
                    contract="DirectListing"
                    method="deedAddr"
                    methodArgs={[labelhash(this.props.match.params.name)]}
                    accounts={this.props.accounts}
                    render={
                      deedAddr => deedAddr && (
                        <h4>
                          Winning Deed Address: {deedAddr}<br/>
                          <Button bsStyle="primary" bsSize="large" onClick={this.transfer}>
                            Transfer to Exchange
                          </Button>
                        </h4>
                      )
                    }
                  />
                )
              } else {
                return (
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
                )
              }
            }
          }
        />
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
    accounts: state.accounts,
    web3: state.web3
  }
}

export default drizzleConnect(Sell, mapStateToProps)

// export default Sell