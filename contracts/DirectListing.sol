pragma solidity 0.4.24;

import "@ensdomains/ens/contracts/ENS.sol";
import "@ensdomains/ens/contracts/HashRegistrarSimplified.sol";
import "@ensdomains/ens/contracts/Deed.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract DirectListing is Ownable  {
    event Offered(bytes32 indexed node, address indexed owner, uint256 price, uint256 expireAt);
    event Bought(bytes32 indexed node, address indexed newOwner, uint256 price);
    event Canceled(bytes32 indexed node);

    ENS ens;
    Registrar registrar;

    struct Offering {
        address nodeOwner;
        uint256 price;
        uint256 expireAt;
    }

    mapping (bytes32 => Offering) public offerings;

    constructor(address _registrar) public {
        owner = msg.sender;
        registrar = Registrar(_registrar);
    }

    function isOffered(bytes32 _label) external view returns (bool) {
        
    }
    
    function offer(bytes32 _label, uint256 _price, uint256 _expireAt) external {
        var (a, deedAddr, b, c, d) = registrar.entries(_label);
        var deed = Deed(deedAddr);

        require(deedAddr != 0x0 && deed.previousOwner() == msg.sender && deed.owner() == address(this));

        // the deed owner is the msg.sender
        // node should not be 0 or already offered
        // nodeOwner not 0
        // block.timestamp + _expireAt

        offerings[_label] = Offering(msg.sender, _price, _expireAt);

        emit Offered(_label, msg.sender, _price, _expireAt);
    }

    function cancel(bytes32 _label) external {
        
    }

    function buy(bytes32 _label) external payable {
        
    }
}
