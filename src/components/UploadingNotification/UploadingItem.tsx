import React, { useState } from "react";
import "./UploadingNotification.scss";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const briefName = (name, length = 30) => {
  let resName = name;
  if (name.length > length) {
    resName = name.slice(0, length) + " ...";
  }
  return resName;
};

const getFileExtension = (name) => {
  const lastDot = name.lastIndexOf(".");

  const ext = name.substring(lastDot + 1);
  return ext;
};

const setClassNameFromExt = (ext?: string) => {
  ext = ("" + ext).replace(/^\./, "");
  if (["png", "apng", "svg", "gif", "bmp", "ico", "cur", "jpg", "jpeg", "jfif", "pjpeg", "pjp", "webp"].includes(ext)) {
    return "icon-image";
  }

  if (["mp4", "ogg", "webm", "avi"].includes(ext)) {
    return "icon-video";
  }

  if (["mp3", "flac"].includes(ext)) {
    return "icon-video";
  }

  if (["txt", "md"].includes(ext)) {
    return "icon-document";
  }

  if (["zip", "rar", "7z", "deb"].includes(ext)) {
    return "icon-document";
  }

  return "icon-document";
};

const UploadingItem = ({ item, onCancel }) => {
  const [hoverCancel, setHoverCancel] = useState(false);

  const iconRender = (status) => {
    switch (status) {
      case "active":
      case "uploading":
        return (
          <div onMouseEnter={() => setHoverCancel(true)} onMouseLeave={() => setHoverCancel(false)}>
            {hoverCancel ? (
              <i className="icon-cancel" onClick={onCancel}></i>
            ) : (
              <CircularProgressbar value={item.percent} strokeWidth={20} />
            )}
          </div>
        );
      case "cancelled":
        return <i className="icon-warning"></i>;
      case "completed":
        return <i className="icon-completed"></i>;
      default:
        break;
    }
  };

  return (
    <div className="notification-item">
      <div className="d-flex align-items-center">
        <i className={setClassNameFromExt(getFileExtension(item.fileName))}></i>
        <div className="text-field">{briefName(item.fileName, item?.status === "cancelled" ? 15 : 30)}</div>
      </div>

      {item?.status === "cancelled" && <div className="text-field">Upload Canceled</div>}

      <div className="percent">{iconRender(item?.status)}</div>
    </div>
  );
};

export default UploadingItem;
