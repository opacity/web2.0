import * as React from "react";
import { NavLink } from "tabler-react";
import SiteWrapper from "../../SiteWrapper";
import "./404Page.scss";

const logo = require("../../assets/logo2.png");

const Page404 = ({ history }) => {
  return (
    <SiteWrapper history={history}>
      <div className="page404">
        <div className="content">
          <div className="title" title="Error 404">
            <svg
              className="shape shape-rock-1"
              width="71"
              height="70"
              viewBox="0 0 71 70"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.5 26L11.5 46.5L33.5001 57L49.3246 57.8977L62.5 44.0001L62 28.5001L51.2115 15.2668L41.5 16.5L26.5 9.50002L11.5 26Z"
                fill="#4C4C4C"
              ></path>
              <path
                d="M20.5 24L22 41L36 52.5L49.3246 57.8977L62.5001 44L62 28.5L51.2115 15.2668L41.5 16.5L26.5 9.50001L20.5 24Z"
                fill="#A4A4A5"
              ></path>
            </svg>
            <svg
              className="shape shape-four-1"
              width="124"
              height="142"
              viewBox="0 0 124 142"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M89.0471 141.322L95.3623 117.754L111.01 121.947L118.827 92.7756L103.179 88.5828L123.574 12.4678L77.4023 0.0962432L7.25156 66.3991L0.315214 92.2859L61.9413 108.799L55.6261 132.367L89.0471 141.322ZM69.7576 79.6276L40.3935 71.7595L82.388 32.4904L69.7576 79.6276Z"
                fill="url(#paint0_linear)"
              ></path>
              <defs>
                <linearGradient
                  id="paint0_linear"
                  x1="67"
                  y1="57"
                  x2="101"
                  y2="168"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="white"></stop>
                  <stop offset="1" stop-color="white" stop-opacity="0"></stop>
                </linearGradient>
              </defs>
            </svg>
            <svg
              className="shape shape-zero"
              width="104"
              height="121"
              viewBox="0 0 104 121"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M66.017 119.444C99.347 111.482 108 78.88 100.814 48.7976C93.6278 18.7151 71.2141 -6.28433 37.8841 1.67783C4.55407 9.63998 -4.14024 42.0707 3.04612 72.1532C10.2325 102.236 32.687 127.406 66.017 119.444ZM59.8106 93.4635C46.1368 96.7301 37.6049 85.2175 32.7867 65.0485C27.9686 44.8796 30.4166 30.9247 44.0905 27.6581C57.7643 24.3916 66.2554 35.7333 71.0735 55.9023C75.8916 76.0712 73.4845 90.197 59.8106 93.4635Z"
                fill="url(#paint0_linear)"
              ></path>
              <defs>
                <linearGradient
                  id="paint0_linear"
                  x1="80.0001"
                  y1="53"
                  x2="132"
                  y2="15"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="white"></stop>
                  <stop offset="1" stop-color="white" stop-opacity="0"></stop>
                </linearGradient>
              </defs>
            </svg>
            <svg
              className="shape shape-rock-2"
              width="71"
              height="72"
              viewBox="0 0 71 72"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M23.6404 14.9808L4.68481 34.9094L25.8063 65.3995L43 65.2361L51.0289 46.1523C51.0289 46.1523 62.7982 46.1912 63.6985 47.2673C64.5988 48.3434 66.8592 29.8569 66.8592 29.8569L58.1282 8.55272L33.5203 9.83583L23.6404 14.9808Z"
                fill="#4C4C4C"
              ></path>
              <path
                d="M58.1294 8.5519L33.5214 9.83501L23.6413 14.981L21.2386 17.5064L32.1271 23.5505L28.421 43.9649L36.9157 65.2942L43.0011 65.2353L51.0301 46.1515C51.0301 46.1515 62.7994 46.1904 63.6996 47.2665C64.5999 48.3426 66.8604 29.8561 66.8604 29.8561L58.1294 8.5519Z"
                fill="#A4A4A5"
              ></path>
            </svg>
            <svg
              class="shape shape-four-2"
              width="119"
              height="139"
              viewBox="0 0 119 139"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M103.82 135.525L101.989 110.776L118.42 109.56L116.154 78.9278L99.7221 80.1436L93.8083 0.215792L45.3242 3.80309L0.168954 90.977L2.18024 118.161L66.8934 113.372L68.7245 138.122L103.82 135.525ZM64.6269 82.7403L33.7918 85.0217L60.9646 33.2418L64.6269 82.7403Z"
                fill="url(#paint0_linear)"
              ></path>
              <defs>
                <linearGradient
                  id="paint0_linear"
                  x1="76.2591"
                  y1="77.0593"
                  x2="166.259"
                  y2="18.0593"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="white"></stop>
                  <stop offset="1" stop-color="white" stop-opacity="0"></stop>
                </linearGradient>
              </defs>
            </svg>
            <svg
              className="shape shape-rock-3"
              width="31"
              height="32"
              viewBox="0 0 31 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.49999 5.5L6.49996 13.5L2.49997 22L11.5 29.5L23.5 28L28.5 14L21.385 4.42362L11.5 1.49999L4.49999 5.5Z"
                fill="#4C4C4C"
              ></path>
              <path
                d="M4.49999 5.5L8.99998 7.5L14.5 15.5L14.5 24L23.5 28L28.5 14L21.385 4.42362L11.5 1.49999L4.49999 5.5Z"
                fill="#A4A4A5"
              ></path>
            </svg>
          </div>

          <div className="description">
            <h1>Uh oh! You've reached a dead-end. </h1>
            <h2>
              If you're looking for an image, it's probably been deleted or may
              not have existed at all. If you are looking to share your images,
              <a href="https://opacity.io">visit our homepage</a>!
            </h2>
            <NavLink href="https://opacity.io">
              <div className="d-flex justify-content-center w-100 mt-3">
                <div className="logo-wrapper">
                  <img src={logo} width="60" height="60" alt="Opacity" />
                  <span className="ml-3">OPACITY</span>
                </div>
              </div>
            </NavLink>
          </div>
        </div>
      </div>
    </SiteWrapper>
  );
};

export default Page404;
