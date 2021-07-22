import React, { useState, createContext } from "react";

const FileManagementStatus = createContext();

const FileManagementStatusProvider = (props) => {
  const [isManaging, setManagingState] = useState(false);

  return (
    <FileManagementStatus.Provider value={{ isManaging, setManagingState }}>
      {props.children}
    </FileManagementStatus.Provider>
  );
};

export { FileManagementStatus, FileManagementStatusProvider };
