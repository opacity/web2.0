# Fusebox and react without Babel


```
npm install
npm start
```

test account handle 
Z2X9YJSENqqN4b8ueRiTVDl9k8n36dviwKb/eVOc6IgegzaygKtHtHqJqEpKmQv3RmncX05Ki6UQoA1RH/IVLQ==
IPn/MUBEhHIPeiUxFfx/56/dsCdFBTF5s3n7BIejp2dyZK9WEu+zzwXxKBFBNYsMQJVWLVct5m1msIenSsMTNA==


git submodule add -b dev https://github.com/opacity/ts-client-library.git <br/>
cd ts-client-library <br/>
npx lerna bootstrap

git submodule foreach git pull
git submodule update --init --recursive


 // {
    //   key: "first-level-node-1",
    //   label: "My Folders",
    //   nodes: [
    //     {
    //       key: "0-level-node-1",
    //       label: "Movies",
    //     },
    //     {
    //       key: "1-level-node-1",
    //       label: "New Folder",
    //     },
    //     {
    //       key: "2-level-node-1",
    //       label: "Pictures",
    //     },
    //   ],
    // },