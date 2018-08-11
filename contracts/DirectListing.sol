pragma solidity 0.4.24;

import "@ensdomains/ens/contracts/ENS";

contract DirectListing {
    event Offered(bytes32 indexed node, address indexed owner, uint256 price, uint256 ttl);
    event Bought(bytes32 indexed node, address indexed newOwner, uint256 price);
    event Canceled(bytes32 indexed node);
    
    ENS ens;
    Registrar registrar;
    
    constructor() {
        
    }
    
    function isOffered(bytes32 _node) external view returns (bool) {
        
    }
    
    function offer(bytes32 _node, uint256 _price, uint256 _ttl) external {
        
    }
    
    function cancel(bytes32 _node) external {
        
    }
    
    function buy(bytes32 _node) external payable {
        
    }
}
