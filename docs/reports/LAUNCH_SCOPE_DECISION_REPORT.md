# Launch Scope Decision Report

Task:
- `launch-scope-decision`

Decision:
- The first live launch will go forward without KYC.
- Sumsub remains disabled and presented as coming soon.
- Solana stays in scope for launch.

Why this decision was made:
- Production Sumsub credentials are not ready, but the platform can still launch core functionality.
- The codebase already supports a Sumsub-disabled path in both the API and dashboard.
- This keeps launch momentum while avoiding a blocked release on KYC onboarding.

Confirmed implications:
- No live KYC-dependent onboarding should be promised in launch messaging.
- Product, support, and operations should treat KYC as a post-launch feature.
- The next work should focus on deployment blockers and production readiness for the non-KYC launch path.

Current next ready tasks:
- `launch-dashboard-build-fix`
- `launch-production-env-config`
- `launch-solana-path`
- `launch-sumsub-path`

Status:
- Completed
