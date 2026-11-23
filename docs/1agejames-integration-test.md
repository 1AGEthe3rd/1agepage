# @1agejames — first-party integration test plan

Status: **reserved as a proposed test handle, NOT registered, verified or deployed**.

## Identity
- Desired handle: `@1agejames`
- Product: 1AGE Page, standalone 3D orbital social identity.
- Test account must be registered through the authenticated Page/Cash service by the account owner. Do not commit credentials, access tokens, personal contact information or simulated verification.
- Page client currently calls `/api/cash/register`, `/api/cash/login`, `/api/page/profile`, and `/api/page/public?handle=...`. Static GitHub Pages alone does not provide these endpoints.

## Test sequence
1. Run the local authenticated test backend and serve the Page/Cash clients through the same origin.
2. Register `1agejames` with a new **test-only** password, only if the handle is available. Never use the founder's normal password in this test service.
3. Sign in, save display name `1AGE James`, bio `1AGEthe3rd · 1AGE ecosystem`, and optionally enable discoverability.
4. Sign out; confirm the public profile is discoverable only if the owner enabled it.
5. Sign in to Cash with the same test identity. Verify account ledger and zero opening balance.
6. Create a test Cash order; simulate pending, paid, duplicate callback, refund and failed/cancelled outcomes. Verify server-side idempotency and ledger history.
7. Verify no credits can be issued from a browser-only call, no negative balance, and no test credits are confused with live value.
8. Test on mobile portrait and physical controller; preserve the 3D scene and accessible fallback.
9. Only after backend security review and processor authorization, enable actual payment checkout in a separate release.

## Token distinction
- **1AGE Cash**: official internal closed-loop account credit, 100 minor units per credit, target 1 credit = $1 of eligible in-platform spending. Not a transferable/redeemable crypto token, not a stablecoin, not a bank deposit.
- **$1AGE**: separate potential SPL crypto asset; minting and market launch are out of scope for Cash.
- Test balances must always be labeled test credits.
- Free vs Plus checkout fee schedules are proposed business rules, not approved or activated payment processing.

## Release blockers
- Confirm authenticated backend hosting, account ownership and secure identity provisioning.
- Review card-network rules and processor approval for stored credits and proposed checkout fees.
- Validate financial ledger, webhook signature verification, refunds, taxes, consumer disclosures and regulatory scope.
