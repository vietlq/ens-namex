import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Table, Button } from 'react-bootstrap'
import { drizzleConnect } from 'drizzle-react'
import CustomContractData from './CustomContractData'
import { sha3 } from 'web3-utils'
import PropTypes from 'prop-types'

const transformStatus = value => {
  return !!value.price ? <span>For sale</span> : <span>Unknown</span>
}

export function namehash(name) {
  var node = '0x0000000000000000000000000000000000000000000000000000000000000000';
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

        {
          <CustomContractData
            contract="DirectListing"
            method="offerings"
            methodArgs={[labelhash(this.props.match.params.name)]}
            render={
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
                  method="isOffered"
                  methodArgs={[labelhash(this.props.match.params.name)]}
                  render={transformStatus} />
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
                      if (offerings.nodeOwner && (offerings.nodeOwner !== "0x0000000000000000000000000000000000000000")) {
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
                      if (offerings.nodeOwner && (offerings.nodeOwner !== "0x0000000000000000000000000000000000000000")) {
                        return (
                          <CustomContractData
                            contract="DirectListing"
                            method="offerings"
                            methodArgs={[labelhash(this.props.match.params.name)]}
                            returnKey="price" />
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
                      if (offerings.nodeOwner && (offerings.nodeOwner !== "0x0000000000000000000000000000000000000000")) {
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
          method="offerings"
          methodArgs={[labelhash(this.props.match.params.name)]}
          render={
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
