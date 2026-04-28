import { configureStore } from "@reduxjs/toolkit";
import AuthSlice from "../reducer/AuthSlice"
const store =configureStore(
    {
        reducer:{
            auth:AuthSlice,
        }
    }
)
export default store;