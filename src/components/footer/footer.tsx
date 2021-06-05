import * as React from "react";
import { NavLink } from "tabler-react";
import { Link } from 'react-router-dom'
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
            <NavLink href='https://telegram.me/opacitystorage' target="_blank">About us</NavLink>
            <NavLink href='https://medium.com/opacity-storage' target="_blank">Blog</NavLink>
            <NavLink>Press</NavLink>
          </div>
          <div className='link-wrapper'>
            <span className='title'> Resources</span>
            <NavLink>Products</NavLink>
            <Link className="nav-link" to='/community'>Downloads</Link>
            <NavLink>Learn</NavLink>
            <NavLink href='https://api.opacity.io:3000/swagger/index.html' target="_blank">API for Developers</NavLink>
          </div>
          <div className='link-wrapper'>
            <span className='title'> Help</span>
            <NavLink href='https://telegram.me/opacitystorage' target="_blank">Contact us</NavLink>
            <NavLink href='https://telegram.me/opacitystorage' target="_blank">Telegram</NavLink>
            <NavLink href='http://discord.opacity.io/' target="_blank">Discord</NavLink>
          </div>
          <div className='link-wrapper'>
            <span className='title'> Legal</span>
            <Link className="nav-link" to='/terms-of-service'>Terms of Service</Link>
            <Link className="nav-link" to='/privacy-policy'>Privacy Policy</Link>
            <Link className="nav-link" to='/code-review-license'>Code License</Link>
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
