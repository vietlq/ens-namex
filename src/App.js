import React, { Component } from 'react'
import { Navbar, Button, FormGroup, FormControl } from 'react-bootstrap'
import { Route, Switch } from 'react-router'
import { Link } from 'react-router-dom'
import { LinkContainer } from 'react-router-bootstrap'
import { LoadingContainer } from 'drizzle-react-components'

import List from './List'
import Name from './Name'

class App extends Component {
  state = {}
  handleSearch = (event) => {
    this.setState({searchName: event.target.value})
  }
  render() {
    return (
      <div className="App">
        <Navbar inverse collapseOnSelect fixedTop>
          <Navbar.Header>
            <Navbar.Brand>
            <Link to="/">ENS NameX</Link>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Navbar.Form pullRight>
              <FormGroup>
                <FormControl type="text" placeholder="example.eth" onChange={this.handleSearch} />
              </FormGroup>{' '}
              <LinkContainer to={`/name/${this.state.searchName}`}>
                <Button><span role="img" aria-label="Search">🕵️‍♂️</span></Button>
              </LinkContainer>
            </Navbar.Form>
          </Navbar.Collapse>
        </Navbar>
        <div className="container" style={ {marginTop: '80px'} }>
          <LoadingContainer loadingComp={<p>Loading...</p>}>
            <Switch>
              <Route exact path="/" component={List}/>
              <Route exact path="/name/:name" component={Name}/>
            </Switch>
          </LoadingContainer>
        </div>
      </div>
    )
  }
}

export default App
