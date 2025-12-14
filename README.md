[![ci-study-buddy](https://github.com/Study-Buddy-G2S6/study-buddy/actions/workflows/ci.yml/badge.svg)](https://github.com/Study-Buddy-G2S6/study-buddy/actions/workflows/ci.yml)

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
