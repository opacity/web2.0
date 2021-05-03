import { combineEpics } from "redux-observable";

import metamaskEpic from "./metamask-epic";
import signupEpic from "./signup-epic";
import upgradeEpic from "./upgrade-epic";

export default combineEpics(
  metamaskEpic,
  signupEpic,
  upgradeEpic,
);
