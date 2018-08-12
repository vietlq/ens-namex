#!/bin/bash

geth --rinkeby --syncmode "light" --metrics \
    --datadir /mnt/d/geth-rinkeby --port "30303" --nat "any" \
    --rpc --rpcaddr="0.0.0.0" --rpcport "8545" --rpccorsdomain "*" \
    --rpcapi db,eth,net,ssh,web3,personal,admin,debug \
    --ws --wsaddr "0.0.0.0" --wsport "8546" --wsorigins='*' \
    --wsapi db,eth,net,ssh,web3,personal,admin,debug
