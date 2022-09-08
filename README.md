# RealWorld Example App

> ### [AdonisJS](https://adonisjs.com) codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://github.com/gothinkster/realworld) spec and API.


This codebase was created to demonstrate a fully fledged fullstack application built with [**AdonisJS**](https://adonisjs.com) including CRUD operations, authentication, routing, pagination, and more.

We've gone to great lengths to adhere to the [**AdonisJS**](https://adonisjs.com) community styleguides & best practices.

For more information on how to this works with other frontends/backends, head over to the [RealWorld](https://github.com/gothinkster/realworld) repo.

## How it works

Since AdonisJS is a "convention over configuration" type of framework, this codebase follows the architecture described by the [documentation](https://docs.adonisjs.com/guides/application); starting with the [initial `web` project scaffold](https://docs.adonisjs.com/guides/installation#creating-a-new-project). Along with the default packages, the following official packages are used as well:

- [`@adonisjs/lucid`](https://docs.adonisjs.com/guides/database/introduction): Database connections and ORM data layer (this app connects to a local sqlite database stored in `tmp/`)
- [`@adonisjs/lucid-slugify`](https://www.npmjs.com/package/@adonisjs/lucid-slugify): Generates slugs on models based on other fields
- [`@adonisjs/auth`](https://docs.adonisjs.com/guides/auth/introduction): Authentication management integrated with Lucid (this app uses cookie sessions)

The app uses [resourceful routes and controller actions](https://docs.adonisjs.com/guides/controllers#resourceful-routes-and-controllers) for managing functionality.

No client-side JavaScript is used as none was required to match the expected feature-set described by the [RealWorld spec](https://realworld-docs.netlify.app/docs/intro).

Functionality is tested end-to-end using the [provided testing framework](https://docs.adonisjs.com/guides/testing/introduction) with a custom plugin to integrate [Playwright](https://playwright.dev/) browser control and [Testing Library](https://github.com/testing-library/playwright-testing-library) queries. Run `pnpm test`, after going through the "Getting started" section below, to see the full coverage. These run headless in Firefox by default; view the live browser interactions by setting the `HEADLESS` environment variable to "0". 

_See the custom plugin code in the `tests/bootstrap.ts` until it is abstracted out into its own package_


## Getting started

This codebase relies on [Node.js](https://nodejs.org/en/) version 14+ as the runtime and [pnpm](https://pnpm.io/) for package management. I suggest using something like [volta](https://volta.sh/) to quickly install and manage Node.js and associated tooling on your system. After those prerequisites have been met, run the follow commands to get started:

```
cp .env.example .env
pnpm install
pnpm db:setup
pnpm dev
```

- `cp .env.example .env`: creates [environment variable for local development](https://docs.adonisjs.com/guides/environment-variables#defining-variables-in-the-development)
- `pnpm install`: this installs the runtime and development dependencies for the project
- `pnpm setup`: runs all the pending database migrations and seeds the sqlite database located in the `tmp/` directory
- `pnpm dev`: starts the application and watches for file changes to trigger restarting it as needed
