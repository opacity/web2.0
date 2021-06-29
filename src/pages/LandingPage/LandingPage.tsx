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
// const community = require("../../assets/community.png");
// const stand = require("../../assets/stand.png");
// const crypto = require("../../assets/crypto.png");
const uniswap = require("../../assets/uniswap.png");
// const mercatox = require("../../assets/mercatox.png");
const kucoin = require("../../assets/kucoin.png");

const LandingPage = ({ history }) => {
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
    <SiteWrapper
      showSignUpModal={showSignUpModal}
      handleCloseSignUpModal={handleCloseSignUpModal}
      isHome={true}
      history={history}
    >
      <div className="first-ele">
        <div className="container-xl" data-aos="fade-up">
          <div className="row">
            <div className="col-md-6">
              <h1>Privacy By Design</h1>
              <div className="description mb-5 mt-2">
                Free to share ideas. Free to be private. Free to be you.
              </div>
              <div className="row mb-3">
                <div className="col-md-5 btn-cart-container">
                  <NavLink
                    href="https://www.kucoin.com/trade/OPCT-USDT"
                    target="_blank"
                  >
                    <button className="btn btn-pill btn-cart">
                      <span></span>
                      Purchase OPCT
                    </button>
                  </NavLink>
                </div>
                <div className="col-md-5">
                  <button
                    className="btn btn-pill btn-upload"
                    onClick={handleOpenSignUpModal}
                  >
                    <span></span>
                    Get Started for FREE
                  </button>
                </div>
              </div>
              <div className="col-md-10 banner-text">
                No personal information required. Get 10GB file storage and file
                sharing for free
              </div>
            </div>
            <div className="col-md-6">
              <img src={bannerImage} width={640} height={400}></img>
              <img
                className="d-none"
                src={opacitym}
                width={320}
                height={520}
              ></img>
            </div>
          </div>
        </div>
      </div>
      <div className="container-xl second-ele ">
        <div className="row text-center" data-aos="fade-up">
          <div className="col-md-4 card-items image-personal">
            <div className="image-ele"></div>
            <div className="title">No Personal Info Required</div>
            <div className="descriptions">
              We never ask for your personal information. You're always
              protected, so you'll never end up on the dark web
            </div>
          </div>
          <div className="col-md-4 card-items image-share">
            <div className="image-ele"></div>
            <div className="title">Share Files Your Way</div>
            <div className="descriptions">
              You control who can view your files. By default, you and only you
              even know these files exist.
            </div>
          </div>
          <div className="col-md-4 card-items image-pay">
            <div className="image-ele"></div>
            <div className="title">Pay Using Cryptocurrency</div>
            <div className="descriptions">
              Using the OPCT token, you can pay for your storage needs without
              ever having to use a credit card.
            </div>
          </div>
        </div>
        <div className="row how-it-works" style={{ marginTop: 150 }}>
          <div className="col-md-12" data-aos="fade-up">
            <div className="row justify-content-center">
              <div className="col-md-5 pr-4">
                <img
                  className="mt-4"
                  src={dashboard}
                  width={507}
                  height={330}
                />
              </div>
              <div className="col-md-5 pl-4">
                <h1 className="title mb-4">
                  Share any private file easily, with anyone, on any device.
                </h1>
                <div className="descriptions">
                  <p className="mb-4">
                    File sharing with Opacity is quick and simple. By just
                    sharing a link, you can send anything – from photos and
                    videos to zipped folders and large CAD files – with anyone,
                    even if they don’t have a Opacity account. Share links and
                    files from anywhere, using your phone, tablet or computer.
                  </p>
                  {/* <p>
                    And unlike email attachments, you don’t have to worry about file size limits—share files as large as your cloud storage space
                    quota (2 GB and up).
                  </p> */}
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-12 dot-left"></div>

          <div className="col-md-12" data-aos="fade-up">
            <div className="row justify-content-center">
              <div className="col-md-5 pr-4">
                <h1 className="title mb-4">
                  No Personal Information Means 100% Trust
                </h1>
                <div className="descriptions">
                  <p className="mb-4">
                    Only Opacity can guarantee your information will never be
                    leaked or used by 3rd party ads. Because we don't ask for
                    it! Your name, address, or credit card will never be
                    compromised. We respect your privacy by keeping you out of
                    the transaction.
                  </p>
                </div>
              </div>
              <div className="col-md-5 pl-4">
                <img className="mt-4" src={share} width={507} height={285} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="third-ele text-center" data-aos="fade-up">
        <div className="container-xl">
          <h1>What can Opacity help you do?</h1>
          <h3>
            Opacity provides 100% private data storage. But we also use client
            side encryption you won’t find on other file hosting sites. Our
            private file sharing capability ensures only authorized users you
            share with can access your files. Mobile and desktop applications
            make it easy to access and share files anywhere!
          </h3>
          <button
            className="btn btn-pill btn-primary"
            onClick={handleOpenSignUpModal}
          >
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
                Opacity uses state-of-the-art encryption algorithms to ensure
                that your files are secure. The Opacity platform encrypts your
                files at rest to provide comprehensive protection for your
                files. As long as you protect your Opacity Handle, your data is
                safe.
              </h4>
            </div>
            <div className="col-md-6 pl-4">
              <Lottie
                options={defaultOptions}
                width={"100%"}
                isClickToPauseDisabled
              />
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
              <Lottie
                options={defaultOptions2}
                width={"100%"}
                isClickToPauseDisabled
              />

              {/* <img src={rules} />
              <img className="d-none" src={rulesm} />
              <div className="circle-yellow"></div> */}
            </div>
            <div className="col-md-6 pl-4 ">
              <h1>Your Handle, Your Rules.</h1>
              <h4>
                Your unique Opacity Account Handle is the single point of access
                to your storage account. Like a private encryption key, only you
                know this Handle, and only you have access to your files unless
                you decide to share the Handle. You may also choose to only
                share individual files with a unique File Handle that others may
                use to privately download or view files on the Opacity platform.
              </h4>
            </div>
          </div>
        </div>
      </div>
      <div className="third-ele text-center" data-aos="fade-up">
        <div className="container-xl">
          <h1>Sync files automatically</h1>
          <h3 className="pl-5 pr-5">
            When you download the Opacity desktop app for Windows or Mac, you
            can automatically sync your local files with your Opacity Private
            cloud storage
          </h3>
          <button
            className="btn btn-pill btn-primary"
            onClick={handleOpenSignUpModal}
          >
            Get Started for Free
          </button>
        </div>
      </div>

      <div className="container-xl opct" data-aos="fade-up">
        <h1>Where to Buy OPCT</h1>
        <div className="row text-center align-items-center">
          <div className="col-md-4">
            <div className="card-item">
              <img src={kucoin} width={119} height={111} />
              <NavLink
                href="https://www.kucoin.com/trade/OPCT-USDT"
                target="_blank"
              >
                Buy OPCT on KUCOIN
              </NavLink>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card-item">
              <coingecko-coin-ticker-widget
                currency="usd"
                coin-id="opacity"
                locale="en"
              ></coingecko-coin-ticker-widget>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card-item">
              <img src={uniswap} width={107} height={109} />
              <NavLink
                href="https://v2.info.uniswap.org/pair/0xd07d843cd1d769cdf918be8a3c2c0b708889f7fc"
                target="_blank"
              >
                Buy OPCT on UNISWAP
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </SiteWrapper>
  );
};

export default LandingPage;
