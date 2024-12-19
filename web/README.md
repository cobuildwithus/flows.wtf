# Nouns Flows

## Overview

Frontend for the protocol for streaming funds to Nouns builders.

Nouns holders vote to set a stream of funding, and can vote again at any time to change the stream.

This project utilizes [Tailwind CSS](https://tailwindcss.com/) for styling, [ShadCN UI](https://ui.shadcn.com/) components for the user interface, and [Prisma](https://www.prisma.io/) for database management.

## Getting Started

### Database Setup

First, ensure you have a local PostgreSQL database running. The easiest way to launch it is by using [DBngin](https://dbngin.com/), a free, all-in-one database version management tool.

### Environment Setup

1. Copy the `.env.example` file to a new file named `.env` in the root directory.
2. Fill in the necessary environment variables in the `.env` file

### Database Management

You can find helpful scripts in the `package.json` for managing the database:

- `pnpm db:push`: Apply changes to your local database schema
- `pnpm db:generate`: Generate Prisma client based on your schema.

The Prisma schema is located at `lib/database/schema.prisma`.

### Running the Development Server

This is a Next.js project. To run the development server:

1. Install dependencies:

   ```
   pnpm install
   ```

2. Start the development server:

   ```
   pnpm dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## ShadCN UI Components

ShadCN UI components are stored in the `components/ui` directory. To generate new components, use the following command:

```
npx shadcn-ui@latest add [component-name]
```

This will add the component to your project and update the necessary configuration files.

More information: https://ui.shadcn.com/docs

## Build and Deployment

When you're ready to build the project:

```
pnpm build
```

This command will automatically run `prisma migrate deploy` before building, ensuring your database is up to date.

## Additional Information

- The project uses Next.js for server-side rendering and routing.
- Prisma is used as an ORM for database operations. The schema file (`schema.prisma`) defines your data model and database structure.
- Tailwind CSS is used for styling. You can customize the configuration in the `tailwind.config.ts` file.
- The project includes various other tools and libraries like `@tanstack/react-query`, `viem`, and `wagmi`
