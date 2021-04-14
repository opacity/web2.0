import React, { useState, createContext } from "react";

const FileManagementStatus = createContext({ isManaging: false, setFileStatus: () => {} })

const FileManagementStatusProvider = (props) => {
  const[status, setStatus] = useState(false)
  
  return (
    <FileManagementStatus.Provider value={{ isManaging: status, setFileStatus: (flag) => { setStatus(flag) }}}>
      {props.children}
    </FileManagementStatus.Provider>
  )
}

export {
  FileManagementStatus,
  FileManagementStatusProvider,
}