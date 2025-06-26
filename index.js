const express = require('express');
const orderApp = express();
orderApp.use(express.json());

const orders = [];

orderApp.get('/orders', (req, res) => {
  res.json(orders);
});

orderApp.get('/orders/:id', async (req, res) => {
  const order = orders.find(o => o.orderId == req.params.id);
  if (!order) return res.status(404).send({ error: 'Order not found' });

  try {
    const customerResponse = await axios.get(`http://localhost:8081/customers/${order.customerId}`);
    res.json({ ...order, customer: customerResponse.data });
  } catch (e) {
    res.status(500).send({ error: 'Failed to fetch customer details' });
  }
});

orderApp.post('/orders', (req, res) => {
  const order = { orderId: orders.length + 100, ...req.body, status: 'CONFIRMED' };
  orders.push(order);
  res.status(201).json(order);
});

orderApp.listen(8082, () => console.log('Order Service running on port 8082'));