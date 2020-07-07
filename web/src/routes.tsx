import { Route, BrowserRouter } from "react-router-dom";
import React from "react";

import CreatePoint from "./pages/CreatePoint";
import Home from "./pages/home";

const Routes = () => {
  return (
    <BrowserRouter>
      <Route exact component={Home} path="/"></Route>
      <Route path="/criar" component={CreatePoint}></Route>
    </BrowserRouter>
  );
};

export default Routes;
