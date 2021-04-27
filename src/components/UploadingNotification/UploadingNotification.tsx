import React from "react"
import './UploadingNotification.scss'
import { CircularProgressbar } from "react-circular-progressbar"
import 'react-circular-progressbar/dist/styles.css';

const UploadingNotification = ({ notifications, uploadFinish, setUploadingList }) => {
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

    const briefName = (name) => {
		let resName = name;
		if (name.length > 30) {
			resName = name.slice(0, 30) + ' ...';
		}
		return resName
    }
    
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
            <div className='notifications-body'>
                {
                    notifications.map((item, i) => (
                        <div className='notification-item' key={i}>
                            <div className="d-flex align-items-center"><i className="icon-document"></i><div className='text-field'>{briefName(item.fileName)}</div></div>
                            <div className="percent">
                                <CircularProgressbar value={item.percent} strokeWidth={20} />
                            </div>
                        </div>
                    ))
                }

            </div>
        </div>
    )
}

export default UploadingNotification;