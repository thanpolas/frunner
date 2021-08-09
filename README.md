# Frontrunner

> Study of an SNX frontrunning bot.

# How To Install

## Clone and Build

```
git clone git@github.com:thanpolas/frontrunner.git

cd frontrunner

npm i
```

## Create The Bot

1. Go to the developer portal: https://discord.com/developers/applications
    1. Create Application.
    1. Go to "Bot" Menu and add expected permissions.
    1. Go to "OAuth2" menu and select the "bot" scope.
    1. Copy the OAuth2 URL and paste it on the browser.
    1. Help on creating a bot: https://discordpy.readthedocs.io/en/latest/discord.html

## Update Env variables with the bot tokens

1. Copy `.env-template` to `.env` and fill in the required values.
1. Update env variables on the project.

## Prepare Docker

We use Docker and docker-compose for postgres, so you will need to install
the [Docker Desktop][docker-desktop] package
on your local machine.

Once that is done, enter the working directory and type:

```
docker-compose up
```

[More on all `docker-compose` available commands][docker-compose].

## Needed Environment Variables

All targets require the following environment variables:

-   `DATABASE_URL` A url with credentials pointing to the data store.
-   `DISCORD_GUILD_ID` The guild id of your server.
-   `DISCORD_BOT_TOKEN` The Discord token of the bot.

This project also supports a [`.env` file][dotenv] which is on `.gitignore`
for your convenience when developing on your local.

# Development Operations / Maintenance

## Reset Local Database

```
npm run db:reset:local
```

## Database Migration Commands

### Create a New Migration Script

```
npm run knex:create_migration <name of migration>
```

### Run Migrations

```
npm run knex:migrate
```

## Running Tests Locally

Use the `jest` command to run all tests or specific ones.

### Reset Test Database

The tests will look for the `NUKE_TEST_DB` environment variable to be set to
initiate the test database nuking and re-population, use it like so:

```bash
NUKE_TEST_DB=1 jest
```

## Update Node Version

When a new node version is available you need to updated it in the following:

-   `/package.json`
-   `/.nvmrc`
-   `/.circleci/config.yml`
-   `/Dockerfile`

## Create ETH Keys

Generate a new ethereum wallet

```
ethkey generate
```

This will store details on the file `keyfile.json`, which is on .gitignore.

### Get the Private Key

```
ethkey inspect ./keyfile.json --private
```

# Deployment

TBD

## License

Copyright © [Thanos Polychronakis][thanpolas], All Rights Reserved.

[docker-compose]: https://docs.docker.com/compose/reference/overview/
[docker-desktop]: https://www.docker.com/products/docker-desktop
[dotenv]: https://github.com/motdotla/dotenv#readme
[thanpolas]: https://github.com/thanpolas
[tz]: https://momentjs.com/timezone
