import list from 'reducers/records/recordsListReducers';
import form from 'reducers/records/recordsFormReducers';
import { combineReducers } from 'redux';

export default combineReducers({
  list,
  form,
});
