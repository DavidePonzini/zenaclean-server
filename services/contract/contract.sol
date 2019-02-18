pragma solidity ^0.5.0;

contract owned {
    address public owner;

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Error OnlyOwner");
        _;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        owner = newOwner;
    }
}

contract Genovesino is owned {
    event Transfer(address indexed from, address indexed to, uint256 value);
    uint8 public decimals;
    uint256 public totalSupply;

    /* This creates an array with all balances */
    mapping (address => uint256) public balanceOf;

    /* Initializes contract with initial supply tokens to the creator of the contract */
    constructor (uint256 _initialSupply, uint8 _decimalUnits) public {
        totalSupply = _initialSupply;
        balanceOf[msg.sender] = totalSupply;              // Give the creator all initial token
        decimals = _decimalUnits;                            // Amount of decimals for display purposes
    }

    function transfer(address _to, uint256 _value) public {       /* Check if sender has balance and for overflows */
          /* Add and subtract new balances */
        require(balanceOf[msg.sender] >= _value && balanceOf[_to] + _value >= balanceOf[_to], "Error Transfer"); 
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;       /* Notify anyone listening that this transfer took place */
        emit Transfer(msg.sender, _to, _value);
    }

    function mintToken(address target, uint256 mintedAmount) public onlyOwner {
        balanceOf[target] += mintedAmount;
        totalSupply += mintedAmount;
        emit Transfer(owner, owner, mintedAmount);
        emit Transfer(owner, target, mintedAmount);
    }

    function drop(address reporter, address[] memory voters, uint256 value_reporter, uint256 value_voters) public {
        if (reporter != address(0)) {
            mintToken(reporter, value_reporter);
        }
        
        for (uint256 i = 0; i < voters.length; i++) {
            mintToken(voters[i], value_voters);
        }
    }
}