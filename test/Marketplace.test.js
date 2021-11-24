const Marketplace = artifacts.require('./Marketplace.sol');

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Marketplace', ([deployer, seller, buyer]) => {
    let marketplace 

    before(async () => {
        marketplace = await Marketplace.deployed()
    })

    describe('deployment', async () => {
        it('deploys successfully', async() => {
            const address = await marketplace.address
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })
        it('has a name', async () => {
            const name = await marketplace.name()
            assert.equal(name, 'Status Symbol Empire Marketplace')
        })
    })

    describe('products', async () => {
        let result, productCount

        before(async () => {
            result = await marketplace.createProduct('SSE Dreams NFT', web3.utils.toWei('1', "Ether"), {from: seller})
            productCount = await marketplace.productCount()
        })

        it('creates products', async () => {
        //SUCCESS: Product created
            assert.equal(productCount, 1)
            const event = result.logs[0].args
            assert.equal(event.id.toNumber(), productCount.toNumber(), 'id is correct')
            assert.equal(event.name, 'SSE Dreams NFT', 'name is correct')
            assert.equal(event.price, '1000000000000000000', 'price is correct')
            assert.equal(event.owner, seller, 'owner is correct')
            assert.equal(event.purchased, false, 'purchased is correct')

        //FAILURE: Product must have a name, if not reject the transaction
            await await marketplace.createProduct('', web3.utils.toWei('1', "Ether"), {from: seller}).should.be.rejected;
        //FAILURE: Product must have a price, if it doesn't reject the transaction
            await await marketplace.createProduct('SSE Dreams NFT', 0, {from: seller}).should.be.rejected;
        })

        it('lists products', async () => {
            //SUCCESS: Products that are available are listed for purchase
            const product = await marketplace.products(productCount)
            assert.equal(product.id.toNumber(), productCount.toNumber(), 'id is correct')
            assert.equal(product.name, 'SSE Dreams NFT', 'name is correct')
            assert.equal(product.price, '1000000000000000000', 'price is correct')
            assert.equal(product.owner, seller, 'owner is correct')
            assert.equal(product.purchased, false, 'purchased is correct')
        })

        it('sells products', async () => {
            //Track the seller balance before purchase
            let oldSellerBalance
            oldSellerBalance = await web3.eth.getBalance(seller)
            oldSellerBalance = new web3.utils.BN(oldSellerBalance)

            // SUCCESS: Buyer makes purchase of selected product
            result = await marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('1', "Ether")})
            //Check logs
            const event = result.logs[0].args
            assert.equal(event.id.toNumber(), productCount.toNumber(), 'id is correct')
            assert.equal(event.name, 'SSE Dreams NFT', 'name is correct')
            assert.equal(event.price, '1000000000000000000', 'price is correct')
            assert.equal(event.owner, buyer, 'owner is correct')
            assert.equal(event.purchased, true, 'purchased is correct')

            //Check that seller received the funds (how much they had before versus after purchase of product)
            let newSellerBalance
            newSellerBalance = await web3.eth.getBalance(seller)
            newSellerBalance = new web3.utils.BN(newSellerBalance) //when using a big number, use new instead of await

            let price
            price = web3.utils.toWei('1', 'Ether')
            price = new web3.utils.BN(price) //when using a big number, use new instead of await

            const expectedBalance = oldSellerBalance.add(price)
            assert.equal(newSellerBalance.toString(), expectedBalance.toString())

            //FAILURE: Attempted to purchase a product that does not exist (ID not valid)
            await marketplace.purchaseProduct(99, { from: buyer, value: web3.utils.toWei('1', "Ether")}).should.be.rejected;
            //FAILURE: Attempted to purchase without enough Ether available
            await marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('0.5', "Ether")}).should.be.rejected;
            //FAILURE: Deployer tries to buy the product, i.e. products cant be bought more than once
            await marketplace.purchaseProduct(productCount, { from: deployer, value: web3.utils.toWei('1', "Ether")}).should.be.rejected;
            //FAILURE: Buyer tries to buy again, i.e. buyer cannot be the seller
            await marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('1', "Ether")}).should.be.rejected;
        })
    })
})
