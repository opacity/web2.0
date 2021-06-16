# Opacity Web2.0

## Installation

```sh
git submodule update --init --recursive
cd ts-client-library
npx lerna bootstrap
cd ..
cd opaque
npm install
cd ..

npm install
npm run start
```

## Updating ts-client-library

```sh
cd ts-client-library
git fetch --all
git reset --hard origin/main
npx lerna bootstrap
cd ..
```
