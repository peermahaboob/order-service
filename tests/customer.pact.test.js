const { Pact } = require("@pact-foundation/pact");
const axios = require("axios");
const path = require("path");

let provider;

beforeAll(() => {
  provider = new Pact({
    consumer: "OrderService",
    provider: "CustomerService",
    port: 1234,
    log: path.resolve(process.cwd(), "logs", "pact.log"),
    dir: path.resolve(process.cwd(), "pacts"),
    logLevel: "INFO",
  });
  return provider.setup();
});

afterAll(() => provider.finalize());

// DRY: Helper to set up interactions
const setupInteraction = (interaction) => {
  return provider.addInteraction(interaction);
};

describe("Order Service - Customer Service Contract", () => {
  describe("GET /customers/:id - existing customer", () => {
    beforeEach(() => {
      return setupInteraction({
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
      });
    });

    it("should return customer details", async () => {
      const baseUrl = provider.mockService.baseUrl;

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
    beforeEach(() => {
      return setupInteraction({
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
      });
    });

    it("should return 404 for non-existent customer", async () => {
      const baseUrl = provider.mockService.baseUrl;

      const response = await axios.get(`${baseUrl}/customers/999`, {
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
