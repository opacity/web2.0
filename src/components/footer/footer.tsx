import * as React from "react";
import { NavLink } from "tabler-react";
import { Link } from "react-router-dom";
import "./footer.scss";
const logo = require("../../assets/logo.svg");
const github = require("../../assets/github.svg");
const reddit = require("../../assets/reddit.svg");
const telegram = require("../../assets/telegram.svg");
const twitter = require("../../assets/twitter.svg");
const youtube = require("../../assets/youtube.svg");

const Footer = () => {
  return (
    <footer>
      <div className="container-xl">
        <div className="row">
          <div className="col-md-6 footer-logo">
            <NavLink href="/">
              <img width="78" src={logo} />
              <span className="ml-3">OPACITY</span>
            </NavLink>
          </div>
          <div className="col-md-6 footer-third">
            <div
              className="d-flex h-100 align-items-center"
              style={{ justifyContent: "flex-end" }}
            >
              <NavLink
                href="https://github.com/opacity"
                target="_blank"
                className="social-link"
              >
                <img width="43" src={github} />
              </NavLink>
              <NavLink
                href="https://www.reddit.com/r/Opacity/"
                target="_blank"
                className="social-link"
              >
                <img width="43" src={reddit} />
              </NavLink>
              <NavLink
                href="https://telegram.me/opacitystorage"
                className="social-link"
                target="_blank"
              >
                <img width="43" src={telegram} />
              </NavLink>
              <NavLink
                href="https://twitter.com/Opacity_Storage"
                className="social-link"
                target="_blank"
              >
                <img width="43" src={twitter} />
              </NavLink>
              <NavLink
                href="https://www.youtube.com/opacitystorage"
                target="_blank"
              >
                <img width="43" src={youtube} />
              </NavLink>
            </div>
          </div>
        </div>
        <div className="divider"></div>
        <div className=" footer-links">
          <div className="link-wrapper">
            <span className="title"> Company</span>
            <NavLink href="https://telegram.me/opacitystorage" target="_blank">
              About us
            </NavLink>
            <NavLink href="https://medium.com/opacity-storage" target="_blank">
              Blog
            </NavLink>
          </div>
          <div className="link-wrapper">
            <span className="title"> Resources</span>
            <NavLink href="/downloads">Downloads</NavLink>
            <NavLink href="https://medium.com/opacity-storage" target="_blank">
              Learn
            </NavLink>
            <NavLink
              href="https://api.opacity.io:3000/swagger/index.html"
              target="_blank"
            >
              API for Developers
            </NavLink>
          </div>
          <div className="link-wrapper">
            <span className="title"> Help</span>
            <NavLink href="https://telegram.me/opacitystorage" target="_blank">
              Contact us
            </NavLink>
            <NavLink href="https://telegram.me/opacitystorage" target="_blank">
              Telegram
            </NavLink>
            <NavLink href="http://discord.opacity.io/" target="_blank">
              Discord
            </NavLink>
          </div>
          <div className="link-wrapper">
            <span className="title"> Legal</span>
            <NavLink href="/terms-of-service" target="_blank">
              Terms of Service
            </NavLink>

            <NavLink href="/privacy-policy" target="_blank">
              Privacy Policy
            </NavLink>

            <NavLink href="/code-review-license" target="_blank">
              Code License
            </NavLink>
          </div>
        </div>
        <div className="divider"></div>
        <div className="row">
          <div className="col-md-12 text-center copywrite">
            {" "}
            © 2018-2021 Opacity Storage Inc. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
