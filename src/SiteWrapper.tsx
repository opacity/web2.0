// @flow

import * as React from "react";
import { ReactElement, ReactNode } from "react";
import { NavLink, withRouter } from "react-router-dom";
import { Site, Nav, Grid, List, Button, RouterContextProvider } from "tabler-react";
import AOS from "aos";
import type { NotificationProps } from "tabler-react";
import { Navbar, NavDropdown } from "react-bootstrap";
import Footer from "./components/footer/footer";
import LoginModal from "./components/LoginModal/LoginModal";
import SignUpModal from "./components/SignUpModal/SignUpModal";
import "aos/dist/aos.css";
import { PlanType } from "./config";
import GoogleTagManager from "./components/GoogleTagManager/GoogleTagManager";

AOS.init({
  once: true,
  anchorPlacement: "center-bottom",
  offset: 200,
  delay: 50,
  duration: 700,
});
const logo = require("./assets/logo.svg");
type Props = {
  children: ReactNode;
  showSignUpModal?: boolean;
  handleCloseSignUpModal?: Function;
  showLoginModal?: boolean;
  handleCloseLoginModal?: Function;
  isHome?: boolean;
  history?: any;
  plan?: PlanType;
  recoveryHandle?: string;
};

type State = {
  notificationsObjects?: Array<typeof NotificationProps>;
  showMobileMenu: boolean;
  showLoginModal: boolean;
  showSignUpModal: boolean;
};

class SiteWrapper extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      showMobileMenu: false,
      showLoginModal: false,
      showSignUpModal: false,
    };
  }
  SetMobileMenu() {
    this.setState({ showMobileMenu: !this.state.showMobileMenu });
  }
  handleCloseLoginModal() {
    this.setState({ showLoginModal: false });
  }
  handleCloseSignUpModal() {
    this.setState({ showSignUpModal: false });
  }
  handleOpenSignUpModal() {
    this.setState({ showSignUpModal: true });
  }
  handleOpenLoginModal() {
    this.setState({ showLoginModal: true });
  }

  render(): ReactElement {
    const loggedIn = localStorage.getItem("key") ? true : false;
    return (
      <div className="page">
        <GoogleTagManager gtmId={"GTM-WBG5C67"} />
        <header
          className={
            this.props.isHome
              ? "navbar navbar-expand-md navbar-light d-print-none "
              : "navbar navbar-expand-md navbar-light d-print-none border-bottom"
          }
        >
          <div className="container-xl">
            <h1 className="navbar-brand navbar-brand-autodark d-none-navbar-horizontal pe-0 pe-md-3 mb-0">
              <NavLink to="/" className="logo-wrapper">
                <img src={logo} width="60" height="60" alt="Opacity" className="navbar-brand-image" />
                <span className="ml-3">OPACITY</span>
              </NavLink>
            </h1>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbar-menu"
              aria-expanded={this.state.showMobileMenu}
              onClick={this.SetMobileMenu.bind(this)}
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbar-menu">
              <div className="d-flex flex-column flex-md-row flex-fill align-items-stretch align-items-md-center justify-content-end">
                <ul className="navbar-nav">
                  <li className="nav-item">
                    <NavLink to="/platform" className="nav-link">
                      Why Opacity?
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/downloads" className="nav-link">
                      Downloads
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/about" className="nav-link">
                      About
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <Nav.Link href="https://blog.opacity.io/" target="_blank">
                      Blog
                    </Nav.Link>
                  </li>
                  <li className="nav-item">
                    <Nav.Link href="https://help.opacity.io" target="_blank">
                      Help Center
                    </Nav.Link>
                  </li>
                  <li className="nav-item">
                    {loggedIn ? (
                      <div className="nav-link">
                        <Button
                          className="btn btn-primary"
                          onClick={() => {
                            this.props.history.push("/file-manager");
                          }}
                        >
                          Dashboard
                        </Button>
                      </div>
                    ) : (
                      <div className="nav-link">
                        <Button
                          className="btn btn-white btn-pill"
                          onClick={() => {
                            this.props.history.push("/plans");
                          }}
                        >
                          Explore Plans
                        </Button>
                      </div>
                    )}
                  </li>
                  <li className="nav-item">
                    {loggedIn ? (
                      <div className="">
                        <Button
                          className="btn btn-primary"
                          onClick={() => {
                            localStorage.clear();
                            this.props.history.push("/");
                          }}
                        >
                          Logout
                        </Button>
                      </div>
                    ) : (
                      <div className="">
                        <Button
                          className="btn btn-primary btn-pill"
                          onClick={() => {
                            this.setState({ showLoginModal: true });
                          }}
                        >
                          Log in
                        </Button>
                      </div>
                    )}
                  </li>
                </ul>
              </div>
            </div>
            {this.state.showMobileMenu && (
              <div className="mobile-menu">
                <div className="d-flex flex-column flex-md-row flex-fill align-items-stretch align-items-md-center justify-content-center">
                  <ul className="navbar-nav">
                    <li className="nav-item">
                      <NavLink to="/platform" className="nav-link">
                        Why Opacity?
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/downloads" className="nav-link">
                        Downloads
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/about" className="nav-link">
                        About
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <Nav.Link href="https://blog.opacity.io" target="_blank">
                        Blog
                      </Nav.Link>
                    </li>
                    <li className="nav-item">
                      <Nav.Link href="https://help.opacity.io" target="_blank">
                        Help Center
                      </Nav.Link>
                    </li>

                    {loggedIn ? (
                      <>
                        <li className="nav-item">
                          <NavLink to="/file-manager" className="nav-link">
                            Dashboard
                          </NavLink>
                        </li>
                        <li
                          className="nav-item"
                          onClick={() => {
                            localStorage.clear();
                            this.props.history.push("/");
                          }}
                        >
                          <Nav.Link>Logout</Nav.Link>
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="nav-item">
                          <Nav.Link href="/plans">Explore Plans</Nav.Link>
                        </li>
                        <li
                          className="nav-item"
                          onClick={() => {
                            this.setState({ showLoginModal: true });
                          }}
                        >
                          <Nav.Link>Log in</Nav.Link>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </header>
        {this.props.children}
        <Footer />
        <LoginModal
          show={this.state.showLoginModal || this.props.showLoginModal}
          recoveryHandle={this.props.recoveryHandle}
          handleSignup={() => {
            this.setState({ showSignUpModal: true });
          }}
          handleClose={() => {
            this.handleCloseLoginModal();
            this.props.handleCloseLoginModal && this.props.handleCloseLoginModal();
          }}
        />
        {(this.state.showSignUpModal || this.props.showSignUpModal) && (
          <SignUpModal
            show={this.state.showSignUpModal || this.props.showSignUpModal}
            handleClose={() => {
              this.setState({ showSignUpModal: false });
              this.props.handleCloseSignUpModal && this.props.handleCloseSignUpModal();
            }}
            initialPlan={this.props.plan}
            openLoginModal={this.handleOpenLoginModal.bind(this)}
          />
        )}
      </div>
    );
  }
}

export default SiteWrapper;
