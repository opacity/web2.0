import React from "react";
import { Alert } from "tabler-react";

import "./WarningWrapper.scss";

const WarningWrapper = (props) => {
  if (window.location.hostname === "www.opacity.io" || window.location.hostname === "opacity.io") {
    return <>{props.children}</>;
  }

  return (
    <>
      <div className="full-width">
        <Alert type="warning" className="margin-0 text-center">
          This site is for test purposes only. If you are interested in a full featured Opacity Storage account, please visit
          <a href="https://www.opacity.io">www.opacity.io</a>.
        </Alert>
      </div>
      <div className="full-width">{props.children}</div>
    </>
  );
};

export default WarningWrapper;
