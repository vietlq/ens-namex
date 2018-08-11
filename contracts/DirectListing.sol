pragma solidity 0.4.24;

import "@ensdomains/ens/contracts/ENS.sol";
import "@ensdomains/ens/contracts/HashRegistrarSimplified.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract DirectListing is Ownable  {
    event Offered(bytes32 indexed node, address indexed owner, uint256 price, uint256 expireAt);
    event Bought(bytes32 indexed node, address indexed newOwner, uint256 price);
    event Canceled(bytes32 indexed node);

    ENS ens;
    Registrar registrar;

    struct Offering {
        address nodeDomain;
        uint256 price;
        uint256 expireAt;
    }

    mapping (bytes32 => Offering) offerings;

    constructor() public {
        owner = msg.sender;
    }

    function isOffered(bytes32 _node) external view returns (bool) {
        
    }
    
    function offer(bytes32 _node, uint256 _price, uint256 _expireAt) external {
        offerings.add(_node, Offering(msg.sender, _price, _expireAt));
    }

    function cancel(bytes32 _node) external {
        
    }

    function buy(bytes32 _node) external payable {
        
    }
}
