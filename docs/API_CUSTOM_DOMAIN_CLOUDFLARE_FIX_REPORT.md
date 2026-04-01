# API Custom Domain Cloudflare Fix Report

## Summary

I re-verified the remaining API custom-domain blocker for the beta launch.

The current failure is now clearly isolated to **Cloudflare DNS / proxying**, not
to Railway.

## What Was Verified

The public custom domain still fails when reached normally:

```text
https://api.treasuryos.aicustombot.net/api/health
```

Current failure:

```text
LibreSSL: sslv3 alert handshake failure
```

However, the same custom hostname works correctly when I force the connection
directly to Railway's live API service domain:

```bash
curl --connect-to \
  api.treasuryos.aicustombot.net:443:treasuryosapi-gateway-production.up.railway.app:443 \
  https://api.treasuryos.aicustombot.net/api/health
```

That direct-connect test returned `HTTP/2 200` with the expected JSON health
response.

## Conclusion

Railway is already serving the branded API hostname correctly.

That means:

- the Railway custom-domain object exists
- Railway is willing to answer for `api.treasuryos.aicustombot.net`
- Railway TLS for the branded hostname is working when traffic reaches Railway

So the remaining launch blocker is the Cloudflare-side route, not Railway.

## Required Cloudflare Change

Update the DNS record for:

- name: `api.treasuryos.aicustombot.net`
- type: `CNAME`
- target: `treasuryosapi-gateway-production.up.railway.app`

Safest initial setting:

- **Proxy status**: `DNS only`

Starting with `DNS only` avoids keeping Cloudflare in the TLS path while
verifying the Railway custom-domain route. Once the custom domain returns `200`
cleanly, proxying can be revisited if desired.

## Important Correction

An older domain report in the repository referenced the stale Railway hostname
`p623sier.up.railway.app`.

That is no longer the correct active service target for the live API Gateway.
The currently healthy Railway service domain is:

- `treasuryosapi-gateway-production.up.railway.app`

## Why This Blocks Launch

The beta launch decision is now:

- Sentry is waived for beta
- GitHub CD is working
- production env-name verification is complete
- the branded API custom domain is still required before launch

So this Cloudflare record is now the single remaining hard launch gate before
the final live smoke pass.
