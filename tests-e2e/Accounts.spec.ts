import {describe, expect, it} from "vitest";
import {Application} from "../src/Application";
import supertest from "supertest";


describe("Accounts", () => {
    const app = new Application();
    const supertestApp = supertest(app.expressApp);

    it('should create a new account', async () => {
        const response = await supertestApp
            .post("/accounts")
            .set("Accept", "application/json") // use set() to add headers to the request
            .set("Content-Type", "application/json")
            .send({
                // request body
            });

        // Make assertions on 'response.status' and 'response.body'
        // Response body example:
        // {
        //     accountId: '6645b7ae2d4e3ffe018f0ba2',
        //     message: 'Account created.'
        // }
        expect(true).toEqual(false);
    });

    it.skip('should get an existing account', async () => {
        // Implement this test
        // Response body example:
        // {
        //     "owner": "John Doe",
        //     "balance": 2.5,
        //     "currency": "EUR"
        // }
    });
});