# Fusebox and react without Babel


```
npm install
npm start
```

test account handle 
eb57eca29ccba5c1bffda6dee7aaa59c21fbf6e1b44573f7e6b9c970eaa8199d044e086021f4d200634ec57118b77619b8deb8e583b78327b6b3c4291096f7fd


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