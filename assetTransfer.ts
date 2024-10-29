import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';

@Info({ title: 'DealerTransfer', description: 'Smart contract for managing dealer transactions' })
export class DealerTransferContract extends Contract {

    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
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
            // Insert data in deterministic order
            await ctx.stub.putState(dealer.DEALERID.toString(), Buffer.from(stringify(sortKeysRecursive(dealer))));
            console.info(`Dealer ${dealer.DEALERID} initialized`);
        }
    }

    // CreateDealer issues a new dealer to the world state with given details.
    @Transaction()
    public async CreateDealer(ctx: Context, dealerId: number, msisdn: string, mpin: string, balance: number, status: string, transAmount: number, transType: string, remarks: string): Promise<void> {
        const exists = await this.DealerExists(ctx, dealerId);
        if (exists) {
            throw new Error(`The dealer ${dealerId} already exists`);
        }

        const dealer = {
            DEALERID: dealerId,
            MSISDN: msisdn,
            MPIN: mpin,
            BALANCE: balance,
            STATUS: status,
            TRANSAMOUNT: transAmount,
            TRANSTYPE: transType,
            REMARKS: remarks,
            docType: 'dealer'
        };

        // Insert data in deterministic order
        await ctx.stub.putState(dealerId.toString(), Buffer.from(stringify(sortKeysRecursive(dealer))));
    }

    // ReadDealer returns the dealer stored in the world state with given id.
    @Transaction(false)
    public async ReadDealer(ctx: Context, dealerId: number): Promise<string> {
        const dealerJSON = await ctx.stub.getState(dealerId.toString()); // get the dealer from chaincode state
        if (dealerJSON.length === 0) {
            throw new Error(`The dealer ${dealerId} does not exist`);
        }
        return dealerJSON.toString();
    }

    // UpdateDealer updates an existing dealer in the world state with provided parameters.
    @Transaction()
    public async UpdateDealer(ctx: Context, dealerId: number, msisdn: string, mpin: string, balance: number, status: string, transAmount: number, transType: string, remarks: string): Promise<void> {
        const exists = await this.DealerExists(ctx, dealerId);
        if (!exists) {
            throw new Error(`The dealer ${dealerId} does not exist`);
        }

        // Overwriting original dealer with new dealer data
        const updatedDealer = {
            DEALERID: dealerId,
            MSISDN: msisdn,
            MPIN: mpin,
            BALANCE: balance,
            STATUS: status,
            TRANSAMOUNT: transAmount,
            TRANSTYPE: transType,
            REMARKS: remarks,
            docType: 'dealer'
        };

        // Insert data in deterministic order
        await ctx.stub.putState(dealerId.toString(), Buffer.from(stringify(sortKeysRecursive(updatedDealer))));
    }

    // DeleteDealer deletes a given dealer from the world state.
    @Transaction()
    public async DeleteDealer(ctx: Context, dealerId: number): Promise<void> {
        const exists = await this.DealerExists(ctx, dealerId);
        if (!exists) {
            throw new Error(`The dealer ${dealerId} does not exist`);
        }
        await ctx.stub.deleteState(dealerId.toString());
    }

    // DealerExists returns true when dealer with given ID exists in world state.
    @Transaction(false)
    @Returns('boolean')
    public async DealerExists(ctx: Context, dealerId: number): Promise<boolean> {
        const dealerJSON = await ctx.stub.getState(dealerId.toString());
        return dealerJSON.length > 0;
    }

    // GetAllDealers returns all dealers found in the world state.
    @Transaction(false)
    @Returns('string')
    public async GetAllDealers(ctx: Context): Promise<string> {
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

