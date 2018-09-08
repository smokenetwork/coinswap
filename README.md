# CoinSwap

to swap [SMOKE](https://cryptofresh.com/a/SMOKE) on Bitshares blockchain from Presale to Smoke Native Token (SMOKE).


![screenshot](https://user-images.githubusercontent.com/11970690/45248698-e2d8bf80-b33e-11e8-9236-1497b40a1535.png)


## Quick Start

There are a couple of components:

- Frontend: For users to validate username on Smoke blockchain and generate memo for swapping

```
cd frontend
yarn
yarn start
```


- Backend: a cronjob tracking transactions on Bitshares network and transfering SMOKE token on Smoke network.

Requires mysql db, create `config.cronjob.json` from `config.cronjob.json.sample`


SQL script to init db `smoke_coinswap`

```sql
create table cronjob
(
	datakey varchar(255) null,
	datavalue varchar(255) null
)
comment 'to store info for cron jobs'
;

create table tbl_tx
(
	bts_tx_id char(64) not null
		primary key,
	bts_user_id char(64) not null,
	bts_block_num int default '0' not null,
	amount float default '0' not null,
	swap_status int default '0' not null,
	smk_user char(16) null,
	smk_tx_id char(64) null,
	smk_block_num int null
)
;


```

# Production

```
cd frontend
yarn build
```

```
cd backend
node server.js
```


frontend and cronjob dont need to be running on the same server.

cronjob should be run in a secured server.

```
node cronjob.js
```