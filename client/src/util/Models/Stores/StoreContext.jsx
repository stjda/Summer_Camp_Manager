// StoreContext
import React, { useContext } from "react";
import { types } from "mobx-state-tree";
import { AuthenticationStoreModel, UserProfileModel } from "../index"


const RootStoreModel = types.model("RootStore").props({
  authenticationStore: types.optional(AuthenticationStoreModel, {}),
  userProfileStore: types.optional(UserProfileModel, {}),
}).actions((self) => ({

}));


const _rootStore = RootStoreModel.create({})

const StoreContext = React.createContext(_rootStore);

export const StoreProvider = ({ children }) => {
  return <StoreContext.Provider value={_rootStore}>{children}</StoreContext.Provider>;
};

export const useStore = () => {

  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useStore must be used within a StoreProvider.');
  }
  return store;
};