# JWT Guard Public Routes Fix

**Issue:** Health endpoint (`/api/health`) was returning 401 Unauthorized despite being marked with `@Public()` decorator.

**Root Cause:** The NestJS Reflector's `getAllAndOverride()` method was not reliably detecting the `@Public()` decorator metadata, potentially due to:
- TypeScript compilation differences between local development and Railway's tsx runtime
- Decorator metadata not being properly preserved during runtime compilation
- Possible timing issue with decorator application in the guard execution lifecycle

**Solution:** Added explicit public routes list as a fallback mechanism in the JWT guard.

## Implementation

**File:** `apps/api-gateway/src/modules/auth/guards/jwt-auth.guard.ts`

Added a `PUBLIC_ROUTES` constant at the top of the guard:

```typescript
const PUBLIC_ROUTES = [
  '/api/health',
  '/api/health/live',
  '/api/health/ready',
  '/health',
  '/favicon.ico',
];
```

Modified `canActivate()` to check this list first:

1. Extract the request path (without query parameters)
2. Check if path starts with any public route using `Array.some()`
3. If found, skip authentication immediately
4. If not found, fall back to Reflector check for `@Public()` decorator
5. Finally, use parent's authentication for protected routes

## Advantages

- **Reliability:** Health endpoints work even if decorator metadata is not detected
- **Simplicity:** Fallback mechanism is straightforward and auditable
- **Layered Defense:** Maintains decorator check as secondary layer for other public routes
- **Performance:** Path-based check is faster than Reflector metadata lookup

## Testing

Railway health checks should now pass immediately after deployment:

```bash
# From Railway dashboard or local curl
curl -i https://your-app.up.railway.app/api/health
# Expected: 200 OK
```

## Notes

- All health check variants are included (`/api/health`, `/api/health/live`, `/api/health/ready`)
- Query parameters are stripped before path matching
- Decorator-based public routes still work if metadata is available
- This fix unblocks Railway deployment but underlying decorator issue should be investigated
