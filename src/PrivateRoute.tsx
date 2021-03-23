import * as React from 'react';
import { Route, Redirect } from 'react-router-dom';
const isAuthenticated = () => {
    const token = localStorage.getItem('key');
    if (token) {
        return true;
    } else {
        return false
    }
};
export const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route
        {...rest}
        render={(props) => {
            if (!isAuthenticated()) {
                return <Redirect to={{ pathname: '/', state: { from: props.location } }} />;
            }
            return <Component {...props} />;
        }}
    />
);
