import React from "react";
import { Alert } from "tabler-react";

import "./WarningWrapper.scss";

const WarningWrapper = (props) => {
  if (
    window.location.hostname === "dev2.opacity.io" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "localhost"
  )
    return (
      <>
        <div className="full-width">
          <Alert type="warning" className="margin-0 text-center">
            This site is for test purposes only. If you are interested in a full featured Opacity Storage account, please visit
            www.opacity.io.
          </Alert>
        </div>
        <div className="full-width">{props.children}</div>
      </>
    );

  return <>{props.children}</>;
};

export default WarningWrapper;
