import * as React from 'react';
import { Route, Redirect } from 'react-router-dom';
const isAuthenticated = (isOldRoute) => {
    const token = isOldRoute ? localStorage.getItem('old-key') : localStorage.getItem('key');

    return token ? true : false;
};
export const PrivateRoute = ({ component: Component, isOldRoute = false, ...rest }) => (
    <Route
        {...rest}
        render={(props) => {
            if (!isAuthenticated(isOldRoute)) {
                return <Redirect to={{ pathname: '/', state: { from: props.location } }} />;
            }
            return <Component {...props} />;
        }}
    />
);
