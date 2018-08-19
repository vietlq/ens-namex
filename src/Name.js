import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { drizzleConnect } from 'drizzle-react'
import CustomContractData from './CustomContractData'
import { sha3, fromWei, toWei } from 'web3-utils'
import PropTypes from 'prop-types'
import { Alert, Table, FormGroup, FormControl, InputGroup, Button, Form } from 'react-bootstrap'
import Deed from './contracts/Deed.json'

const ZERO_ADDR = '0x0000000000000000000000000000000000000000';
const ZERO_UINT256 = '0x0000000000000000000000000000000000000000000000000000000000000000';

export function namehash(name) {
  var node = ZERO_UINT256;
  if (name !== '') {
      var labels = name.split(".");
      for(var i = labels.length - 1; i >= 0; i--) {
          node = sha3(node + sha3(labels[i]).slice(2), {encoding: 'hex'});
      }
  }
  return node.toString();
}

function labelhash(label) {
  return sha3(label.slice(0, -6))
}

class Name extends Component {
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
    if (!this.props.match.params.name) return <p>Loading...</p>
    return (
      <div>
        <h2>{this.props.match.params.name}</h2>
        <h4>Labelhash: {labelhash(this.props.match.params.name)}</h4>
        <h4>Namehash: {namehash(this.props.match.params.name)}</h4>

        <CustomContractData
          contract="DirectListing"
          method="deedAddr"
          methodArgs={[labelhash(this.props.match.params.name)]}
          accounts={this.props.accounts}
          render={
            deedAddr => deedAddr && (
              <h4>
                The winning deed: {deedAddr}
              </h4>
            )
          }
        />

        <h4>The DirectListing address: {this.context.drizzle.contracts.DirectListing.address}</h4>
        <h4>Your address: {this.props.accounts[0]}</h4>

        {
          <CustomContractData
            contract="DirectListing"
            method="offerings"
            methodArgs={[labelhash(this.props.match.params.name)]}
            render={
              // TODO: Check against the deedOwner and deedPreviousOwner
              data => data && (data.nodeOwner === this.props.accounts[0]) && !Number(data.price) && (
                <Alert bsStyle="info">
                  You own this domain. Want to <Link to={`/name/${this.props.match.params.name}/sell`}>sell it</Link>?
                </Alert>
              )
            }
          />
        || <CustomContractData
          contract="ENSRegistry"
          method="owner"
          methodArgs={[namehash(this.props.match.params.name)]}
          render={
              // TODO: Check against the deedOwner and deedPreviousOwner
              data => (data.owner === this.props.accounts[0]) && !Number(data.price) && (
                <Alert bsStyle="info">
                  You own this domain. Want to <Link to={`/name/${this.props.match.params.name}/sell`}>sell it</Link>?
                </Alert>
              )
            }
          />
        }

        <CustomContractData
          contract="DirectListing"
          method="offerings"
          methodArgs={[labelhash(this.props.match.params.name)]}
          render={
            // TODO: Check against the deedOwner and deedPreviousOwner
            data => (data.nodeOwner === this.props.accounts[0]) && !!Number(data.price) && (
              <Alert bsStyle="info">
                You own this domain, and have listed it for sale. Want to <Link to={`/name/${this.props.match.params.name}/sell`}>cancel the sale</Link>?
              </Alert>
            )
          }
        />

        <CustomContractData
          contract="DirectListing"
          method="offerings"
          methodArgs={[labelhash(this.props.match.params.name)]}
          render={
            // TODO: Check against the deedOwner and deedPreviousOwner
            data => (data.nodeOwner !== this.props.accounts[0]) && !Number(data.price) && (
              <Alert bsStyle="warning">
                This domain is not for sale.
              </Alert>
            )
          }
        />

        <CustomContractData
          contract="DirectListing"
          method="offerings"
          methodArgs={[labelhash(this.props.match.params.name)]}
          render={
            // TODO: Check against the deedOwner and deedPreviousOwner
            data => (data.nodeOwner !== this.props.accounts[0]) && !!Number(data.price) && (
              <Alert bsStyle="success">
                This domain is for sale!
              </Alert>
            )
          }
        />

        <Table bordered condensed>
          <tbody>
            <tr>
              <th>Status</th>
              <td>
                <CustomContractData
                  contract="DirectListing"
                  method="offerings"
                  methodArgs={[labelhash(this.props.match.params.name)]}
                  render={
                    offerings => {
                      if (offerings.nodeOwner && (offerings.nodeOwner !== ZERO_ADDR)) {
                        return (
                          <span>Offered by {offerings.nodeOwner}</span>
                        )
                      } else {
                        return (
                          <span>Not currently offered</span>
                        )
                      }
                    }
                  }
                />
              </td>
            </tr>
            <tr>
              <th>
                Deed Owner:<br/>
                <CustomContractData
                  contract="DirectListing"
                  method="deedOwner"
                  methodArgs={[labelhash(this.props.match.params.name)]}
                  render={this.props.deedOwner} /><br/>
                Deed Previous Owner:<br/>
                <CustomContractData
                  contract="DirectListing"
                  method="deedPreviousOwner"
                  methodArgs={[labelhash(this.props.match.params.name)]}
                  render={this.props.deedPreviousOwner} />
              </th>
              <td>
                <CustomContractData
                  contract="DirectListing"
                  method="offerings"
                  methodArgs={[labelhash(this.props.match.params.name)]}
                  render={
                    offerings => {
                      if (offerings.nodeOwner && (offerings.nodeOwner !== ZERO_ADDR)) {
                        return (
                          <span>Offered by {offerings.nodeOwner}</span>
                        )
                      } else {
                        return (
                          <span>Not currently offered</span>
                        )
                      }
                    }
                  }
                />
              </td>
            </tr>
            <tr>
              <th>Price</th>
              <td>
                <CustomContractData
                  contract="DirectListing"
                  method="offerings"
                  methodArgs={[labelhash(this.props.match.params.name)]}
                  render={
                    offerings => {
                      if (offerings.nodeOwner && (offerings.nodeOwner !== ZERO_ADDR)) {
                        return (
                          <CustomContractData
                            contract="DirectListing"
                            method="offerings"
                            methodArgs={[labelhash(this.props.match.params.name)]}
                            render={
                              offerings => {
                                return (<span>{fromWei(offerings.price)} ETH</span>)
                              }
                            }
                          />
                        )
                      } else {
                        return (
                          <span>Not currently offered</span>
                        )
                      }
                    }
                  }
                />
              </td>
            </tr>
            <tr>
              <th>Expires at</th>
              <td>
                <CustomContractData
                  contract="DirectListing"
                  method="offerings"
                  methodArgs={[labelhash(this.props.match.params.name)]}
                  render={
                    offerings => {
                      if (offerings.nodeOwner && (offerings.nodeOwner !== ZERO_ADDR)) {
                        return (
                          <CustomContractData
                            contract="DirectListing"
                            method="offerings"
                            methodArgs={[labelhash(this.props.match.params.name)]}
                            returnKey="expireAt" />
                        )
                      } else {
                        return (
                          <span>Not currently offered</span>
                        )
                      }
                    }
                  }
                />
              </td>
            </tr>
          </tbody>
        </Table>

        <CustomContractData
          contract="DirectListing"
          method="deedOwner"
          methodArgs={[labelhash(this.props.match.params.name)]}
          accounts={this.props.accounts}
          render={
            owner => {
              // The account owns the domain, but hasn't transferred to the DirectListing contract
              if (owner === this.props.accounts[0])
              {
                return (
                  <Button bsStyle="primary" bsSize="large" onClick={this.transfer}>
                    Transfer to Exchange
                  </Button>
                )
              } else {
                if (owner === this.context.drizzle.contracts.DirectListing.address) {
                  return (
                    <CustomContractData
                      contract="DirectListing"
                      method="deedPreviousOwner"
                      methodArgs={[labelhash(this.props.match.params.name)]}
                      accounts={this.props.accounts}
                      render={
                        previousOwner => {
                          console.log('this.props.deedOwner => ', this.props.deedOwner);
                          console.log('previousOwner => ', previousOwner);
                          if (previousOwner === this.props.accounts[0]) {
                            return (
                              <Form inline>
                                <FormGroup bsSize="large">
                                  <InputGroup>
                                    <FormControl
                                      type="number"
                                      placeholder="Offer amount"
                                      onChange={this.handleAmountChange} />
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
                          } else {
                            console.log("accounts => ", this.props.accounts);
                            return (
                              <div>
                                <Alert bsStyle="danger">
                                  You do not own this domain.
                                </Alert>

                                <CustomContractData
                                  contract="DirectListing"
                                  method="offerings"
                                  methodArgs={[labelhash(this.props.match.params.name)]}
                                  render={
                                    // TODO: Check against the deedOwner and deedPreviousOwner
                                    data => (data.nodeOwner !== this.props.accounts[0]) && !!Number(data.price) && (
                                      <Button bsStyle="primary" bsSize="large"
                                        onClick={
                                          () => {
                                            let DirectListing = this.context.drizzle.contracts.DirectListing;
                                            let buyMethod = DirectListing.methods.buy;
                                            let buyMethodInstance = buyMethod(labelhash(this.props.match.params.name));

                                            console.log('data.price => ', data.price);
                                            console.log('Number(data.price) => ', Number(data.price));

                                            buyMethodInstance.send({ value: data.price }).then((result) => {
                                              console.log('Successfully Bought the domain. Result: ', result);
                                            }).catch((error) => {
                                              console.log('Could not Buy. Error: ', error);
                                            });
                                          }
                                        }
                                      >
                                        Buy
                                      </Button>
                                    )
                                  }
                                />
                              </div>
                            )
                          }
                        }
                      }
                    />
                  )
                } else {
                  return (
                    <Alert bsStyle="danger">
                      Both you and the DirectListing contract do not own the domain
                        {this.props.match.params.name}.
                    </Alert>
                  )
                }
              }
            }
          }
        />
      </div>
    )
  }
}

Name.contextTypes = {
  drizzle: PropTypes.object
}

const mapStateToProps = state => {
  return {
    DirectListing: state.contracts.DirectListing,
    accounts: state.accounts,
    web3: state.web3
  }
}

export default drizzleConnect(Name, mapStateToProps)

// export default Name
