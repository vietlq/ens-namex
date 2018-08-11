import React from 'react'
import { Table } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const List = () => (
  <Table responsive>
    <thead>
      <tr>
        <th>Domain</th>
        <th>Price</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><Link to={`/name/example.eth`}>example.eth</Link></td>
        <td>0.01 eth</td>
      </tr>
    </tbody>
  </Table>
)

export default List