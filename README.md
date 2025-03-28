# Frontrunner

> Study of an SNX frontrunning bot.

# Trading Strategies

> [Go to the trading straregies README][strategies]

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

-   `DATABASE_URL` A url with credentials pointing to the data store, only required on production.
-   `DISCORD_GUILD_ID` The guild id of your server.
-   `DISCORD_BOT_TOKEN` The Discord token of the bot.
-   `DISCORD_BOT_LOG_CHANNEL_ID` The channel id the bot will log to.
-   `RPC_PROVIDER_KOVAN` RPC Provider for KOVAN.
-   `RPC_PROVIDER_MAINNET` RPC Provider for MAINNET.
-   `RPC_PROVIDER_POLYGON` RPC Provider for POLYGON.
-   `SIGNER_PRIVATE_KEY` Signer private key.

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

# Trading Strategies

There are currently two trading strategies implemented.

## Open - Close Strategy

1. When each new block is mined, the prices from the oracles of all the watched synths is fetched, also the same price is fetched from SNX but they are identical, so I'll only use the "oracle price" onwards.
2. Every 2 seconds, the bot queries kraken, coinbase, bitfinex for the synths that are supported, and produces averages out of these prices.
3. On each heartbeat (the 2 seconds we fetch new feed prices) an decision making happens. If any of the "oracle price synth" compared to the "feed price synth" is over the trigger threshold, the bot will buy that synth. The threshold was set to 0.5% so it'd be more than the 0.4% that SNX fee is.
4. Once the trade is open, the bot now enters into an "open trade" mode, where it monitors each new block and expects the Oracle price to change, towards any direction, just change. This stage can take from seconds to minutes as the oracles are slow to update.
5. As long as the bot is in "open trade" mode, it will also keep checking the feed price. If the feed price becomes unfavorable, i.e. it drops sharply, the bot has a "cut losses" trigger that will immediately sell the asset back to USD and close the position.
6. The moment the oracle changes price, the bot sells the synth back to sUSD and the trade closes.

This is a losing strategy, as SNX fee is paid twice, once on buy and once on sell, thus it becomes 0.8%. There are very rare opportunities that exceed 0.8%.

## Roam Strategy

Roaming strategy is similar to open-close, the "open part", except it checks across all assets for opportunities and does not use USD as the pivot token.

For example, if the bot holds UNI and we have the following divergences:

-   "BTCUSD": "-0.39%",
-   "ETHUSD": "0.30%",
-   "LINKUSD": "-1.02%",
-   "UNIUSD": "-0.58%",
-   "AAVEUSD": "0.63%",

The bot will determine that there is a tradeing opportunity between UNI (-0.58%) and AAAVE (+0.63) for a total of +1.21%. It will execute the trade, exchanging UNI for AAVE and stop. Wait for the next cross-token opportunity, so on and so forth.

-   ℹ️ The roam strategy is considered closed, once the target token (the one the bot bought), has an oracle price change. It is at that point that the bot considers the trade "closed" and performs the final update on the trade-roam record and reports on discord. This is done so we can view how the trade went from prediction (opportunity feed price) to when the oracle actually updated.
-   ℹ️ The roam strategy to work, cannot even hold sUSD, it needs to start with any other synth.

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

Merge to `main` branch and CI will automatically deploy to Heroku.

## License

Copyright © [Thanos Polychronakis][thanpolas], All Rights Reserved.

[docker-compose]: https://docs.docker.com/compose/reference/overview/
[docker-desktop]: https://www.docker.com/products/docker-desktop
[dotenv]: https://github.com/motdotla/dotenv#readme
[thanpolas]: https://github.com/thanpolas
[tz]: https://momentjs.com/timezone
[strategies]: /app/entities/frontrunner/strategies/README.md
