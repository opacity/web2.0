// @flow

import * as React from "react";
import { ReactNode } from "react";
import { NavLink, withRouter } from "react-router-dom";

import { Site, Nav, Grid, List, Button, RouterContextProvider } from "tabler-react";

import type { NotificationProps } from "tabler-react";
import { Navbar, NavDropdown } from "react-bootstrap";
import Footer from "./components/footer/footer";
const logo = require("./assets/logo.svg");
type Props = {
  children: ReactNode;
};

type State = {
  notificationsObjects?: Array<typeof NotificationProps>;
  showMobileMenu: boolean;
};

class SiteWrapper extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      showMobileMenu: false,
    };
  }
  SetMobileMenu() {
    this.setState({ showMobileMenu: !this.state.showMobileMenu });
  }
  render(): ReactNode {
    return (
      <div className="page">
        <header className="navbar navbar-expand-md navbar-light d-print-none">
          <div className="container-xl">
            <h1 className="navbar-brand navbar-brand-autodark d-none-navbar-horizontal pe-0 pe-md-3 mb-0">
              <a href="/" className="logo-wrapper">
                <img src={logo} width="60" height="60" alt="Opacity" className="navbar-brand-image" />
                <span className="ml-3">OPACITY</span>
              </a>
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
              <div className="d-flex flex-column flex-md-row flex-fill align-items-stretch align-items-md-center justify-content-center">
                <ul className="navbar-nav">
                  <li className="nav-item">
                    <Nav.Link href="/platform">The Platform</Nav.Link>
                  </li>
                  <li className="nav-item">
                    <Nav.Link href="/community">Community</Nav.Link>
                  </li>
                  <li className="nav-item">
                    <Nav.Link href="/blog">Blog</Nav.Link>
                  </li>
                  <li className="nav-item">
                    <div className="nav-link">
                      <Button className="btn btn-white btn-pill" href="/plans">
                        Explore Plans
                      </Button>
                    </div>
                  </li>
                  <li className="nav-item">
                    <div className="">
                      <Button className="btn btn-primary btn-pill" href="/plans">
                        Log in
                      </Button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            {this.state.showMobileMenu && (
              <div className="mobile-menu">
                <div className="d-flex flex-column flex-md-row flex-fill align-items-stretch align-items-md-center justify-content-center">
                  <ul className="navbar-nav">
                    <li className="nav-item">
                      <Nav.Link href="/platform">The Platform</Nav.Link>
                    </li>
                    <li className="nav-item">
                      <Nav.Link href="/community">Community</Nav.Link>
                    </li>
                    <li className="nav-item">
                      <Nav.Link href="/blog">Blog</Nav.Link>
                    </li>
                    <li className="nav-item">
                      <Nav.Link href="/plans">Explore Plans</Nav.Link>
                    </li>
                    <li className="nav-item">
                      <Nav.Link href="/login">Log in</Nav.Link>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </header>
        {this.props.children}
        <Footer />
      </div>
    );
  }
}

export default SiteWrapper;
