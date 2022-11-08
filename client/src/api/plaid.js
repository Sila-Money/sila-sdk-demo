import plaidApi from './api';

const createLinkToken = async (data) => {
  try {
    const response = await plaidApi.post({
      url: '/link/token/create',
      data: data
    });
    return response;
  } catch (error) {
    throw error;
  }
};

const exchangeToken = async (data) => {
  try {
    const response = await plaidApi.post({
      url: '/item/public_token/exchange',
      data: data
    });
    return response;
  } catch (error) {
    throw error;
  }
};

const createProcessorToken = async (data) => {
  try {
    const response = await plaidApi.post({
      url: '/processor/token/create',
      data: data
    });
    return response;
  } catch (error) {
    throw error;
  }
};

const plaid = {
  createLinkToken,
  exchangeToken,
  createProcessorToken
};

export default plaid;