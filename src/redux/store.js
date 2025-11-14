import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import projectReducer from "./projectSlice";
import taskReducer from "./taskSlice";
import teamReducer from "./teamSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    tasks: taskReducer,
    team: teamReducer
  }
});

export default store;
