import React from "react";
import ReactTooltip from "react-tooltip";
import { NavLink } from "tabler-react";
import "./BrokenBadgeOnEntry.scss";

const BrokenBadgeOnEntry = () => {
  return (
    <>
      <ReactTooltip id="broken-tooltip" place="top" effect="solid" delayHide={100} className="broken-file-tooltip">
        <NavLink href="https://help.opacity.io/help/broken-files" target="_blank">
          What does this mean?
        </NavLink>
      </ReactTooltip>

      <span
        data-tip
        data-for="broken-tooltip"
        style={{
          display: "inline-block",
          background: "#f15757",
          color: "white",
          padding: "2px 4px",
          fontSize: "11px",
          borderRadius: 4,
          marginInline: "1em",
        }}
      >
        broken
      </span>
    </>
  );
};

export default BrokenBadgeOnEntry;
