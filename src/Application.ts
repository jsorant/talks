import express, {Express, Request, Response} from "express";
import {MongoClient, ObjectId} from "mongodb";

const MONGO_URL = 'mongodb://localhost:27017';
const DATABASE_NAME = 'FinTech';

export class Application {
    private expressApp: Express = express();
    private mongoClient = new MongoClient(MONGO_URL);

    constructor() {
        this.expressApp.use(express.json())

        // Get all wallets
        // For tests/debug
        this.expressApp.get("/", async (req: Request, res: Response) => {
            const collection = await this.walletsCollection();
            const findResult = await collection.find({}).toArray();
            console.log('Found documents =>', findResult);

            res.send({wallets: findResult});
        });

        // Get a wallet
        this.expressApp.get("/wallets/:id", async (req: Request, res: Response) => {
            const id = req.params.id;

            // Find the wallet
            const collection = await this.walletsCollection();
            const findResult = await collection.findOne({_id: new ObjectId(id)});
            console.log('Found documents =>', findResult);
            
            if (findResult === null) {
                res.status(404).send({error: `Wallet "${id}" not found!`});
            } else {
                let amount = findResult.amount;
                let currency = "EUR";

                // Get JPY wallet value
                if (req.body.currency && req.body.currency === "JPY") {
                    const host = 'api.frankfurter.app';
                    const resp = await fetch(`https://${host}/latest?amount=1&from=EUR&to=JPY`);
                    const data = await resp.json();
                    amount = amount * data.rates.JPY;
                    currency = "JPY"
                }

                res.send({
                    owner: "Jérémy Sorant",
                    amount,
                    currency
                });
            }
        });

        // Create a new wallet
        this.expressApp.post("/wallets", async (req: Request, res: Response) => {
            // TODO cannot have Two wallets for the same user
            const collection = await this.walletsCollection();
            // Create the new wallet
            const insertResult = await collection.insertOne({
                owner: req.body.owner,
                amount: 0.0
            });
            console.log('Inserted documents =>', insertResult);

            res.json({
                walletId: insertResult.insertedId.toString(),
                message: "Wallet created."
            })
        });

        // Add money to a wallet
        this.expressApp.post("/wallets/:id/add", async (req: Request, res: Response) => {
            const id = req.params.id;

            const collection = await this.walletsCollection();
            const findResult = await collection.findOne({_id: new ObjectId(id)});

            if (findResult === null) {
                res.status(404).send({error: `Wallet ${id} not found !`});
            } else {
                console.log('Found documents =>', findResult);
                const newAmount = findResult.amount + parseFloat(req.body.amount);
                //Update the wallet
                const updateResult = await collection.updateOne(
                    {_id: new ObjectId(id)}, {
                        $set:
                            {
                                amount: newAmount
                            }
                    });
                console.log('Updated documents =>', updateResult);

                res.json({
                    message: `Wallet ${id} updated.`
                })
            }
        });

        // Remove money from a wallet
        this.expressApp.post("/wallets/:id/remove", async (req: Request, res: Response) => {
            const id = req.params.id;

            const collection = await this.walletsCollection();
            const findResult = await collection.findOne({_id: new ObjectId(id)});

            if (findResult === null) {
                res.status(404).send({error: `Wallet ${id} not found!`});
            } else {
                console.log('Found documents =>', findResult);
                const newAmount = findResult.amount - parseFloat(req.body.amount);
                if (newAmount < 0) {
                    res.status(400).send({error: `Not enough money left!`});
                } else {
                    //Update the wallet
                    const updateResult = await collection.updateOne(
                        {_id: new ObjectId(id)}, {
                            $set:
                                {
                                    amount: newAmount
                                }
                        });
                    console.log('Updated documents =>', updateResult);

                    res.json({
                        message: `Wallet ${id} updated.`
                    })
                }
            }
        });
    }

    private async walletsCollection() {
        await this.mongoClient.connect();
        const db = this.mongoClient.db(DATABASE_NAME);
        return db.collection('wallets');
    }

    start(port: number): void {
        this.expressApp.listen(port, () => {
            console.log(`[server]: Server is running at http://localhost:${port}`);
        });
    }
}



