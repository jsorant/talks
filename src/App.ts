import express, {Express, Request, Response} from "express";
import {MongoClient, ObjectId} from "mongodb";

// REST API
const app: Express = express();
app.use(express.json())
const port = 3000;


// Mongo
const url = 'mongodb://localhost:27017'; // DEV TEST ONLY !!!
//const url = 'mongodb://148.1.56.48:27017';

const client = new MongoClient(url);
const dbName = 'FinTech';

async function walletsCollection() {
    await client.connect();
    const db = client.db(dbName);
    return db.collection('wallets');
}


app.get("/", async (req: Request, res: Response) => {
    const collection = await walletsCollection();
    const findResult = await collection.find({}).toArray();
    console.log('Found documents =>', findResult);

    res.send({wallets: findResult});
});

app.get("/wallets/:id", async (req: Request, res: Response) => {
    const id = req.params.id;

    const collection = await walletsCollection();
    const findResult = await collection.findOne({_id: new ObjectId(id)});
    console.log('Found documents =>', findResult);

    if (findResult === null) {
        res.status(404).send({error: `Wallet ${id} not found!`});
    } else {
        let amount = findResult.amount;
        let currency = "EUR";

        if (req.body.currency === "JPY") {
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


app.post("/wallets", async (req: Request, res: Response) => {
    // TODO cannot have Two wallet for the same user
    const collection = await walletsCollection();
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

app.post("/wallets/:id/add", async (req: Request, res: Response) => {
    const id = req.params.id;

    const collection = await walletsCollection();
    const findResult = await collection.findOne({_id: new ObjectId(id)});

    if (findResult === null) {
        res.status(404).send({error: `Wallet ${id} not found!`});
    } else {
        console.log('Found documents =>', findResult);
        const newAmount = findResult.amount + parseFloat(req.body.amount);
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

app.post("/wallets/:id/remove", async (req: Request, res: Response) => {
    const id = req.params.id;

    const collection = await walletsCollection();
    const findResult = await collection.findOne({_id: new ObjectId(id)});

    if (findResult === null) {
        res.status(404).send({error: `Wallet ${id} not found!`});
    } else {
        console.log('Found documents =>', findResult);
        const newAmount = findResult.amount - parseFloat(req.body.amount);
        if (newAmount < 0) {
            res.status(400).send({error: `Not enough money left!`});
        } else {
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


app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});