import * as React from "react";
import * as ReactDOM from "react-dom";
import { lazy, Suspense }  from "react";
import { Router, Route, Switch, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
const LandingPage = lazy(() => import("./pages/LandingPage/LandingPage"));
const PlatformPage = lazy(() => import("./pages/PlatformPage/PlatformPage"));
const PlansPage = lazy(() => import("./pages/PlansPage/PlansPage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage/CommunityPage"));
const FileManagePage = lazy(() => import("./pages/FileManagePage/FileManagePage"));
const OldAccountFileManage = lazy(() => import("./pages/FileManagePage/OldAccountFileManage"));
const ForgotPage = lazy(() => import("./pages/ForgotPage/ForgotPage"));
const SharePage = lazy(() => import("./pages/SharePage/SharePage"));
const LegalPage = lazy(() => import("./pages/LegalPages/LegalPage"));
const MigrationPage = lazy(() => import("./pages/MigrationPage/MigrationPage"));
const Page404 = lazy(() => import("./pages/404/404Page"));
const PressPage = lazy(() => import("./pages/PressPage/PressPage"));
import { PrivateRoute } from "./PrivateRoute";
import "./index.scss";
import "react-toastify/dist/ReactToastify.css";
import { FileManagementStatusProvider, FileManagementStatus } from "./context";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { VERSION, IS_LOCAL, DEFAULT_STORAGE_NODE_IP } from "./config";
import AboutPage from "./pages/AboutPage/AboutPage";
import WarningWrapper from "./components/WarningWrapper/WarningWrapper";
import { createBrowserHistory } from "history";
const history = createBrowserHistory();
import { isSafari } from "react-device-detect";

let sentryOptions = {
  dsn: "https://8fdbdab452f04a43b5c3f2e00ec126f7@sentry.io/295597",
  release: VERSION,
  environment: process.env.STORAGE_NODE_VERSION,
  integrations: [
    new Integrations.BrowserTracing({
      routingInstrumentation: Sentry.reactRouterV5Instrumentation(history),
      tracingOrigins: [DEFAULT_STORAGE_NODE_IP],
    }),
  ],
  tracesSampleRate: 0.3,
};

if (IS_LOCAL == false) {
  Sentry.init(sentryOptions);
}

const renderLoader = () => <p>Loading</p>;

function App() {
  return (
    <>
      <Helmet>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {isSafari ?
        <meta http-equiv="Content-Security-Policy" content="child-src 'self'" /> 
        :
        <meta http-equiv="Content-Security-Policy" content="worker-src 'self'" />
        }
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        <meta
          name="description"
          content="Opacity provides encrypted cloud storage that never stores your personal data. Powered by OPCT crypto token."
        />
        <meta name="googlebot" content="index,follow,snippet,archive" />
        <meta name="robots" content="all,index,follow" />
        <meta name="author" content="opacity.io" />
        <meta name="copyright" content="2021 opacity.io" />
        <title>Private Cloud Storage and File Sharing | Opacity</title>
        <meta itemProp="name" content="Opacity Storage" />
        <meta
          itemProp="description"
          content="Opacity provides encrypted cloud storage that never stores your personal data. Powered by OPCT crypto token."
        />
        <meta itemProp="image" content="assets/logo.svg" />
        <meta property="og:url" content="https://opacity.io" />
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

      <FileManagementStatusProvider>
        <WarningWrapper>
          <Suspense fallback={renderLoader}>
            <Router history={history}>
              <Switch>
                <Route exact path="/" component={LandingPage} />
                <Route exact path="/platform" component={PlatformPage} />
                <Route exact path="/plans" component={PlansPage} />
                <Route exact path="/downloads" component={CommunityPage} />
                <Route path="/terms-of-service" render={() => <LegalPage title="Terms Of Service" type="terms-of-service" />} />
                <Route path="/privacy-policy" render={() => <LegalPage title="Privacy Policy" type="privacy-policy" />} />
                <Route path="/code-review-license" render={() => <LegalPage title="Code Review License" type="code-review-license" />} />
                <PrivateRoute exact path="/file-manager" component={FileManagePage} />
                <PrivateRoute exact path="/file-manager/:folderName" component={FileManagePage} />
                <Route exact path="/forgot" component={ForgotPage} />
                <Route path="/share" component={SharePage} />
                <Route path="/migration" component={MigrationPage} />
                <Route path="/about" component={AboutPage} />
                <Route path="/press" component={PressPage} />
                <PrivateRoute path="/migration-download" isOldRoute={true} component={OldAccountFileManage} />

                <Route path="*" component={Page404} />
              </Switch>
            </Router>
          </Suspense>
        </WarningWrapper>
      </FileManagementStatusProvider>
    </>
  );
}
ReactDOM.render(<App />, document.getElementById("root"));
