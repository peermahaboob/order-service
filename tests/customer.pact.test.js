const { Pact } = require("@pact-foundation/pact");
const axios = require("axios");
const path = require("path");
const baseUrl = provider.mockService.baseUrl;

describe("Order Service - Customer Service Contract", () => {
  describe("GET /customers/:id - existing customer", () => {
    let provider;
    const setupPactProvider = () =>
      new Pact({
        consumer: "OrderService",
        provider: "CustomerService",
        port: 0, // Random port
        log: path.resolve(process.cwd(), "logs", "pact.log"),
        dir: path.resolve(process.cwd(), "pacts"),
        logLevel: "INFO",
      });

    beforeAll(() => {
      provider = setupPactProvider();
      return provider.setup();
    });

    afterAll(() => provider.finalize());

    beforeEach(() =>
      provider.addInteraction({
        state: "customer with id 1 exists",
        uponReceiving: "a request for customer with id 1",
        withRequest: {
          method: "GET",
          path: "/customers/1",
          headers: { Accept: "application/json" },
        },
        willRespondWith: {
          status: 200,
          headers: { "Content-Type": "application/json" },
          body: {
            id: 1,
            name: "Alice",
            email: "alice@example.com",
          },
        },
      })
    );

    it("should return customer details", async () => {
      const response = await axios.get(`${baseUrl}/customers/1`, {
        headers: { Accept: "application/json" },
      });

      expect(response.status).toBe(200);
      expect(response.data).toEqual({
        id: 1,
        name: "Alice",
        email: "alice@example.com",
      });

      await provider.verify();
    });
  });

  describe("GET /customers/:id - non-existent customer", () => {
    let provider;

    beforeAll(() => {
      provider = setupPactProvider();
      return provider.setup();
    });
    afterAll(() => provider.finalize());

    beforeEach(() =>
      provider.addInteraction({
        state: "customer with id 999 does not exist",
        uponReceiving: "a request for non-existent customer",
        withRequest: {
          method: "GET",
          path: "/customers/999",
          headers: { Accept: "application/json" },
        },
        willRespondWith: {
          status: 404,
          headers: { "Content-Type": "application/json" },
          body: {
            error: "Customer not found",
          },
        },
      })
    );

    it("should return 404 for non-existent customer", async () => {
      const response = await axios.get("http://localhost:1235/customers/999", {
        headers: { Accept: "application/json" },
        validateStatus: () => true,
      });

      expect(response.status).toBe(404);
      expect(response.data).toEqual({
        error: "Customer not found",
      });

      await provider.verify();
    });
  });
});
