import express, {Express, NextFunction, Request, Response} from "express";
import {MongoClient, ObjectId} from "mongodb";

const MONGO_URL = 'mongodb://localhost:27017';
const DATABASE_NAME = 'Banking';

export class Application {
    public expressApp: Express = express();
    private mongoClient = new MongoClient(MONGO_URL);

    constructor() {
        this.expressApp.use(express.json())

        // Get all accounts
        // For tests/debug
        this.expressApp.get("/", async (req: Request, res: Response) => {
            const collection = await this.accountsCollection();
            const findResult = await collection.find({}).toArray();
            console.log('Found documents =>', findResult);

            res.send({accounts: findResult});
        });

        // Get an account
        this.expressApp.get("/accounts/:id", async (req: Request, res: Response, next: NextFunction) => {
            const id = req.params.id;

            // Find the account
            const collection = await this.accountsCollection();
            const findResult = await collection.findOne({_id: new ObjectId(id)});
            console.log('Found documents =>', findResult);

            if (findResult === null) {
                next(new Error(`Account '${id}' not found!`));
            } else {
                let balance = findResult.transactions.reduce((acc: number, val: any) => {
                    if (val.type === "deposit") return acc + val.amount;
                    if (val.type === "withdraw") return acc - val.amount;
                }, 0);
                let currency = "EUR";

                // Get JPY account value
                if (req.body.currency && req.body.currency === "JPY") {
                    const host = 'api.frankfurter.app';
                    const resp = await fetch(`https://${host}/latest?amount=1&from=EUR&to=JPY`);
                    const data = await resp.json();
                    balance = balance * data.rates.JPY;
                    currency = "JPY"
                }

                res.send({
                    owner: "Jérémy Sorant",
                    balance,
                    currency
                });
            }
        });

        // Create a new account
        this.expressApp.post("/accounts", async (req: Request, res: Response) => {
            // TODO cannot have Two accounts for the same user
            const collection = await this.accountsCollection();
            // Create the new account
            const insertResult = await collection.insertOne({
                owner: req.body.owner,
                transactions: []
            });
            console.log('Inserted documents =>', insertResult);

            res.json({
                accountId: insertResult.insertedId.toString(),
                message: "Account created."
            })
        });

        // Deposit
        this.expressApp.post("/accounts/:id/deposit", async (req: Request, res: Response, next: NextFunction) => {
            const id = req.params.id;

            const collection = await this.accountsCollection();
            const findResult = await collection.findOne({_id: new ObjectId(id)});

            if (findResult === null) {
                next(new Error(`Account '${id}' not found!`));
            } else {
                console.log('Found documents =>', findResult);
                //TODO amount must be > 0
                const newTransactions = [...findResult.transactions, {
                    date: Date.now(),
                    type: "deposit",
                    amount: parseFloat(req.body.amount)
                }];
                //Update the account
                const updateResult = await collection.updateOne(
                    {_id: new ObjectId(id)}, {
                        $set:
                            {
                                transactions: newTransactions
                            }
                    });
                console.log('Updated documents =>', updateResult);

                res.json({
                    message: `Account ${id} updated.`
                })
            }
        });

        // Withdraw
        this.expressApp.post("/accounts/:id/withdraw", async (req: Request, res: Response, next: NextFunction) => {
            const id = req.params.id;

            const collection = await this.accountsCollection();
            const findResult = await collection.findOne({_id: new ObjectId(id)});

            if (findResult === null) {
                next(new Error(`Account '${id}' not found!`));
            } else {
                console.log('Found documents =>', findResult);
                //TODO amount must be > 0
                //TODO balance must be > 0
                const newTransactions = [...findResult.transactions, {
                    date: Date.now(),
                    type: "withdraw",
                    amount: parseFloat(req.body.amount)
                }];
                //Update the account
                const updateResult = await collection.updateOne(
                    {_id: new ObjectId(id)}, {
                        $set:
                            {
                                transactions: newTransactions
                            }
                    });
                console.log('Updated documents =>', updateResult);

                res.json({
                    message: `Account ${id} updated.`
                })
            }
        });

        this.expressApp.use(this.handleError)
    }

    private handleError(err: Error, req: Request, res: Response, next: NextFunction): void {
        res.status(500).json({error: err.message});
    }

    private async accountsCollection() {
        await this.mongoClient.connect();
        const db = this.mongoClient.db(DATABASE_NAME);
        return db.collection('accounts');
    }

    start(port: number): void {
        this.expressApp.listen(port, () => {
            console.log(`[server]: Server is running at http://localhost:${port}`);
        });
    }
}



