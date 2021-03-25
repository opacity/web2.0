import * as React from "react";
import { NavLink } from "tabler-react";
import { Row, Col, Container, Media, Button, Carousel, CarouselItem } from "react-bootstrap";
import SiteWrapper from "../../SiteWrapper";
import "./CommunityPage.scss";
const storgeImage = require("../../assets/storage.png");
const gitImage = require("../../assets/github.png");
const opqImage = require("../../assets/imgopq.png");
const olelog = require("../../assets/OcelotLogo.png");
const logo = require("../../assets/logo2.png");
const PlansPage = ({ history }) => {
  return (
    <SiteWrapper history={history}>
      <Container fluid='xl community'>
        <Row>
          <h1>Applications Powered by Opacity</h1>
          <h3> Expand your Opacity experience with these applications built on our platform.</h3>
        </Row>
        <Row className='site-items'>
          <Col md={6}>
            <div className='site-item'>
              <div className='d-flex'>
                <img src={storgeImage} />
                <span>
                  <p className='item-link'>opacitystora.ge</p>
                  <p>Developer</p>
                  <p className='download'>Link to Download</p>
                </span>
              </div>

              <h4>Description</h4>
              <h5>Opacitystora.ge allows you to easily shorten shared links (aka handles) from the Opacity Storage web services.</h5>
            </div>
          </Col>
          <Col md={6}>
            <div className='site-item'>
              <div className='d-flex'>
                <img src={opqImage} />
                <span>
                  <p className='item-link'>imgopq.com</p>
                  <p>Developer</p>
                  <p className='download'>Link to Download</p>
                </span>
              </div>

              <h4>Description</h4>
              <h5>
                imgOPCT is a public imageboard platform to share your images uploaded on Opacity. It's hosted for the community by the community. You
                can upload images and share them with the public on the front page.
              </h5>
            </div>
          </Col>
          <Col md={6}>
            <div className='site-item'>
              <div className='d-flex'>
                <img src={olelog} />
                <span>
                  <p className='item-link'>OCELOT</p>
                  <p>Developer</p>
                  <p className='download'>Link to Download</p>
                </span>
              </div>

              <h4>Description</h4>
              <h5>
                Ocelot is a cross-platform, containerized web application client for the Opacity Storage service run from your local machine. Ocelot
                can be used to store and manage multiple Opacity accounts; sync files and folders between Opacity and one or more of your devices;
                provide sync status per file; search and filter your files easily; and much more!
              </h5>
            </div>
          </Col>
          <Col md={6}>
            <div className='site-item'>
              <div className='d-flex'>
                <img src={logo} />
                <span>
                  <p className='item-link'>Opacity Desktop Application</p>
                  <p>Developer</p>
                  <p className='download'>Link to Download</p>
                </span>
              </div>

              <h4>Description</h4>
              <h5>
                This Windows desktop application allows you to interact with your Opacity account. It supports all features and even offers you the
                possibility to rename folders or move files/folders around.
              </h5>
            </div>
          </Col>
        </Row>
        <Row>
          <h1>Developers: Build Your App on Opacity</h1>
          <h3>
            The Opacity API is provided for developers to build and integrate solutions with the Opacity Storage platform. Opacity’s developer
            platform is a core part of our mission to empower developers to grow and monetize their services using the OPCT token.
          </h3>
        </Row>
      </Container>
    </SiteWrapper>
  );
};

export default PlansPage;
