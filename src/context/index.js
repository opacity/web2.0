import React, { useState, createContext } from "react";

const FileManagementStatus = createContext({
  isManaging: false,
  deletingCount: 0,
  setDeletingCount: () => {},
  setFileStatus: () => {},
});

const FileManagementStatusProvider = (props) => {
  const [status, setStatus] = useState(false);
  const [count, setCount] = useState(0);

  return (
    <FileManagementStatus.Provider
      value={{
        isManaging: status,
        deletingCount: count,
        setDeletingCount: (v) => setCount(v),
        increaseDeletingCount: () => setCount(count + 1),
        setFileStatus: (flag) => {
          setStatus(flag);
        },
      }}
    >
      {props.children}
    </FileManagementStatus.Provider>
  );
};

export { FileManagementStatus, FileManagementStatusProvider };
