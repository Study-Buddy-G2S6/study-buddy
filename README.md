[![ci-nextjs-application-template](https://github.com/ics-software-engineering/nextjs-application-template/actions/workflows/ci.yml/badge.svg)](https://github.com/ics-software-engineering/nextjs-application-template/actions/workflows/ci.yml)

For details, please see http://ics-software-engineering.github.io/nextjs-application-template/.

## Vercel Deployment Notes

- Build runs `prisma generate` + `prisma migrate deploy` before `next build`.
- Set environment variables in Vercel:
	- `POSTGRES_PRISMA_URL`
	- `POSTGRES_URL_NON_POOLING`
	- `POSTGRES_URL`
	- `NEXTAUTH_URL`
	- `NEXTAUTH_SECRET`
- Server pages and API routes using Prisma are marked:
	- `export const dynamic = 'force-dynamic'`
	- `export const runtime = 'nodejs'`
- First deploy applies migrations; database must be reachable.
