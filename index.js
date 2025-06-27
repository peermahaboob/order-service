const express = require('express');
const axios = require('axios');

const orderApp = express();
orderApp.use(express.json());

const orders = [];

const CUSTOMER_SERVICE_URL = process.env.CUSTOMER_SERVICE_URL || 'http://localhost:8081';

orderApp.get('/orders', (req, res) => {
  res.json(orders);
});

orderApp.get('/orders/:id', async (req, res) => {
  const order = orders.find(o => o.orderId == req.params.id);
  if (!order) return res.status(404).send({ error: 'Order not found' });

  try {
    const customerResponse = await axios.get(
      `${CUSTOMER_SERVICE_URL}/customers/${order.customerId}`,
      { headers: { 'Accept': 'application/json' } }
    );
    res.json({ ...order, customer: customerResponse.data });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.status(404).send({ error: 'Customer not found' });
    } else {
      res.status(500).send({ error: 'Failed to fetch customer details' });
    }
  }
});

orderApp.post('/orders', (req, res) => {
  const order = { orderId: orders.length + 100, ...req.body, status: 'CONFIRMED' };
  orders.push(order);
  res.status(201).json(order);
});

if (require.main === module) {
  orderApp.listen(8082, () => console.log('Order Service running on port 8082'));
}

module.exports = orderApp;