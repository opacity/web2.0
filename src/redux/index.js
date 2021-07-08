import { applyMiddleware, compose, createStore } from "redux";
import * as Sentry from "@sentry/react";
import { createLogger } from "redux-logger";
import { createEpicMiddleware } from "redux-observable";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { routerMiddleware } from "connected-react-router";

import { IS_DEV } from "../config";

import epics from "./epics";
import reducer from "./reducers";
import history from "./history";

const sentryReduxEnhancer = Sentry.createReduxEnhancer({});

const composeFn = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const epicMiddleware = createEpicMiddleware();

const middleware = [
  IS_DEV && createLogger(),
  epicMiddleware,
  routerMiddleware(history),
].filter(x => !!x);

const persistConfig = {
  key: "opacity",
  storage: storage,
  whitelist: []
};

export const store = createStore(
  persistReducer(persistConfig, reducer(history)),
  composeFn(applyMiddleware(...middleware), sentryReduxEnhancer)
);

export const persistor = persistStore(store, {}, () => {
  // store.dispatch(uploadActions.refreshIncompleteUploads());
});

epicMiddleware.run(epics);
