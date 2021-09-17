import React from "react"
import UploadingItem from "./UploadingItem"
import './UploadingNotification.scss'

const isUploadCompleted = (notifications) => {
    return notifications.find(item => item.percent !== 100) ? false : true;
}

const UploadingNotification = ({ notifications, uploadFinish, setUploadingList, onCancel, onCancelAll }) => {
    const [minimize, setMinimize] = React.useState(false)
    const [isClose, setClose] = React.useState(false)
    const handleMinimize = () => {
        setMinimize(!minimize)
    }
    const handleClose = () => {
        if (notifications.length > 0 && isUploadCompleted(notifications)) {
            setUploadingList()
        }
    }
    React.useEffect(() => {
        if (notifications.length > 0 && isUploadCompleted(notifications)) {
            uploadFinish();
        }
    }, [notifications])

    return (
        <div className={minimize ? 'notifications minimize' : 'notifications'}>
            <div className='notifications-header'>
                {
                    isUploadCompleted(notifications) ? (
                        <span>{notifications.length} uploads complete</span>
                    ) : (
                        <span>Uploading {notifications.filter(item => item.percent !== 100).length} items</span>
                    )
                }
                <div className='d-flex align-items-center'>
                    <span className='icon-down' onClick={() => handleMinimize()}></span>
                    <span className='icon-close' onClick={() => handleClose()}></span>
                </div>
            </div>
            <div className='notifications-subheader'>
                <span>{isUploadCompleted(notifications) ? 'done!' : 'uploading...'}</span>
                <strong className="cancel-button" onClick={onCancelAll}>CANCEL</strong>
            </div>
            <div className='notifications-body'>
                {
                    notifications.map((item, i) => (
                        <UploadingItem key={i} item={item} onCancel={() => onCancel(item)}/>
                    ))
                }

            </div>
        </div>
    )
}

export default UploadingNotification;