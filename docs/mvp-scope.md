# MVP Scope

Date: 2026-03-28

## Product Shape

TreasuryOS MVP is a pilot compliance control plane for one institutional customer, not a general fintech platform.

The MVP is locked to:

- single-tenant deployment
- one EU institutional treasury / CASP / fintech customer
- Solana devnet only
- Sumsub only
- manual wallet review
- manual transaction review
- one monthly MiCA operations report
- roles limited to `admin`, `compliance_officer`, and `auditor`
- no live AMINA or SWIFT rails

## Success Criteria

The MVP should only be considered usable for pilot launch when all of the following are true:

- one operator can authenticate and keep a session alive
- one legal entity can be onboarded and reviewed
- one Sumsub applicant can be created and reconciled through a verified webhook
- one wallet can be approved and pushed through the whitelist path
- one transaction case can be reviewed and resolved
- one monthly report can be generated and exported
- every privileged action has an audit event

## Hard Cut Line

If time slips, cut these first:

1. extra dashboard polish
2. bank rail integration work
3. multiple KYC providers
4. extra reports
5. multiple jurisdictions

Do not cut:

1. auth
2. session control
3. audit evidence
4. migration path
5. webhook verification
6. wallet approval controls
7. transaction review controls

## Launch Metrics

Track these from the start:

- entity approval turnaround time
- Sumsub webhook failure rate
- wallet sync success rate
- case review turnaround time
- report generation success rate
- blocked unauthorized action count
- percentage of privileged actions with audit evidence
