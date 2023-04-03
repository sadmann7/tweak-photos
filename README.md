# [TweakPhotos](https://tweakphotos.vercel.app/)

This project let users edit photos with AI. It is bootstrapped with the [T3 Stack](https://create.t3.gg/).

[![TweakPhotos](./public/screenshot.png)](https://tweakphotos.vercel.app/)

## Tech Stack

- [Next.js](https://nextjs.org)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)
- [Replicate API](https://replicate.com/account)

## Features

- Edit photos with AI
- Auto delete photos after 15 minutes using cloudinary

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/sadmann7/tweak-photos
```

### 2. Install dependencies

```bash
yarn install
```

### 3. Create a `.env` file

Create a `.env` file in the root directory and add the environment variables as shown in the `.env.example` file. You can get the Replicate API key from [here](https://replicate.com/account).

### 4. Run the application

```bash
yarn run dev
```

The application will be available at `http://localhost:3000`.

## Deployment

Follow the deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
