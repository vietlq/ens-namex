pragma solidity 0.4.24;

import "@ensdomains/ens/contracts/ENSRegistry.sol";
import "@ensdomains/ens/contracts/ENS.sol";
import "@ensdomains/ens/contracts/Deed.sol";
import "./ens/TestRegistrarSimplified.sol";

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

    // Minimum listing time in seconds
    uint constant MIN_LISTING_TIME = 100;

    mapping (bytes32 => Offering) public offerings;

    constructor(address _registrar) public {
        require(_registrar != 0);
        registrar = Registrar(_registrar);
    }

    // https://ethereum.stackexchange.com/questions/7853/is-the-block-timestamp-value-in-solidity-seconds-or-milliseconds
    function isOffered(bytes32 _hash) public view returns (bool) {
        return ((offerings[_hash].nodeOwner != 0x0) && (offerings[_hash].expireAt >= block.timestamp));
    }

    function deedAddr(bytes32 _hash) public view returns (address) {
        var (,theDeedAddr,,,) = registrar.entries(_hash);
        return theDeedAddr;
    }

    function deedOwner(bytes32 _hash) public view returns (address) {
        var theDeedAddr = this.deedAddr(_hash);
        if (theDeedAddr == 0x0) {
            return 0x0;
        }

        var deed = Deed(theDeedAddr);

        return deed.owner();
    }

    function deedPreviousOwner(bytes32 _hash) public view returns (address) {
        var theDeedAddr = this.deedAddr(_hash);
        if (theDeedAddr == 0x0) {
            return 0x0;
        }

        var deed = Deed(theDeedAddr);

        return deed.previousOwner();
    }

    function offer(bytes32 _hash, uint256 _price, uint256 _expireAt) external {
        var (,deedAddr,,,) = registrar.entries(_hash);
        var deed = Deed(deedAddr);

        require((deedAddr != 0x0) && (deed.previousOwner() == msg.sender) && (deed.owner() == address(this)));
        require((_expireAt > MIN_LISTING_TIME) && (_expireAt > block.timestamp) && (_expireAt >= (block.timestamp + MIN_LISTING_TIME)));

        // the deed owner is the msg.sender
        // node should not be 0 or already offered
        // nodeOwner not 0
        // block.timestamp <= _expireAt

        offerings[_hash] = Offering(msg.sender, _price, _expireAt);

        emit Offered(_hash, msg.sender, _price, _expireAt);
    }

    function cancelOffer(bytes32 _hash) external {
        // https://ethereum.stackexchange.com/questions/28972/who-is-msg-sender-when-calling-a-contract-from-a-contract
        // transfer back the domain to the owner
        var (,deedAddr,,,) = registrar.entries(_hash);
        var deed = Deed(deedAddr);
        require((deedAddr != 0x0) && (deed.previousOwner() == msg.sender) && (deed.owner() == address(this)));

        delete offerings[_hash];

        emit Canceled(_hash);
    }

    function cancelOfferAndWithdraw(bytes32 _hash) external {
        // transfer back the domain to the owner
        var (,deedAddr,,,) = registrar.entries(_hash);
        var deed = Deed(deedAddr);
        require((deedAddr != 0x0) && (deed.previousOwner() == msg.sender) && (deed.owner() == address(this)));

        if (offerings[_hash].nodeOwner != 0x0)
        {
            delete offerings[_hash];

            emit Canceled(_hash);
        }

        registrar.transfer(_hash, msg.sender);

        emit DomainWithdrawn(_hash, msg.sender);
    }

    function buy(bytes32 _hash) external payable {
        require(isOffered(_hash) && (msg.value >= offerings[_hash].price));

        var (,deedAddr,,,) = registrar.entries(_hash);
        var deed = Deed(deedAddr);
        require((deedAddr != 0x0) && (deed.owner() == address(this)) && (deed.previousOwner() == offerings[_hash].nodeOwner));

        // https://ethereum.stackexchange.com/questions/19341/address-send-vs-address-transfer-best-practice-usage
        // https://solidity.readthedocs.io/en/develop/units-and-global-variables.html?highlight=transfer#address-related
        offerings[_hash].nodeOwner.transfer(msg.value);

        registrar.transfer(_hash, msg.sender);

        delete offerings[_hash];

        emit Bought(_hash, msg.sender, msg.value);
    }
}
