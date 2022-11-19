import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { Contract, ContractTransaction } from 'ethers'
import { ethers } from 'hardhat'
import { Counter } from '../typechain-types'

describe('Real Estate', () => {
    let realEstate: Contract
    let escrow: Contract
    let deployer: SignerWithAddress
    let seller: SignerWithAddress
    let buyer: SignerWithAddress
    let nftID = 1
    let transaction: ContractTransaction

    beforeEach(async () => {
        // Setup accounts
        const accounts = await ethers.getSigners()
        deployer = accounts[0]
        seller = deployer
        buyer = accounts[1]

        // Load contracts
        const RealEstate = await ethers.getContractFactory('RealEstate')
        const Escrow = await ethers.getContractFactory('Escrow')

        // Deploy contracts
        realEstate = await RealEstate.deploy()
        escrow = await Escrow.deploy(
            realEstate.address, 
            nftID, 
            seller.address, 
            buyer.address
        )

        // Seller approves NFT
        transaction = await realEstate.connect(seller).approve(escrow.address, nftID)
        await transaction.wait()
    })

    describe('Deployment', async () => {

        it('sends an NFT to the seller / deployer', async () => {
            expect(await realEstate.ownerOf(nftID)).to.equal(seller.address)
        })
    })

    describe('Selling Real Estate', async () => {

        it('executes a successful transactions', async () => {
            // Expects seller to be NFT owner before the sale
            expect(await realEstate.ownerOf(nftID)).to.equal(seller.address)

            // Finalize sale
            transaction = await escrow.connect(buyer).finalizeSale()
            await transaction.wait()
            console.log('Buyer finalizes sale')

            // Expects buyer to be NFT owner after the sale
            expect(await realEstate.ownerOf(nftID)).to.equal(buyer.address)
        })
    })
})