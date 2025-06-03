This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Technologies 
- Next.js with Typescript
- React
- Tailwind CSS
- Redux
- Turbopack
- Stripe

## Getting Started

First, install dependencies with `yarn install`. 
Note: Delete node_modules/ fodler if extists already before running above command.

then run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Code Structure
public/
src/
    |-components
    |-images
    |-pages
    |-store
    |-styles

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.


Upgrading the NextJS project: `npx @next/codemod@canary upgrade latest`
https://nextjs.org/docs/pages/guides/upgrading 

## Upgradding to nextjs v.15.3.3 from 15.0.2 (vulnerable version) - June 3, 2025
Upgraded using this command:
`npx @next/codemod@canary upgrade latest`


This command created these changes:
```bash
"next": "15.0.2" --> "15.3.3"
"react": "19.0.0-rc-02c0e824-20241028" --> "19.1.0"
"react-dom": "19.0.0-rc-02c0e824-20241028" --> "19.1.0"
"@types/react": "^18" --> "19.1.6"
"@types/react-dom": "^18" --> "19.1.5"
"eslint-config-next": "^15.2.4" --> "15.3.3"

```

Added this to the package.json:
```bash
"resolutions": {
    "@types/react": "19.1.6",
    "@types/react-dom": "19.1.5"
}
```

**Breaking Change**
Async Request APIs - Previously synchronous Dynamic APIs that rely on runtime information are now asynchronous:

- cookies, headers, draftMode, params in layout.js, page.js, route.js, default.js, opengraph-image, twitter-image, icon, and apple-icon.
and - searchParams in page.js

Note: This doesn't concern us tho, as we dont use the `next/headers` in our codebase
https://nextjs.org/docs/app/guides/upgrading/version-15 

**Testing Application After Upgrade**

- Tested diffferent user basic functionality such as logins/logout, create orders, 
- Tested teh middleware by trying to access unauthorized pages

**Key features in Next.js from 15.2.3:**
*   **Redesigned error UI and improved stack traces:**  Provides a better debugging experience.
*   **Streaming metadata:** Async metadata no longer blocks page rendering or client-side transitions.
*   **Turbopack performance improvements:**  Faster compile times and reduced memory usage.
*   **React View Transitions (experimental):**  Experimental support for React's new View Transitions API.
*   **Node.js Middleware (experimental):** Experimental support for using the Node.js runtime in Middleware.
*   **Critical Middleware Vulnerability Fix:** Version 15.2.3 (and later versions) includes a fix for a critical authorization bypass vulnerability in Middleware (CVE-2025-29927).
*   

**Notes**
* I noticed some lslownss with page rendering after the upgrade
* Warnings during running the upgrade command:
```bash
npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
npm warn deprecated rimraf@2.6.3: Rimraf versions prior to v4 are no longer supported
npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
npm warn deprecated cross-spawn-async@2.2.5: cross-spawn no longer requires a build toolchain, use it instead
Thank you for using @next/codemod!
```
We can look more into these later or monitor them as we develop.