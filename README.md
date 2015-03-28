# CNN Creator
CNN Creator allows you to build graphical models for CNN's and then generate the code/template for the network!

## Quick Setup
After cloning the repo, run

```
npm install
```

If you are running your mongo database locally, run

```
npm run setup-local
```
Otherwise, run

```
npm run setup -- -m MONGO_URI
```
where `MONGO_URI` is the uri of your given mongo instance. For example:

```
npm run setup -- -m mongodb://127.0.0.1:27017/netsim
```

Next, run

```
npm start
```

Finally, navigate to `localhost:8082` in a browser to use CNN Creator!
