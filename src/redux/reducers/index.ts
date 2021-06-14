import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";

import signup from "./signup-reducer";
import upgrade from "./upgrade-reducer";

export default history =>
  combineReducers({
    router: connectRouter(history),
    signup,
    upgrade,
  });
