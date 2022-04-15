import { getQueryString } from '../../src/utils';

export const request = async (params) => {
  var method = params.method || 'GET';
  var qs = '';
  var body;
  var headers = params.headers || {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  if (['GET'].indexOf(method) > -1 && params.data)
    qs = '?' + getQueryString(params.data);
  else
    body = JSON.stringify(params.data);

  var url = params.url + qs;
  try {
    const response = await fetch(url, {
      method,
      headers,
      body
    });
    const result = await response.json();
    return result;
  } catch (error) {
    return error;
  }
};

const api = {
  get: params => request(Object.assign({
    method: 'GET'
  }, params)),
  post: params => request(Object.assign({
    method: 'POST'
  }, params)),
  put: params => request(Object.assign({
    method: 'PUT'
  }, params)),
  delete: params => request(Object.assign({
    method: 'DELETE'
  }, params)),
};

export default api;
