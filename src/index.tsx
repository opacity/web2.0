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
import { FileManagementStatusProvider, FileManagementStatus } from "./context";

function App() {
  const status = React.useContext(FileManagementStatus)
  let logoutTimeout;

  React.useEffect(() => {
    const status = React.useContext(FileManagementStatus)

    if (status.isManaging === true) {
      clearTimeouts()
    }
  }, [React.useContext(FileManagementStatus)])

  const logout = () => {
    const status = React.useContext(FileManagementStatus)
    if(status.isManaging === true) { return }
    console.log('You have been loged out');
    localStorage.clear();
    history.push('/');
  }

  const setTimeouts = () => {
    logoutTimeout = setTimeout(logout, 1000 * 60 * 30);
  };

  const clearTimeouts = () => {
    if (logoutTimeout) clearTimeout(logoutTimeout);
  };

  React.useEffect(() => {
    const events = [
      'load',
      'mousemove',
      'mousedown',
      'click',
      'scroll',
      'keypress'
    ];

    const resetTimeout = () => {
      clearTimeouts();
      setTimeouts();
    };

    for (let i in events) {
      window.addEventListener(events[i], resetTimeout);
    }

    setTimeouts();
    return () => {
      for(let i in events){
        window.removeEventListener(events[i], resetTimeout);
        clearTimeouts();
      }
    }
  },[]);

  return (
    <FileManagementStatusProvider >
      <Router history={history}>
        <Switch>
          <Route exact path='/' component={LandingPage} />
          <Route exact path='/platform' component={PlatformPage} />
          <Route exact path='/plans' component={PlansPage} />
          <Route exact path='/community' component={CommunityPage} />
          <PrivateRoute exact path='/file-manager' component={FileManagePage}
          />
          <PrivateRoute exact path='/file-manager/:folderName' component={FileManagePage} />
          <Route exact path='/forgot' component={ForgotPage} />
        </Switch>
      </Router>
    </FileManagementStatusProvider>
  );
}
ReactDOM.render(<App />, document.getElementById("root"));
