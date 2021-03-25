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
  history: any;
  plan?: PlanType;
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
    return (
      <div className='page'>
        <header
          className={
            this.props.isHome
              ? "navbar navbar-expand-md navbar-light d-print-none "
              : "navbar navbar-expand-md navbar-light d-print-none border-bottom"
          }
        >
          <div className='container-xl'>
            <h1 className='navbar-brand navbar-brand-autodark d-none-navbar-horizontal pe-0 pe-md-3 mb-0'>
              <a href='/' className='logo-wrapper'>
                <img src={logo} width='60' height='60' alt='Opacity' className='navbar-brand-image' />
                <span className='ml-3'>OPACITY</span>
              </a>
            </h1>
            <button
              className='navbar-toggler'
              type='button'
              data-bs-toggle='collapse'
              data-bs-target='#navbar-menu'
              aria-expanded={this.state.showMobileMenu}
              onClick={this.SetMobileMenu.bind(this)}
            >
              <span className='navbar-toggler-icon'></span>
            </button>

            <div className='collapse navbar-collapse' id='navbar-menu'>
              <div className='d-flex flex-column flex-md-row flex-fill align-items-stretch align-items-md-center justify-content-end'>
                <ul className='navbar-nav'>
                  <li className='nav-item'>
                    <Nav.Link href='/platform'>Why Opacity?</Nav.Link>
                  </li>
                  <li className='nav-item'>
                    <Nav.Link href='/community'>App Gallery </Nav.Link>
                  </li>
                  <li className='nav-item'>
                    <Nav.Link href='/blog'>Learn</Nav.Link>
                  </li>
                  <li className='nav-item'>
                    <div className='nav-link'>
                      <Button
                        className='btn btn-white btn-pill'
                        onClick={() => {
                          this.props.history.push("/plans");
                        }}
                      >
                        Explore Plans
                      </Button>
                    </div>
                  </li>
                  <li className='nav-item'>
                    <div className=''>
                      <Button
                        className='btn btn-primary btn-pill'
                        onClick={() => {
                          this.setState({ showLoginModal: true });
                        }}
                      >
                        Log in
                      </Button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            {this.state.showMobileMenu && (
              <div className='mobile-menu'>
                <div className='d-flex flex-column flex-md-row flex-fill align-items-stretch align-items-md-center justify-content-center'>
                  <ul className='navbar-nav'>
                    <li className='nav-item'>
                      <Nav.Link href='/platform'>Why Opacity?</Nav.Link>
                    </li>
                    <li className='nav-item'>
                      <Nav.Link href='/community'>App Gallery </Nav.Link>
                    </li>
                    <li className='nav-item'>
                      <Nav.Link href='/blog'>Learn</Nav.Link>
                    </li>
                    <li className='nav-item'>
                      <Nav.Link href='/plans'>Explore Plans</Nav.Link>
                    </li>
                    <li
                      className='nav-item'
                      onClick={() => {
                        this.setState({ showLoginModal: true });
                      }}
                    >
                      <Nav.Link>Log in</Nav.Link>
                    </li>
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
          handleClose={() => {
            this.handleCloseLoginModal();
            this.props.handleCloseLoginModal && this.props.handleCloseLoginModal();
          }}
        />
        <SignUpModal
          show={this.props.showSignUpModal}
          handleClose={this.props.handleCloseSignUpModal}
          plan={this.props.plan}
          openLoginModal={this.handleOpenLoginModal.bind(this)}
        />
      </div>
    );
  }
}

export default SiteWrapper;
