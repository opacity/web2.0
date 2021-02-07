import * as React from "react";
import { useState } from "react";
import { NavLink } from "tabler-react";
import Lottie from "react-lottie";
const animationData1 = require("./lottie1.json");
const animationData2 = require("./lottie2.json");

import SiteWrapper from "../../SiteWrapper";
import "./LandingPage.scss";
const bannerImage = require("../../assets/banner.png");
const opacitym = require("../../assets/opacity-m.png");
const dashboard = require("../../assets/dashboard.png");
const share = require("../../assets/share.png");
const secure = require("../../assets/secure.png");
const securem = require("../../assets/secure-m.png");
const rules = require("../../assets/rules.png");
const rulesm = require("../../assets/rules-m.png");
const community = require("../../assets/community.png");
const privacy = require("../../assets/privacy.png");
const stand = require("../../assets/stand.png");
const crypto = require("../../assets/crypto.png");
const uniswap = require("../../assets/uniswap.png");
const mercatox = require("../../assets/mercatox.png");
const kucoin = require("../../assets/kucoin.png");

const LandingPage = (props) => {
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const handleCloseSignUpModal = () => {
    setShowSignUpModal(false);
  };
  const handleOpenSignUpModal = () => {
    setShowSignUpModal(true);
  };
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData1,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const defaultOptions2 = {
    loop: true,
    autoplay: true,
    animationData: animationData2,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  return (
    <SiteWrapper showSignUpModal={showSignUpModal} handleCloseSignUpModal={handleCloseSignUpModal} isHome={true}>
      <div className="first-ele" >
        <div className="container-xl" data-aos="fade-up">
          <div className="row">
            <div className="col-md-6">
              <h1>Is file sharing a stressful process?</h1>
              <div className="description mb-5 mt-2">
                Best of all, Opacity protects your privacy with end-to-end encryption — ensuring that your data in the cloud is safe, secure and 100%
                private.
              </div>
              <div className="row mb-3">
                <div className="col-md-5">
                  <button className="btn btn-pill btn-cart">
                    <span></span>
                    Purchase OPCT
                  </button>
                </div>
                <div className="col-md-5">
                  <button className="btn btn-pill btn-upload" onClick={handleOpenSignUpModal}>
                    <span></span>
                    Get Started for FREE
                  </button>
                </div>
              </div>
              <div className="col-md-10 banner-text">No payment, no data, no contacts. Get 10GB for free.</div>
            </div>
            <div className="col-md-6">
              <img src={bannerImage}></img>
              <img className="d-none" src={opacitym}></img>
            </div>
          </div>
        </div>
      </div>
      <div className="container-xl second-ele " >
        <div className="row text-center" data-aos="fade-up">
          <div className="col-md-4 card-items image-personal">
            <div className="image-ele"></div>
            <div className="title">No Personal Info Required</div>
            <div className="descriptions">We will never ask for any personal information. No email, no contact, nothing.</div>
          </div>
          <div className="col-md-4 card-items image-share">
            <div className="image-ele"></div>
            <div className="title">Share Files Your Way</div>
            <div className="descriptions">You control who can view your files. By default, you and only you even know these files exist.</div>
          </div>
          <div className="col-md-4 card-items image-pay">
            <div className="image-ele"></div>
            <div className="title">Pay Using Cryptocurrency</div>
            <div className="descriptions">Using the OPCT token, you can pay for your storage needs without ever having to use a credit card.</div>
          </div>
        </div>
        <div className="row how-it-works"  style={{ marginTop: 150 }}>
          <div className="col-md-12" data-aos="fade-up">
            <div className="row justify-content-center">
              <div className="col-md-5 pr-4">
                <img className="mt-4" src={dashboard} />
              </div>
              <div className="col-md-5 pl-4">
                <h1 className="title mb-4">Share any private file easily, with anyone</h1>
                <div className="descriptions">
                  <p className="mb-4">
                    File sharing with Opacity is quick and simple. By just sharing a link, you can send anything – from photos and videos to zipped
                    folders and large CAD files – with anyone, even if they don’t have a Opacity account. Share links and files from anywhere, using
                    your phone, tablet or computer.
                  </p>
                  <p>
                    And unlike email attachments, you don’t have to worry about file size limits—share files as large as your cloud storage space
                    quota (2 GB and up).
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-12 dot-left"></div>

          <div className="col-md-12" data-aos="fade-up">
            <div className="row justify-content-center">
              <div className="col-md-5 pr-4">
                <h1 className="title mb-4">Get real-time updates when you share files</h1>
                <div className="descriptions">
                  <p className="mb-4">
                    Find out exactly when someone has made changes to a file. With cloud file sharing services from Opacity, you’ll immediately see
                    who’s added, edited, deleted, renamed, or moved an online file. Any changes made to a shared file will be automatically updated
                    and synced for all recipients.
                  </p>
                </div>
              </div>
              <div className="col-md-5 pl-4">
                <img className="mt-4" src={share} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="third-ele text-center" data-aos="fade-up">
        <div className="container-xl">
          <h1>What can Opacity help you do?</h1>
          <h3>
            Not only can you enjoy unlimited of secure, permanent data storage, we have a feature of privacy with end-to-end encryption you won’t find
            on any other file hosting site. We’re always thinking outside of the box to remain one step ahead of our competitors, making our file
            upload system the best.
          </h3>
          <button className="btn btn-pill btn-primary" onClick={handleOpenSignUpModal}>
            Get Started for Free
          </button>
        </div>
      </div>
      <div className="fourth-ele" data-aos="fade-up">
        <div className="container-xl">
          <div className="row justify-content-center">
            <div className="col-md-6 pr-4 mt-7">
              <h1>Your Files, Safe and Secure.</h1>
              <h4>
                Opacity uses state-of-the-art encryption algorithms to ensure that your files are secure. The Opacity platform encrypts your files at
                rest to provide comprehensive protection for your files. As long as you protect your Opacity Handle, your data is safe.
              </h4>
            </div>
            <div className="col-md-6 pl-4">
              <Lottie options={defaultOptions}  width={"100%"} />
              {/* <img src={secure} />
              <img className="d-none" src={securem} /> */}
              {/* <div className="circle-primary"></div> */}
            </div>
          </div>
        </div>
      </div>
      <div className="six-ele" data-aos="fade-up">
        <div className="container-xl">
          <div className="row justify-content-center">
            <div className="col-md-6 pr-4 mt-7">
              <Lottie options={defaultOptions2}  width={"100%"} />

              {/* <img src={rules} />
              <img className="d-none" src={rulesm} />
              <div className="circle-yellow"></div> */}
            </div>
            <div className="col-md-6 pl-4 ">
              <h1>Your Handle, Your Rules.</h1>
              <h4>
                Your unique Opacity Account Handle is the single point of access to your storage account. Only you know this Handle, and only you have
                access to your files unless you decide to share the Handle. Opacity applies zero-knowledge principles, meaning we do not track
                anything you upload or download. You may also choose to share individual files with a unique File Handle that others may use to
                privately download or view files on the Opacity platform.
              </h4>
            </div>
          </div>
        </div>
      </div>
      <div className="third-ele text-center" data-aos="fade-up">
        <div className="container-xl">
          <h1>Sync files automatically</h1>
          <h3 className="pl-5 pr-5">
            When you download the Opacity desktop app for Windows or Mac, you can automatically sync your local files with your Opacity Private cloud
            storage
          </h3>
          <button className="btn btn-pill btn-primary" onClick={handleOpenSignUpModal}>
            Get Started for Free
          </button>
        </div>
      </div>
      <div className="card-items container-xl" data-aos="fade-up">
        <h1>More Info? No Problem.</h1>
        <div className="row">
          <div className="col-md-3 ">
            <div className="card-item">
              <div className="rectangle">
                <img src={community} />
              </div>
              <h2> Community for Opacity</h2>
              <h3>
                We are a group of privacy enthusiasts looking to build a true zero-knowledge storage solution. Take a peek at the team behind the
                Opacity platform.
              </h3>
              <NavLink>READ MORE</NavLink>
            </div>
          </div>
          <div className="col-md-3 ">
            <div className="card-item">
              <div className="rectangle">
                <img src={privacy} />
              </div>
              <h2> Privacy in File - Sharing Networks</h2>
              <h3>
                Not many storage providers offer a true, zero-knowledge solution. Learn exactly what zero-knowledge means and how it can be of benefit
                to you.
              </h3>
              <NavLink>READ MORE</NavLink>
            </div>
          </div>
          <div className="col-md-3 ">
            <div className="card-item">
              <div className="rectangle">
                <img src={stand} />
              </div>
              <h2> Why Opacity Stands Out</h2>
              <h3>We do things differently than most storage providers. Learn exactly what makes us stand out from the competition.</h3>
              <NavLink>READ MORE</NavLink>
            </div>
          </div>
          <div className="col-md-3 ">
            <div className="card-item">
              <div className="rectangle">
                <img src={crypto} />
              </div>
              <h2> New to Cryptocurrency?</h2>
              <h3>
                Cryptocurrency can be a little confusing, but it doesn’t have to be. Take a look at this video to learn how you can get started with
                cryptocurrency.
              </h3>
              <NavLink>READ MORE</NavLink>
            </div>
          </div>
        </div>
      </div>
      <div className="container-xl opct" data-aos="fade-up">
        <h1>Where to Buy OPCT</h1>
        <div className="row text-center align-items-center">
          <div className="col-md-4">
            <div className="card-item">
              <img src={uniswap} />
              <NavLink>Buy OPCT on UNISWAP</NavLink>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card-item">
              <img src={kucoin} />
              <NavLink>Buy OPCT on KUCOIN</NavLink>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card-item">
              <img src={mercatox} />
              <NavLink>Buy OPCT on MERCATOX</NavLink>
            </div>
          </div>
        </div>
      </div>
    </SiteWrapper>
  );
};

export default LandingPage;
