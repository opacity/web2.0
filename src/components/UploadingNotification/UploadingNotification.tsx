import React from "react";
import UploadingItem from "./UploadingItem";
import "./UploadingNotification.scss";

const isUploadCompleted = (notifications) => {
  return notifications.find((item) => item.percent !== 100) ? false : true;
};

const getPlural = (count, string) => (count > 1 ? string + "s" : string);

const UploadingNotification = ({ notifications, uploadFinish, setUploadingList, onCancel, onCancelAll, onRetry, onLocation }) => {
  const [minimize, setMinimize] = React.useState(false);
  const [isClose, setClose] = React.useState(false);
  const handleMinimize = () => {
    setMinimize(!minimize);
  };
  const handleClose = () => {
    if (notifications.length > 0 && isUploadCompleted(notifications)) {
      setUploadingList();
    }
  };
  React.useEffect(() => {
    if (notifications.length > 0 && isUploadCompleted(notifications)) {
      uploadFinish();
    }
  }, [notifications]);

  const uploadingItemCount = notifications.filter((item) => item.percent !== 100).length;

  const completedMessage = () => {
    const cancelledItems = notifications.filter((item) => item.status === "cancelled").length;
    if (cancelledItems) return `${cancelledItems} ${getPlural(cancelledItems, "upload")} canceled`;
    return `${notifications.length} ${getPlural(notifications.length, "upload")} complete`;
  };

  return (
    <div className={minimize ? "notifications minimize" : "notifications"}>
      <div className="notifications-header">
        {isUploadCompleted(notifications) ? (
          <span>{completedMessage()}</span>
        ) : (
          <span>
            Uploading {uploadingItemCount} {getPlural(uploadingItemCount, "item")}
          </span>
        )}
        <div className="d-flex align-items-center">
          <span className="icon-down" onClick={() => handleMinimize()}></span>
          <span className="icon-close" onClick={() => handleClose()}></span>
        </div>
      </div>
      {!isUploadCompleted(notifications) && (
        <div className="notifications-subheader">
          <span>Uploading...</span>
          <strong className="cancel-button" onClick={onCancelAll}>
            CANCEL
          </strong>
        </div>
      )}
      <div className="notifications-body">
        {notifications.map((item, i) => (
          <UploadingItem
            key={i}
            item={item}
            onCancel={() => onCancel(item)}
            onRetry={() => onRetry(item)}
            onLocation={() => onLocation(item)}
          />
        ))}
      </div>
    </div>
  );
};

export default UploadingNotification;
