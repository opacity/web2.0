import * as React from "react";
import * as ReactDOM from "react-dom";
import { Router, Route, Switch, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Application } from "./components/application/Application";
import LandingPage from "./pages/LandingPage/LandingPage";
import PlatformPage from "./pages/PlatformPage/PlatformPage";
import PlansPage from "./pages/PlansPage/PlansPage";
import CommunityPage from "./pages/CommunityPage/CommunityPage";
import FileManagePage from "./pages/FileManagePage/FileManagePage";
import ForgotPage from "./pages/ForgotPage/ForgotPage";
import SharePage from "./pages/SharePage/SharePage";
import LegalPage from "./pages/LegalPages/LegalPage";
import MigrationPage from "./pages/MigrationPage/MigrationPage";
import history from "./redux/history";
import { PrivateRoute } from "./PrivateRoute";
import "./index.scss";
import "react-toastify/dist/ReactToastify.css";
import { FileManagementStatusProvider, FileManagementStatus } from "./context";
import { Provider } from "react-redux";
import { store, persistor } from "./redux";
import { PersistGate } from "redux-persist/lib/integration/react";

function App() {
  const status = React.useContext(FileManagementStatus);
  let logoutTimeout;

  React.useEffect(() => {
    if (status.isManaging === true) {
      clearTimeouts();
    }
  }, [status]);

  const logout = () => {
    if (status.isManaging === true) {
      return;
    }
    console.log("You have been loged out");
    localStorage.clear();
    history.push("/");
  };

  const setTimeouts = () => {
    logoutTimeout = setTimeout(logout, 1000 * 60 * 30);
  };

  const clearTimeouts = () => {
    if (logoutTimeout) clearTimeout(logoutTimeout);
  };

  React.useEffect(() => {
    const events = [
      "load",
      "mousemove",
      "mousedown",
      "click",
      "scroll",
      "keypress",
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
      for (let i in events) {
        window.removeEventListener(events[i], resetTimeout);
        clearTimeouts();
      }
    };
  }, []);

  return (
    <>
      <Helmet>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        <meta
          http-equiv="Content-Security-Policy"
          content="worker-src 'self'"
        />
        <meta
          name="description"
          content="Opacity provides encrypted cloud storage that never stores your personal data. Powered by OPCT crypto token."
        />
        <meta name="googlebot" content="index,follow,snippet,archive" />
        <meta name="robots" content="all,index,follow" />
        <meta name="author" content="opacity.io" />
        <meta name="copyright" content="2019 opacity.io" />
        <title>Private Cloud Storage and File Sharing | Opacity</title>
        <meta itemprop="name" content="Opacity Storage" />
        <meta
          itemprop="description"
          content="Opacity provides encrypted cloud storage that never stores your personal data. Powered by OPCT crypto token."
        />
        <meta itemprop="image" content="assets/logo.svg" />
        <meta property="og:url" content="https://dev2.opacity.io" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Opacity Storage" />
        <meta
          property="og:description"
          content="Opacity provides encrypted cloud storage that never stores your personal data. Powered by OPCT crypto token."
        />
        <meta property="og:image" content="assets/logo.svg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Opacity Storage" />
        <meta
          name="twitter:description"
          content="Opacity provides encrypted cloud storage that never stores your personal data. Powered by OPCT crypto token."
        />
        <meta name="twitter:image" content="assets/logo.svg" />
      </Helmet>

      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <FileManagementStatusProvider>
            <Router history={history}>
              <Switch>
                <Route exact path="/" component={LandingPage} />
                <Route exact path="/platform" component={PlatformPage} />
                <Route exact path="/plans" component={PlansPage} />
                <Route exact path="/downloads" component={CommunityPage} />
                <Route
                  path="/terms-of-service"
                  render={() => (
                    <LegalPage
                      title="Terms Of Service"
                      type="terms-of-service"
                    />
                  )}
                />
                <Route
                  path="/privacy-policy"
                  render={() => (
                    <LegalPage title="Privacy Policy" type="privacy-policy" />
                  )}
                />
                <Route
                  path="/code-review-license"
                  render={() => (
                    <LegalPage
                      title="Code Review License"
                      type="code-review-license"
                    />
                  )}
                />
                <PrivateRoute
                  exact
                  path="/file-manager"
                  component={FileManagePage}
                />
                <PrivateRoute
                  exact
                  path="/file-manager/:folderName"
                  component={FileManagePage}
                />
                <Route exact path="/forgot" component={ForgotPage} />
                <Route path="/share" component={SharePage} />
                <Route path="/migration" component={MigrationPage} />
              </Switch>
            </Router>
          </FileManagementStatusProvider>
        </PersistGate>
      </Provider>
    </>
  );
}
ReactDOM.render(<App />, document.getElementById("root"));
