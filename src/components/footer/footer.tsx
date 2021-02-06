import * as React from "react";
import { NavLink } from "tabler-react";
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
            <img width="78" src={logo} />
            <span className="ml-3">OPACITY</span>
          </div>
          <div className="col-md-6 footer-third">
            <div className="d-flex h-100 align-items-center" style={{ justifyContent: "flex-end" }}>
              <NavLink>
                <img width="43" src={github} />
              </NavLink>
              <NavLink>
                <img width="43" src={reddit} />
              </NavLink>
              <NavLink>
                <img width="43" src={telegram} />
              </NavLink>
              <NavLink>
                <img width="43" src={twitter} />
              </NavLink>
              <NavLink>
                <img width="43" src={youtube} />
              </NavLink>
            </div>
          </div>
        </div>
        <div className="divider"></div>
        <div className=" footer-links">
          <div className="link-wrapper">
            <span className="title"> Company</span>
            <NavLink>Opacity</NavLink>
            <NavLink>Storage</NavLink>
            <NavLink>The Platform</NavLink>
            <NavLink>Community</NavLink>
            <NavLink>Blog</NavLink>
            <NavLink>Buy OPCT</NavLink>
            <NavLink>Contact us</NavLink>
          </div>
          <div className="link-wrapper">
            <span className="title"> Use Cases</span>
            <NavLink>File Sharing</NavLink>
            <NavLink>Document Management</NavLink>
            <NavLink>FTP Alternative</NavLink>
            <NavLink>File Transfer</NavLink>
            <NavLink>Cloud Backup</NavLink>
          </div>
          <div className="link-wrapper">
            <span className="title"> Service & Support</span>
            <NavLink>Customer Success</NavLink>
            <NavLink>Community</NavLink>
            <NavLink>Contact us</NavLink>
          </div>
          <div className="link-wrapper">
            <span className="title"> Others Link</span>
            <NavLink>Sitemap</NavLink>
            <NavLink>Subscription</NavLink>
            <NavLink>Management</NavLink>
            <NavLink>Terms of Service</NavLink>
            <NavLink>Privacy Policy</NavLink>
            <NavLink>Cookie Notification</NavLink>
          </div>
        </div>
        <div className="divider"></div>
        <div className="row">
          <div className="col-md-12 text-center copywrite">Opacity © 2021</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
