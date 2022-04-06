import auth from 'reducers/auth';
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import users from 'reducers/users/usersReducers';

import records from 'reducers/records/recordsReducers';

import projects from 'reducers/projects/projectsReducers';

export default (history) =>
  combineReducers({
    router: connectRouter(history),
    auth,

    users,

    records,

    projects,
  });
