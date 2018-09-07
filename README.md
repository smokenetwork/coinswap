# CoinSwap

to swap [SMOKE](https://cryptofresh.com/a/SMOKE) on Bitshares blockchain from Presale to Smoke Native Token (SMOKE).

## Quick Start
```
cd frontend
yarn build
```

```
cd backend
node server.js
```


# Dev

There are a couple of components:

- Frontend: For users to validate username on Smoke blockchain and generate memo for swapping

- Backend: a cronjob tracking transactions on Bitshares network and transfering SMOKE token on Smoke network.