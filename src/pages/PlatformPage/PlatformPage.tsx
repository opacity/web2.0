import * as React from "react";
import { NavLink } from "tabler-react";
import { Row, Col, Container, Media, Button } from "react-bootstrap";
import SiteWrapper from "../../SiteWrapper";
import { Link } from "react-router-dom";
import "./PlatformPage.scss";

const fullControl = require("../../assets/full-control.png");
const handle = require("../../assets/handle-access.png");
const encryptt = require("../../assets/encrypt.png");
const lastpass = require("../../assets/lastpass.png");
const password = require("../../assets/password.png");
const keepass = require("../../assets/keepass.png");
const ourcode = require("../../assets/our-code.png");
const whitepapper = require("../../assets/whitepapper.png");
const leftPaperURLs = [
  {
    language: "中文 🇨🇳 ",
    link: "https://opacitystora.ge/GalaxyWhitepaperV1Chinese",
  },
  {
    language: "Deutsch 🇩🇪 ",
    link: "https://opacitystora.ge/GalaxyWhitepaperV1German",
  },
];

const rightPaperURLs = [
  {
    language: "한국어 🇰🇷 ",
    link: "https://opacitystora.ge/GalaxyWhitepaperV1Korean",
  },
  {
    language: "Pусский 🇷🇺 ",
    link: "https://opacitystora.ge/GalaxyWhitepaperV1Russian",
  },
];

const PlatformPage = ({ history }) => {
  const [showLoginModal, setShowLoginModal] = React.useState(false);

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };
  const handleOpenLoginModal = () => {
    setShowLoginModal(true);
  };

  return (
    <SiteWrapper history={history} showLoginModal={showLoginModal} handleCloseLoginModal={handleCloseLoginModal}>
      <Container fluid="xl" className="mt-5">
        <Row className="justify-content-md-center">
          <Col md="8" className="text-center">
            <h1 className="page1-title mb-3">Your Private Cloud Solution</h1>
            <h3 className="page1-description mb-5">
              Unlike other cloud storage providers, Opacity relies on client-side encryption to ensure that you, and only you, have access
              to your files. Our service has zero knowledge regarding your account activity and usage.
            </h3>
            <img src={fullControl} />
          </Col>
        </Row>
        <Row className="mt-md-5 mb-md-5">
          <Col md="5" className="pr-md-5">
            <img src={handle} />
          </Col>
          <Col md="7" className="pl-md-5">
            <h1 className="page1-title">One Handle To Access Your Account.</h1>
            <h3 className="page1-description">
              When you sign up with Opacity, a unique Account Handle is created just for you. This Handle is all that is required to access
              your storage account. By default, you are the only person with this information, so it is important that you record your
              Account Handle to avoid trouble accessing your account. Keep it safe!
            </h3>
          </Col>
        </Row>
        <Row className="mt-md-5 mb-md-5">
          <Col md="7" className="pr-md-5">
            <h1 className="page1-title">Encrypted At Rest. Share Only What You Want.</h1>
            <h3 className="page1-description">
              The key to unlocking your files is generated client-side - not even Opacity can access your files! When you want to share a
              file with a friend, you can easily generate a shareable link with a single button click. Only people with that link can access
              your file, giving you granular control over who has access to your data.
            </h3>
          </Col>
          <Col md="5" className="pl-md-5">
            <img src={encryptt} />
          </Col>
        </Row>
        <Row className="justify-content-md-center">
          <Col md="7" className="text-center">
            <h1 className="page1-title">Enhance the Opacity Experience </h1>
            <h3 className="page1-description-small mb-5">
              <p>
                We understand the need for privacy. That’s why our architecture ensures only you control access to your personal data. This
                level of account privacy means that Opacity does not retain any record of your account information, including the Account
                Handle created to access your account.
              </p>
              <p>
                To avoid any potential loss of access, we recommend using a password manager to safely store your Opacity credentials. In
                addition, these other applications will help improve your experience:
              </p>
            </h3>
          </Col>
        </Row>
        <Row className="justify-content-md-center mb-md-5">
          <Col md="8" className="text-center">
            <Row className="justify-content-md-center">
              <Col md="4">
                <div className="card-item">
                  <img src={lastpass} />
                  <span className="card1-title">
                    <a href="https://bitwarden.com/" target="_blank" style={{ textDecoration: "none" }}>
                      Bitwarden
                    </a>
                  </span>
                  <p>Password manager with end to end encryption to help keep your Opacity account handle safe</p>
                </div>
              </Col>
              <Col md="4">
                <div className="card-item">
                  <img src={password} />
                  <span className="card1-title">
                    <a href="https://metamask.io/" target="_blank" style={{ textDecoration: "none" }}>
                      Metamask
                    </a>
                  </span>
                  <p>In browser digital wallet to help pay for your account and store your crypto</p>
                </div>
              </Col>
              <Col md="4">
                <div className="card-item">
                  <img src={keepass} />
                  <span className="card1-title">
                    <a href="https://www.torproject.org/" target="_blank" style={{ textDecoration: "none" }}>
                      Tor Browser
                    </a>
                  </span>
                  <p>Defend yourself. Protect yourself against tracking, surveillance, and censorship.</p>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="justify-content-md-center mt-md-5">
          <Col md="12" className="text-center mb-md-4">
            <h1 className="page1-title">Transparent Code Base</h1>
          </Col>
          <Col md="6" className="pr-md-3">
            <Media>
              <img className="align-self-center mr-md-3" src={ourcode} />
              <Media.Body>
                <p>
                  Wondering how things work? Take a peek under the hood! All of Opacity’s codebase is source available for anyone wondering
                  how our system works.
                </p>
                <NavLink href="https://github.com/opacity" target="_blank">
                  Explore our code
                </NavLink>
              </Media.Body>
            </Media>
          </Col>
          <Col md="6" className="pl-md-3">
            <Media>
              <img className="align-self-center mr-md-3" src={whitepapper} />
              <Media.Body>
                <p>
                  Want an overview of Opacity, its current architecture, and where we want to go in the future? Check out the Opacity
                  Whitepaper!
                </p>
                <p>The Opacity Whitepaper is now available in these languages:</p>
                <div className="language-wrapper">
                  <div className="language-panel">
                    {leftPaperURLs.map(({ language, link }, idx) => (
                      <div key={idx}>
                        <a href={link} target="_blank">
                          {language}
                        </a>
                        <br />
                      </div>
                    ))}
                  </div>
                  <div className="language-panel">
                    {rightPaperURLs.map(({ language, link }, idx) => (
                      <div key={idx}>
                        <a href={link} target="_blank">
                          {language}
                        </a>
                        <br />
                      </div>
                    ))}
                  </div>

                  <div className="language-panel">
                    <a href="https://opacitystora.ge/GalaxyWhitepaperV1Portuguese" target="_blank">
                      Português 🇧🇷
                    </a>
                    <br />
                  </div>
                </div>
                <NavLink href="https://opacitystora.ge/GalaxyWhitepaperV1" target="_blank">
                  Download Whitepaper
                </NavLink>
              </Media.Body>
            </Media>
          </Col>
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

export default PlatformPage;
