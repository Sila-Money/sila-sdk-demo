const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

const configuration = new Configuration({
	basePath: PlaidEnvironments.sandbox,
	baseOptions: {
		headers: {
			'PLAID-CLIENT-ID': '',
			'PLAID-SECRET': '',
		},
	},
});

const plaidClient = new PlaidApi(configuration);

const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(require('body-parser').json()); 
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(cookieParser())

app.post("/link/token/create", async (req, res) => {
	configuration['baseOptions']['headers']['PLAID-CLIENT-ID'] = req.cookies['sila_demo_clientId'] || '';
	configuration['baseOptions']['headers']['PLAID-SECRET'] = req.cookies['sila_demo_secretKey'] || '';
	let resObj;
	try {
		const response = await plaidClient.linkTokenCreate({
			user: req.body.user,
			client_name: req.body.client_name,
			products: req.body.products,
			country_codes: req.body.country_codes,
			language: req.body.language
		});
		resObj = { status: response.status, data: response.data };
	} catch (error) {
		resObj = { status: error.response.status, data: error.response.data };
	}
	res.json(resObj);
});

app.post("/item/public_token/exchange", async (req, res) => {
	let resObj;
	try {
		const response = await plaidClient.itemPublicTokenExchange({public_token: req.body.public_token});
		resObj = { status: response.status, data: response.data };
	} catch (error) {
		resObj = { status: error.response.status, data: error.response.data };
	}
	res.json(resObj);
});

app.post("/processor/token/create", async (req, res) => {
	let resObj;
	try {
		const response = await plaidClient.processorTokenCreate({
			access_token: req.body.accessToken,
			account_id: req.body.accountID,
			processor: req.body.processor,
		});
		resObj = { status: response.status, data: response.data };
	} catch (error) {
		resObj = { status: error.response.status, data: error.response.data };
	}
	res.json(resObj);
});

app.listen(PORT, () => {
  console.log(`Server listening at port number: ${PORT}`);
});
