import * as React from "react";
import * as ReactDOM from "react-dom";
import { Router, Route, Switch, Link } from "react-router-dom";
import { Application } from "./components/application/Application";
import LandingPage from "./pages/LandingPage/LandingPage";
import PlatformPage from "./pages/PlatformPage/PlatformPage";
import PlansPage from "./pages/PlansPage/PlansPage";
import CommunityPage from "./pages/CommunityPage/CommunityPage";
import FileManagePage from "./pages/FileManagePage/FileManagePage";
import ForgotPage from "./pages/ForgotPage/ForgotPage";
import history from "./redux/history";
import { PrivateRoute } from "./PrivateRoute";
import "./index.scss";
import 'react-toastify/dist/ReactToastify.css';
function App() {
  return (
    <Router history={history}>
      <Switch>
        <Route exact path='/' component={LandingPage} />
        <Route exact path='/platform' component={PlatformPage} />
        <Route exact path='/plans' component={PlansPage} />
        <Route exact path='/community' component={CommunityPage} />
        <PrivateRoute exact path='/file-manager' component={FileManagePage} />
        <PrivateRoute exact path='/file-manager/:folderName' component={FileManagePage} />
        <Route exact path='/forgot' component={ForgotPage} />
      </Switch>
    </Router>
  );
}
ReactDOM.render(<App />, document.getElementById("root"));
