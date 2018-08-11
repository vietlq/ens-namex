pragma solidity 0.4.24;

import "./ens/ENS.sol";
import "./ens/HashRegistrarSimplified.sol";
import "./ens/Deed.sol";

contract DirectListing {
    event Offered(bytes32 indexed node, address indexed owner, uint256 price, uint256 expireAt);
    event Bought(bytes32 indexed node, address indexed newOwner, uint256 price);
    event Canceled(bytes32 indexed node);
    event DomainWithdrawn(bytes32 indexed node, address indexed owner);

    ENS ens;
    Registrar registrar;

    struct Offering {
        address nodeOwner;
        uint256 price;
        uint256 expireAt;
    }

    mapping (bytes32 => Offering) public offerings;

    constructor(address _registrar) public {
        registrar = Registrar(_registrar);
    }

    function isOffered(bytes32 _hash) external view returns (bool) {
        
    }
    
    function offer(bytes32 _hash, uint256 _price, uint256 _expireAt) external {
        var (a, deedAddr, b, c, d) = registrar.entries(_hash);
        var deed = Deed(deedAddr);

        require(deedAddr != 0x0 && deed.previousOwner() == msg.sender && deed.owner() == address(this));

        // the deed owner is the msg.sender
        // node should not be 0 or already offered
        // nodeOwner not 0
        // block.timestamp + _expireAt

        offerings[_hash] = Offering(msg.sender, _price, _expireAt);

        emit Offered(_hash, msg.sender, _price, _expireAt);
    }

    function cancelOffer(bytes32 _hash) external {
        // transfer back the domain to the owner
        var (a, deedAddr, b, c, d) = registrar.entries(_hash);
        var deed = Deed(deedAddr);

        require(deedAddr != 0x0 && deed.previousOwner() == msg.sender && deed.owner() == address(this));

        delete offerings[_hash];

        emit Canceled(_hash);
    }

    function cancelOfferAndWithdraw(bytes32 _hash) external {
        // transfer back the domain to the owner
        var (a, deedAddr, b, c, d) = registrar.entries(_hash);
        var deed = Deed(deedAddr);

        require(deedAddr != 0x0 && deed.previousOwner() == msg.sender && deed.owner() == address(this));

        if (offerings[_hash].nodeOwner != 0x0)
        {
            delete offerings[_hash];

            emit Canceled(_hash);
        }

        registrar.transfer(_hash, msg.sender);

        emit DomainWithdrawn(_hash, msg.sender);
    }

    function buy(bytes32 _hash) external payable {
        
    }
}
