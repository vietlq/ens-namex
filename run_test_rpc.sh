#!/bin/bash

mkdir -p testrpc.db

ganache-cli -s \
    -p 8545 -h 0.0.0.0 \
    --networkId 4224 \
    --db $PWD/testrpc.db \
    --account="0x351494a5ae8f9b70a2a2fd482146ab4578f61d4d796685c597ec6683635a940e, 100000000000000000000" \
    --account="0x4cd491f96e6623edb52719a8d4d1110a87d8d83e3fa86f8e14007cb3831c0a2b, 100000000000000000000" \
    --account="0xef40e0d6ada046010b6965d73603cabae1a119ca804f5d9e9a9ce866b0bea7d, 100000000000000000000"
