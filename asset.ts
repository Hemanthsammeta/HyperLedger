/*
  SPDX-License-Identifier: Apache-2.0
*/

import { Object, Property } from 'fabric-contract-api';

@Object()
export class Asset {
    @Property()
    public docType?: string; // Optional field to store document type

    @Property()
    public DEALERID: number = 0; // ID of the dealer

    @Property()
    public MSISDN: string = ''; // Mobile number of the dealer

    @Property()
    public MPIN: string = ''; // MPIN for the dealer

    @Property()
    public BALANCE: number = 0; // Current balance of the dealer

    @Property()
    public STATUS: string = ''; // Status of the transaction (e.g., SUCCESS, FAILURE)

    @Property()
    public TRANSAMOUNT: number = 0; // Transaction amount

    @Property()
    public TRANSTYPE: string = ''; // Type of transaction (e.g., ONLINE, OFFLINE)

    @Property()
    public REMARKS: string = ''; // Remarks for the transaction
}
