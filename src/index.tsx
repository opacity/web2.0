import * as React from "react";
import * as ReactDOM from "react-dom";
import { Router, Route, Switch, Link } from "react-router-dom";
import { Application } from "./components/application/Application";
import LandingPage from "./pages/LandingPage/LandingPage";
import PlatformPage from "./pages/PlatformPage/PlatformPage";
import history from "./redux/history";
import "./index.scss";
function App() {
  return (
    <Router history={history}>
      <Switch>
        <Route exact path="/" component={LandingPage} />
        <Route exact path="/platform" component={PlatformPage} />
      </Switch>
    </Router>
  );
}
ReactDOM.render(<App />, document.getElementById("root"));
