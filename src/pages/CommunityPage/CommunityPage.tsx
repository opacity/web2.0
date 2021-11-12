import * as React from "react";
import { Link } from "react-router-dom";
import { NavLink } from "tabler-react";
import { Row, Col, Container, Button } from "react-bootstrap";
import SiteWrapper from "../../SiteWrapper";
import { OPACITY_DRIVE_FOR_MAC, OPACITY_DRIVE_FOR_WINDOWS, OPACITY_GO_FOR_ANDROID, OPACITY_GO_FOR_IPHONE, IS_DEV } from "../../config";
import "./CommunityPage.scss";

const visitIcon = require("../../assets/visit.png");
const storgeImage = require("../../assets/storage.png");
const opqImage = require("../../assets/imgopq.png");
const logo = require("../../assets/logo2.png");
const mobile_logo = require("../../assets/opacity-go-rocket.svg");
const android_log = require("../../assets/opacity_mobile_android.svg");
const winLogo = require("../../assets/win_log.svg");
const macLogo = require("../../assets/mac_log.svg");

const PlansPage = ({ history }) => {
  const [showLoginModal, setShowLoginModal] = React.useState(false);

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };
  const handleOpenLoginModal = () => {
    setShowLoginModal(true);
  };

  return (
    <SiteWrapper history={history} showLoginModal={showLoginModal} handleCloseLoginModal={handleCloseLoginModal}>
      <Container fluid="xl" className="community">
        <Row>
          <h1>Applications Powered by Opacity</h1>
          <h3> Expand your Opacity experience with these applications built on our platform.</h3>
        </Row>
        <Row className="site-items">
          <Col md={6}>
            <div className="site-item pb-0">
              <div className="d-flex">
                <img src={logo} width={108} height={108} />
                <span>
                  <p className="item-link">Opacity Drive for Desktop</p>
                  <p className="visit d-flex align-items-center">
                    <img src={winLogo} width={16} />
                    <NavLink href={OPACITY_DRIVE_FOR_WINDOWS} target="_blank">
                      Download Opacity Drive for Windows (Beta)
                    </NavLink>
                  </p>
                  <p className="visit d-flex align-items-center">
                    <img src={macLogo} width={16} />
                    <NavLink href={OPACITY_DRIVE_FOR_MAC} target="_blank">
                      Download Opacity Drive for Mac without M1 chip (Beta)
                    </NavLink>
                  </p>
                </span>
              </div>
              <h5 className="mt-4 content">
                This desktop application allows you to interact with your Opacity account from your local system. It supports all features
                and even offers you the possibility to rename folders or move files/folders around.
              </h5>
            </div>
          </Col>

          <Col md={6}>
            <div className="site-item pb-0">
              <div className="d-flex">
                <img src={mobile_logo} width={108} height={108} />
                <span>
                  <p className="item-link">Opacity Go for Mobile</p>
                  <p className={`visit d-flex align-items-center ${!IS_DEV && "no-link"}`}>
                    <img src={android_log} width={16} />
                    {!IS_DEV ? (
                      "Coming Soon"
                    ) : (
                      <NavLink href={OPACITY_GO_FOR_ANDROID} target="_blank">
                        Download for Android on Play store
                      </NavLink>
                    )}
                  </p>

                  <p className={`visit d-flex align-items-center ${!IS_DEV && "no-link"}`}>
                    <img src={macLogo} width={16} />
                    {!IS_DEV ? (
                      "Coming Soon"
                    ) : (
                      <NavLink href={OPACITY_GO_FOR_IPHONE} target="_blank">
                        Download for iOS on Apple store
                      </NavLink>
                    )}
                  </p>
                </span>
              </div>
              <h5 className="mt-4 content">
                Our mobile experience is second to none. Opacity Go allows you to interact with your Opacity account when you are away from
                a computer. All our cutting edge privacy features stay with you to protect your files and photos while they sync
                automatically. And you can easily share privately with friends or publicly with social media in a snap!
              </h5>
            </div>
          </Col>

          <Col md={6} className="content-view">
            <div className="site-item pt-0">
              <h5 className="">
                This desktop application allows you to interact with your Opacity account from your local system. It supports all features
                and even offers you the possibility to rename folders or move files/folders around.
              </h5>
            </div>
          </Col>

          <Col md={6} className="content-view">
            <div className="site-item pt-0">
              <h5 className="">
                Our mobile experience is second to none. Opacity Go allows you to interact with your Opacity account when you are away from
                a computer. All our cutting edge privacy features stay with you to protect your files and photos while they sync
                automatically. And you can easily share privately with friends or publicly with social media in a snap!
              </h5>
            </div>
          </Col>

          <Col md={6}>
            <div className="site-item">
              <div className="d-flex">
                <img src={storgeImage} />
                <span>
                  <p className="item-link">opacitystora.ge</p>
                  <p className="visit d-flex align-items-center">
                    <img src={visitIcon} width={15} />
                    <NavLink href="https://opacitystora.ge/" target="_blank">
                      Visit
                    </NavLink>
                  </p>
                </span>
              </div>

              <h5 className="mt-4">
                Opacitystora.ge allows you to easily shorten shared links (aka handles) from the Opacity Storage web services.
              </h5>
            </div>
          </Col>

          <Col md={6}>
            <div className="site-item pb-0">
              <div className="d-flex">
                <img src={opqImage} width={108} height={108} />
                <span>
                  <p className="item-link">imgopct.com</p>
                  <p className="visit d-flex align-items-center">
                    <img src={visitIcon} width={15} />
                    <NavLink href="https://imgopct.com/" target="_blank">
                      Visit
                    </NavLink>
                  </p>
                </span>
              </div>
              <h5 className="mt-4">
                imgOPCT is a public imageboard platform to share your images uploaded on Opacity. It's hosted for the community by the
                community. You can upload images and share them with the public on the front page.
              </h5>
            </div>
          </Col>
        </Row>
        <Row>
          <h1>Developers: Build Your App on Opacity</h1>
          <h3>
            The Opacity API is provided for developers to build and integrate solutions with the Opacity Storage platform. Opacity’s
            developer platform is a core part of our mission to empower developers to grow and monetize their services using the OPCT token.
          </h3>
          {/* <h2 className="text-center"> */}
          <a href="https://api.opacity.io:3000/swagger/index.html" target="_blank" className="developers-link">
            API for Developers
          </a>
          {/* </h2> */}
        </Row>
      </Container>

      <Container className="manage">
        <Row className="justify-content-md-center">
          <Col md="12" className="text-center">
            <h1 className="page1-title">Take Privacy Back Into Your Hands</h1>
            <div className="btn-groups">
              <Link to="/plans" style={{ textDecoration: "none" }}>
                <Button variant="warning btn-pill mr-md-3">Explore Plans</Button>
              </Link>
              <Button variant="outline-primary btn-pill" onClick={handleOpenLoginModal}>
                Log in
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </SiteWrapper>
  );
};

export default PlansPage;
