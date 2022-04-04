import * as React from "react";
import { Button } from "react-bootstrap";
import SiteWrapper from "../../SiteWrapper";
import "./AboutPage.scss";

const team1 = require("../../assets/team1.jpg");
const linkedin = require("../../assets/linkedin.svg");

const AboutPage = ({ history }) => {
  return (
    <SiteWrapper history={history} isHome={true}>
      <div className="about">
        <div className="section hero">
          <div className="container-xl">
            <h1>Our mission is to bring privacy to cloud storage with an ease of use unparalleled in the blockchain industry</h1>
          </div>
        </div>

        <div className="section container-xl">
          <h1>Our Story</h1>
          <p>
            In 2018, Opacity began to provide online file storage and file sharing with a focus on privacy and an easy to use experience
            that is still unique in the blockchain industry. We recognized that with the rise of digital property, many people have
            increasingly become concerned with the security and privacy of materials stored with cloud storage companies such as Dropbox,
            Google, and others. Small businesses, individuals, and enterprises want to keep their data private.
          </p>
          <p>
            Opacity does not collect any personal information and has no access to your files. All files are encrypted on the client side
            and the decryption key never leaves the user's control. Opacity stores no information on its users, and allows people to store
            private information, such as company secrets, intellectual property, personal photographs, legal documents, and family moments,
            with assurance that personal data stays personal.
          </p>
          <p>
            In addition to establishing our own decentralized network, Opacity’s goal is to be a gateway to other decentralized storage
            providers. In this way, Opacity gives users choice and freedom to select the best features and capabilities for their needs
            while making it easy to select from the options available across the industry.
          </p>
          <p>
            Access to private storage and file sharing enables a new way to protect your important files. Storing and sharing files has
            limitless potential, covering a wide variety of areas:
            <ul className="mt-1">
              <li>Photos</li>

              <li>Videos</li>

              <li>Music</li>

              <li>Banking documents</li>

              <li>Legal documents</li>

              <li>File sharing with coworkers</li>

              <li>Enterprise cold storage</li>
            </ul>
            Files can be shared privately or publicly, you decide!
          </p>
        </div>

        <div className="section container-xl">
          <h1 className="mb-5">Our Team</h1>

          <div className="d-flex team-member">
            <div className="avatar-section">
              <img src={team1} />
            </div>
            <div className="profile">
              <h2>JASON COPPOLA, CEO </h2>

              <p>
                Jason co-founded Opacity in 2018. He’s led our growth from a simple idea to an established blockchain product that is easy
                to use and accessible to anyone. Jason has over 20 years experience in software product development. He has led
                organizations to build and deliver highly scalable applications at Fortune 100 and startup companies by applying his
                experience as an entrepreneur and Agile expert. Jason’s responsible for the direction and product strategy of our company.{" "}
              </p>

              <a href="https://www.linkedin.com/in/jasoncoppola">
                <img src={linkedin} className="mb-2" />
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        <div className="d-flex section cta container-xl">
          <div>
            <h2>
              <b>Privacy By Design</b>
              <br /> Free to share ideas. Free to be private. Free to be you.
            </h2>
          </div>

          <div className="explore">
            <Button variant="primary btn-pill mr-md-3" size="lg" onClick={() => history.push("/plans")}>
              Explore Plans
            </Button>
          </div>
        </div>
      </div>
    </SiteWrapper>
  );
};

export default AboutPage;
