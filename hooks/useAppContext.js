import { useContext } from "react";

import AppContext from "../utils/context";

const useAppContext = () => useContext(AppContext);

export default useAppContext;