import React from "react"
import UploadingItem from "./UploadingItem"
import './UploadingNotification.scss'


const UploadingNotification = ({ notifications, uploadFinish, setUploadingList, onCancel }) => {
    const [minimize, setMinimize] = React.useState(false)
    const [isClose, setClose] = React.useState(false)
    const handleMinimize = () => {
        setMinimize(!minimize)
    }
    const handleClose = () => {
        if (notifications.length > 0 && notifications.filter(item => item.percent === 100).length === notifications.length) {
            setUploadingList()
        }
    }
    React.useEffect(() => {
        if (notifications.length > 0 && notifications.filter(item => item.percent === 100).length === notifications.length) {
            uploadFinish();
            // setUploadingList()
        }
    }, [notifications])

    return (
        <div className={minimize ? 'notifications minimize' : 'notifications'}>
            <div className='notifications-header'>
                {
                    notifications.filter(item => item.percent === 100).length === notifications.length ? (
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
                <span>Uploading...</span>
                <strong className="cancel-button">CANCEL</strong>
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