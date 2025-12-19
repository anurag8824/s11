"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const elasticsearch_1 = require("@elastic/elasticsearch");
const client = new elasticsearch_1.Client({
    node: 'https://localhost:9200',
    auth: {
        apiKey: 'XzFEV1U0SUJGOEU4cmhKay0wM1k6SWJVQThSQ3hUeTZZQWFiUUI1Tmp4QQ==',
    },
    // auth: {
    //   username: "elastic",
    //   password: process.env.elasticsearch_password || "changeme",
    // },
    tls: { rejectUnauthorized: false },
});
exports.default = client;
//# sourceMappingURL=elastic.client.js.map