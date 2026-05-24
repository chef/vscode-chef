# Security Policy                                            

## Reporting a Vulnerability

See https://chef.io/security for our security policy and how to report a vulnerability.

## Local Secret Hygiene

- Never commit real credentials (API keys, PATs, private keys, cloud credential files, or `.env` files).
- Use environment variables or local-only files for development secrets, and keep example placeholders in docs/snippets.
- If a secret is committed by mistake, rotate/revoke it immediately and remove it from Git history before publishing.
- Run secret scanning in CI and before release to catch accidental exposures early.

