import * as React from "react";
import { NavLink } from "tabler-react";
import { Row, Col, Container } from "react-bootstrap";
import SiteWrapper from "../../SiteWrapper";
import "./CommunityPage.scss";

const visitIcon = require("../../assets/visit.png");
const storgeImage = require("../../assets/storage.png");
// const gitImage = require("../../assets/github.png");
const opqImage = require("../../assets/imgopq.png");
// const olelog = require("../../assets/OcelotLogo.png");
const logo = require("../../assets/logo2.png");
const winLogo = require("../../assets/win_log.svg");
const macLogo = require("../../assets/mac_log.svg");


const PlansPage = ({ history }) => {
  return (
    <SiteWrapper history={history}>
      <Container fluid="xl community">
        <Row>
          <h1>Applications Powered by Opacity</h1>
          <h3>
            {" "}
            Expand your Opacity experience with these applications built on our
            platform.
          </h3>
        </Row>
        <Row className="site-items">
          <Col md={6}>
            <div className="site-item">
              <div className="d-flex">
                <img src={logo} width={108} height={108} />
                <span>
                  <p className="item-link">Opacity Drive for Desktop</p>
                  <p className="visit d-flex align-items-center">
                    <img src={winLogo} width={16} />
                    <NavLink href="https://opacity-public.s3.us-east-2.amazonaws.com/Opacity-Desktop.exe" target="_blank">
                      Download Opacity Drive for Windows (Beta)
                    </NavLink>
                  </p>
                  <p className="visit d-flex align-items-center">
                    <img src={macLogo} width={16} />
                    <NavLink href="https://opacity-public.s3.us-east-2.amazonaws.com/Opacity-Desktop.dmg" target="_blank">
                      Download Opacity Drive for Mac without M1 chip (Beta)
                    </NavLink>
                  </p>
                </span>
              </div>

              <h5 className="mt-4">
              This desktop application allows you to interact with your Opacity account from your local system. It supports all features and even offers you the possibility to rename folders or move files/folders around.
              </h5>
            </div>
          </Col>

          <Col md={6}>
            <div className="site-item">
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
                imgOPCT is a public imageboard platform to share your images
                uploaded on Opacity. It's hosted for the community by the
                community. You can upload images and share them with the public
                on the front page.
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
                Opacitystora.ge allows you to easily shorten shared links (aka
                handles) from the Opacity Storage web services.
              </h5>
            </div>
          </Col>
        </Row>
        <Row>
          <h1>Developers: Build Your App on Opacity</h1>
          <h3>
            The Opacity API is provided for developers to build and integrate
            solutions with the Opacity Storage platform. Opacity’s developer
            platform is a core part of our mission to empower developers to grow
            and monetize their services using the OPCT token.
          </h3>
          <h2 className="text-center">
            <a
              href="https://api.opacity.io:3000/swagger/index.html"
              target="_blank"
            >
              API for Developers
            </a>
          </h2>
        </Row>
      </Container>
    </SiteWrapper>
  );
};

export default PlansPage;
