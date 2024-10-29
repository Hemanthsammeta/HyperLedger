'use strict';

const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class AssetTransfer extends Contract {

    async InitLedger(ctx) {
        const dealers = [
            {
                DEALERID: 1201,
                MSISDN: "+91 000000",
                MPIN: "0000",
                BALANCE: 0,
                STATUS: "SUCCESS",
                TRANSAMOUNT: 0,
                TRANSTYPE: "ONLINE",
                REMARKS: "YES"
            },
            {
                DEALERID: 1202,
                MSISDN: "+91 12345",
                MPIN: "0000",
                BALANCE: 100,
                STATUS: "FAILURE",
                TRANSAMOUNT: 200,
                TRANSTYPE: "OFFLINE",
                REMARKS: "NO"
            },
            {
                DEALERID: 1203,
                MSISDN: "+91 456787",
                MPIN: "0120",
                BALANCE: 300,
                STATUS: "SUCCESS",
                TRANSAMOUNT: 500,
                TRANSTYPE: "ONLINE",
                REMARKS: "NO"
            },
            {
                DEALERID: 1204,
                MSISDN: "+91 56789",
                MPIN: "9873",
                BALANCE: 200,
                STATUS: "SUCCESS",
                TRANSAMOUNT: 600,
                TRANSTYPE: "OFFLINE",
                REMARKS: "YES"
            },
            {
                DEALERID: 1205,
                MSISDN: "+91 67894",
                MPIN: "15654",
                BALANCE: 300,
                STATUS: "FAILURE",
                TRANSAMOUNT: 700,
                TRANSTYPE: "ONLINE",
                REMARKS: "NO"
            },
            {
                DEALERID: 1206,
                MSISDN: "+91 23456789",
                MPIN: "4567",
                BALANCE: 500,
                STATUS: "SUCCESS",
                TRANSAMOUNT: 800,
                TRANSTYPE: "OFFLINE",
                REMARKS: "YES"
            }
        ];

        for (const dealer of dealers) {
            dealer.docType = 'dealer';
            await ctx.stub.putState(dealer.DEALERID.toString(), Buffer.from(stringify(sortKeysRecursive(dealer))));
        }
    }

    // CreateDealer issues a new dealer to the world state with given details.
    async CreateDealer(ctx, dealerId, msisdn, mpin, balance, status, transamount, transtype, remarks) {
        const exists = await this.DealerExists(ctx, dealerId);
        if (exists) {
            throw new Error(`The dealer ${dealerId} already exists`);
        }

        const dealer = {
            DEALERID: parseInt(dealerId),
            MSISDN: msisdn,
            MPIN: mpin,
            BALANCE: parseFloat(balance),
            STATUS: status,
            TRANSAMOUNT: parseFloat(transamount),
            TRANSTYPE: transtype,
            REMARKS: remarks
        };
        await ctx.stub.putState(dealerId.toString(), Buffer.from(stringify(sortKeysRecursive(dealer))));
        return JSON.stringify(dealer);
    }

    // ReadDealer returns the dealer stored in the world state with given id.
    async ReadDealer(ctx, dealerId) {
        const dealerJSON = await ctx.stub.getState(dealerId);
        if (!dealerJSON || dealerJSON.length === 0) {
            throw new Error(`The dealer ${dealerId} does not exist`);
        }
        return dealerJSON.toString();
    }

    // UpdateDealer updates an existing dealer in the world state with provided parameters.
    async UpdateDealer(ctx, dealerId, msisdn, mpin, balance, status, transamount, transtype, remarks) {
        const exists = await this.DealerExists(ctx, dealerId);
        if (!exists) {
            throw new Error(`The dealer ${dealerId} does not exist`);
        }

        const updatedDealer = {
            DEALERID: parseInt(dealerId),
            MSISDN: msisdn,
            MPIN: mpin,
            BALANCE: parseFloat(balance),
            STATUS: status,
            TRANSAMOUNT: parseFloat(transamount),
            TRANSTYPE: transtype,
            REMARKS: remarks
        };
        await ctx.stub.putState(dealerId.toString(), Buffer.from(stringify(sortKeysRecursive(updatedDealer))));
        return JSON.stringify(updatedDealer);
    }

    // DeleteDealer deletes a given dealer from the world state.
    async DeleteDealer(ctx, dealerId) {
        const exists = await this.DealerExists(ctx, dealerId);
        if (!exists) {
            throw new Error(`The dealer ${dealerId} does not exist`);
        }
        await ctx.stub.deleteState(dealerId);
    }

    // DealerExists returns true when dealer with given ID exists in world state.
    async DealerExists(ctx, dealerId) {
        const dealerJSON = await ctx.stub.getState(dealerId);
        return dealerJSON && dealerJSON.length > 0;
    }

    // GetAllDealers returns all dealers found in the world state.
    async GetAllDealers(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = AssetTransfer;

