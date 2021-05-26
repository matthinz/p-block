#!/usr/bin/env bash

set -euo pipefail

TEST=$1; shift;

pushd $TEST

rm -rf node_modules dist

yarn add "typescript@^${TYPESCRIPT_VERSION}"

yarn link p-block

node_modules/.bin/tsc --esModuleInterop index.ts --outDir dist

yarn test

popd
