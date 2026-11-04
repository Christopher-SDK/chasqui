# Chasqui

[![CI](https://github.com/Christopher-SDK/chasqui/actions/workflows/ci.yml/badge.svg)](https://github.com/Christopher-SDK/chasqui/actions/workflows/ci.yml)
![Node 22](https://img.shields.io/badge/node-22-339933)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6)
![Mutation](https://img.shields.io/badge/mutation-84%25-success)
![License MIT](https://img.shields.io/badge/license-MIT-blue)

> **Testing simulator. Not affiliated with SUNAT or any financial institution.**
> All data (tax IDs, national IDs, people and wallets) is fictitious.

[Español](README.md) · [5-minute demo (ES)](docs/demo.md)

Chasqui is a local **digital twin of Peru's digital ecosystem** for testing integrations before
they reach production: electronic invoices in the UBL 2.1 format used by SUNAT (Peru's tax
authority), dispatch guides, an interoperable mobile wallet with QR payments and webhooks, national
ID / tax ID lookups, and an engine of **injectable, reproducible faults**: outages, latency,
truncated responses, rate limiting and duplicates.

Does your system still invoice correctly when the tax authority returns 503 at month-end? Do you
charge twice when the client retries? Do you lose the invoice when the payment succeeded but the
submission failed? Chasqui reproduces those scenarios on your machine and in CI, with the same seed
every time.

## Quick start

```bash
docker compose up -d                            # simulators + dashboard + demo shop
docker compose --profile observabilidad up -d   # + Grafana, Jaeger and Prometheus
```

Without Docker: `pnpm install && pnpm todo-en-uno` (all four services in one process).

| Service                       | URL                                    |
| ----------------------------- | -------------------------------------- |
| Live dashboard                | http://localhost:7500                  |
| sunat-sim · SOAP (WSDL)       | http://localhost:7100/billService?wsdl |
| sunat-sim · REST + OpenAPI    | http://localhost:7100/docs             |
| pagos-sim · wallet            | http://localhost:7200/docs             |
| identidad-sim · ID lookups    | http://localhost:7300/docs             |
| chaos-control                 | http://localhost:7400/docs             |
| tienda-demo (uses the SDK)    | http://localhost:7600                  |
| Grafana · Jaeger · Prometheus | :3000 · :16686 · :9090                 |

## Why it can be trusted

- **Official rules as the oracle.** Validation rules are not interpreted from documentation: they
  are ported from the executable XSL rules SUNAT publishes, and a differential test checks that
  Chasqui returns the same verdict (code, observations and order) as the official rule: 478
  targeted, 512 random and 200 valid invoices, 118 voided/summary documents and 117 dispatch
  guides.
- **Deterministic chaos.** Every fault decision is `sha256(seed, rule, key#attempt)`: the same
  seed replays the same sequence locally and in CI, and a retry with the same Idempotency-Key can
  recover, just like a real transient failure.
- **Money without surprises.** Idempotency is enforced by a database `UNIQUE` constraint (also
  under 10 concurrent requests), amounts are integer cents, and webhooks are HMAC-signed with a
  timestamp and retried with exponential backoff.
- **Tests at every level.** Unit, property-based (fast-check), conformance, real-HTTP integration,
  Pact contracts between the SDK and each simulator, Playwright E2E on desktop and mobile,
  Stryker mutation testing (84 %) and k6 load tests with thresholds.

## Integrating

- **SDK** ([docs/sdk.md](docs/sdk.md)): fluent invoice builders, idempotent retries,
  `chasqui.chaos.con('cierre-de-mes', test)` and webhook verification.
- **MCP server** ([docs/mcp.md](docs/mcp.md)): 11 tools so an AI agent can issue invoices,
  validate XML, transfer money and toggle faults.
- **Bruno** ([bruno/](bruno/)): ready-made API collection.
- **Observability** ([docs/observabilidad.md](docs/observabilidad.md)): one purchase in the demo
  shop is a single trace across all four services.

Code, API fields and documentation are in Spanish, the language of the domain. Design decisions are
recorded as ADRs in [docs/adr/](docs/adr/).

## Known limitations

Not yet covered: free-of-charge operations, IVAP, exports, excise (ISC), plastic-bag tax (ICBPER),
withholdings and perceptions, advance payments, discounts and charges, and credit installments. The
signature check does not validate the certificate chain. A few server-side rules are not confirmed
by an official source; each one is marked `TODO verificar` and listed in the Spanish README.

## Author

Christopher Arias · [Montreach](https://montreach.com), Lima, Peru. [MIT](LICENSE) license.
