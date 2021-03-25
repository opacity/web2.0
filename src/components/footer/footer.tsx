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
      <div className='container-xl'>
        <div className='row'>
          <div className='col-md-6 footer-logo'>
            <img width='78' src={logo} />
            <span className='ml-3'>OPACITY</span>
          </div>
          <div className='col-md-6 footer-third'>
            <div className='d-flex h-100 align-items-center' style={{ justifyContent: "flex-end" }}>
              <NavLink>
                <img width='43' src={github} />
              </NavLink>
              <NavLink>
                <img width='43' src={reddit} />
              </NavLink>
              <NavLink>
                <img width='43' src={telegram} />
              </NavLink>
              <NavLink>
                <img width='43' src={twitter} />
              </NavLink>
              <NavLink>
                <img width='43' src={youtube} />
              </NavLink>
            </div>
          </div>
        </div>
        <div className='divider'></div>
        <div className=' footer-links'>
          <div className='link-wrapper'>
            <span className='title'> Company</span>
            <NavLink>About us</NavLink>
            <NavLink>Blog</NavLink>
            <NavLink>Press</NavLink>
          </div>
          <div className='link-wrapper'>
            <span className='title'> Resources</span>
            <NavLink>Products</NavLink>
            <NavLink>Downloads</NavLink>
            <NavLink>Learn</NavLink>
            <NavLink>API for Developers</NavLink>
          </div>
          <div className='link-wrapper'>
            <span className='title'> Help</span>
            <NavLink>Contact us</NavLink>
            <NavLink>Telegram</NavLink>
            <NavLink>Discord</NavLink>
          </div>
          <div className='link-wrapper'>
            <span className='title'> Legal</span>
            <NavLink>Terms of Service</NavLink>
            <NavLink>Privacy Policy</NavLink>
            <NavLink>Code License</NavLink>
          </div>
        </div>
        <div className='divider'></div>
        <div className='row'>
          <div className='col-md-12 text-center copywrite'> © 2018-2021 Opacity Storage Inc. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
