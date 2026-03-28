# TreasuryOS: Next Actions Roadmap

This document outlines the strategic roadmap for evolving the TreasuryOS MVP into a production-grade, MiCA-compliant operations suite.

## Phase 1: Security & Infrastructure (In Progress)
- [x] **KMS Vault Logic**: Transitioned from filesystem keys to AWS KMS hardware signing logic.
- [x] **Vercel/Serverless Readiness**: API Gateway optimized for serverless runtime.
- [ ] **Protocol Audit**: Hire a third-party security firm to audit the Anchor programs and Rust permissioning logic.
- [ ] **Infrastructure Provisioning**: Deploy to a formal Kubernetes (EKS/GKE) cluster or set up the managed Vercel/Cloudflare edge.

## Phase 2: Real-World Connectivity (6-12 Weeks)
- [ ] **Banking Integration**: Secure production mTLS certificates for Amina/SWIFT and implement the live ISO20022 message relay.
- [ ] **Sumsub Webhooks**: Connect the KycService to live Sumsub webhooks for automated entity status transitions.
- [ ] **Solana Mainnet**: Set up a dedicated RPC node (Helius/Triton) and fee management.

## Phase 3: Governance & AI (Logic Implemented)
- [x] **Multi-Signature Handover**: Integrated **Squads V4** for institutional multisig governance.
- [ ] **AI-Assisted Screening**: Benchmarking transaction history using LLM-based risk scoring.

## Current Project Status
- **Core MVP**: [COMPLETED]
- **Operational Dashboard**: [STABLE]
- **Institutional Logic (KMS/Squads)**: [SYSTEM READY]
- **Security Posture**: [PRODUCTION-READY LOGIC]
- **Deployment**: [VERCEL CONFIG READY]
