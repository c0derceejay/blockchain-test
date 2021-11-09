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
        //SUCCESS
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
            const product = await marketplace.products(productCount)
            assert.equal(product.id.toNumber(), productCount.toNumber(), 'id is correct')
            assert.equal(product.name, 'SSE Dreams NFT', 'name is correct')
            assert.equal(product.price, '1000000000000000000', 'price is correct')
            assert.equal(product.owner, seller, 'owner is correct')
            assert.equal(product.purchased, false, 'purchased is correct')
        })

        it('sells products', async () => {
            result = await marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('1', "Ether")})
        })

        
    })


})