# CoinSwap

to swap [SMOKE](https://cryptofresh.com/a/SMOKE) on Bitshares blockchain from Presale to Smoke Native Token (SMOKE).


![screenshot](https://user-images.githubusercontent.com/11970690/45248698-e2d8bf80-b33e-11e8-9236-1497b40a1535.png)


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

# Production

frontend and cronjob dont need to be running on the same server.

cronjob should be run in a secured server.
