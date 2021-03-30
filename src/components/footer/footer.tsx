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
              <NavLink to='https://github.com/opacity'>
                <img width='43' src={github} />
              </NavLink>
              <NavLink to='https://www.reddit.com/r/Opacity/'>
                <img width='43' src={reddit} />
              </NavLink>
              <NavLink to='https://telegram.me/opacitystorage'>
                <img width='43' src={telegram} />
              </NavLink>
              <NavLink to='https://twitter.com/Opacity_Storage'>
                <img width='43' src={twitter} />
              </NavLink>
              <NavLink to='https://www.youtube.com/opacitystorage'>
                <img width='43' src={youtube} />
              </NavLink>
            </div>
          </div>
        </div>
        <div className='divider'></div>
        <div className=' footer-links'>
          <div className='link-wrapper'>
            <span className='title'> Company</span>
            <NavLink to='https://telegram.me/opacitystorage'>About us</NavLink>
            <NavLink to='https://medium.com/opacity-storage'>Blog</NavLink>
            <NavLink>Press</NavLink>
          </div>
          <div className='link-wrapper'>
            <span className='title'> Resources</span>
            <NavLink>Products</NavLink>
            <NavLink to='https://dev2.opacity.io/community'>Downloads</NavLink>
            <NavLink>Learn</NavLink>
            <NavLink to='https://api.opacity.io:3000/swagger/index.html'>API for Developers</NavLink>
          </div>
          <div className='link-wrapper'>
            <span className='title'> Help</span>
            <NavLink to='https://telegram.me/opacitystorage'>Contact us</NavLink>
            <NavLink to='https://telegram.me/opacitystorage'>Telegram</NavLink>
            <NavLink to='http://discord.opacity.io/'>Discord</NavLink>
          </div>
          <div className='link-wrapper'>
            <span className='title'> Legal</span>
            <NavLink to='https://www.opacity.io/terms-of-service'>Terms of Service</NavLink>
            <NavLink to='https://www.opacity.io/privacy-policy'>Privacy Policy</NavLink>
            <NavLink to='https://www.opacity.io/code-review-license'>Code License</NavLink>
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
