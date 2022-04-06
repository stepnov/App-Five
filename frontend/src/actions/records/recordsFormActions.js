import axios from 'axios';
import Errors from 'components/FormItems/error/errors';
import { push } from 'connected-react-router';
import { doInit } from 'actions/auth';
import { toast } from 'react-toastify';

const actions = {
  doNew: () => {
    return {
      type: 'RECORDS_FORM_RESET',
    };
  },

  doFind: (id) => async (dispatch) => {
    try {
      dispatch({
        type: 'RECORDS_FORM_FIND_STARTED',
      });

      axios.get(`/records/${id}`).then((res) => {
        const record = res.data;

        dispatch({
          type: 'RECORDS_FORM_FIND_SUCCESS',
          payload: record,
        });
      });
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: 'RECORDS_FORM_FIND_ERROR',
      });

      dispatch(push('/admin/records'));
    }
  },

  doCreate: (values) => async (dispatch) => {
    try {
      dispatch({
        type: 'RECORDS_FORM_CREATE_STARTED',
      });

      axios.post('/records', { data: values }).then((res) => {
        dispatch({
          type: 'RECORDS_FORM_CREATE_SUCCESS',
        });

        toast.success('Records created');
        dispatch(push('/admin/records'));
      });
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: 'RECORDS_FORM_CREATE_ERROR',
      });
    }
  },

  doUpdate: (id, values, isProfile) => async (dispatch, getState) => {
    try {
      dispatch({
        type: 'RECORDS_FORM_UPDATE_STARTED',
      });

      await axios.put(`/records/${id}`, { id, data: values });

      dispatch(doInit());

      dispatch({
        type: 'RECORDS_FORM_UPDATE_SUCCESS',
      });

      if (isProfile) {
        toast.success('Profile updated');
      } else {
        toast.success('Records updated');
        dispatch(push('/admin/records'));
      }
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: 'RECORDS_FORM_UPDATE_ERROR',
      });
    }
  },
};

export default actions;
