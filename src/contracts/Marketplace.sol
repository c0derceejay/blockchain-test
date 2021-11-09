pragma solidity >=0.4.21 < 0.8.9;

contract Marketplace {
    string public name;
    uint public productCount = 0;
    mapping(uint=> Product) public products; //key is an unsigned integer of Product named products

    //similar to a function, this struct called Product contains various variables and pre-defined types
    struct Product {
        uint id;
        string name;
        uint price;
        address payable owner;
        bool purchased;
    }

    //inheritable members of contracts, when you call events, they cause the arguments to be stored in the transaction's logs - a special data structure in the blockchain. These logs are associated with the address of the contract, are incorporated into the blockchain, and stay as long as a block is accessible.
    event ProductCreated(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    event ProductPurchased(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    //A constructor is an optional function declared with the constructor keyword which is executed upon contract creation, and where you can run contract initialisation code
    constructor() public{
        name = "Status Symbol Empire Marketplace";
    }

    //A function to create a product that requires a name and price
    function createProduct(string memory _name, uint _price) public {
        //Require a name
        require(bytes(_name).length > 0, "Must meet name requirement!");
        //Require a valid price
        require(_price > 0, "Must meet price requirement!");
        //Increment Product Count
        productCount ++;
        //Create the product
        products[productCount] = Product(productCount, _name, _price, msg.sender, false);
        //Trigger an event
        emit ProductCreated(productCount, _name, _price, msg.sender, false);
    }

    //A function to purchase a product, reassign the product to the new owner and receive the price of ETH that is pre-defined.
    function purchaseProduct(uint _id) public payable {
        //Fetch product
        Product memory _product = products[_id];
        //Fetch the owner
        address payable _seller = _product.owner;
        //Ensure product is valid

        //Initiate Purchase/Transfer ownership
        _product.owner = msg.sender;
        //Mark as purchased
        _product.purchased = true;
        //Update the product
        products[_id] = _product;
        //Pay the seller by sending them Ether
        address(_seller).transfer(msg.value);
        //Trigger an event
        emit ProductPurchased(productCount, _product.name, _product.price, msg.sender, false);
    }
}

