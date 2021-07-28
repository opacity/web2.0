import fileActions from "../actions/file-actions";

const initState = {
  deleteCount: 0,
};

const signupReducer = (state = initState, action) => {
  switch (action.type) {
    case fileActions.INCREASE_DELETING_FILES:
      return { ...state, deleteCount: state.deleteCount + 1 };
    case fileActions.RESET_DELETING_FILES:
      return { ...state, deleteCount: 0 };
    default:
      return state;
  }
};

export default signupReducer;
