import { Formik } from 'formik';
import React, { Component } from 'react';
import Loader from 'components/Loader';
// eslint-disable-next-line no-unused-vars
import InputFormItem from 'components/FormItems/items/InputFormItem';
// eslint-disable-next-line no-unused-vars
import InputNumberFormItem from 'components/FormItems/items/InputNumberFormItem';
// eslint-disable-next-line no-unused-vars
import SwitchFormItem from 'components/FormItems/items/SwitchFormItem';
// eslint-disable-next-line no-unused-vars
import RadioFormItem from 'components/FormItems/items/RadioFormItem';
// eslint-disable-next-line no-unused-vars
import SelectFormItem from 'components/FormItems/items/SelectFormItem';
// eslint-disable-next-line no-unused-vars
import DatePickerFormItem from 'components/FormItems/items/DatePickerFormItem';
// eslint-disable-next-line no-unused-vars
import ImagesFormItem from 'components/FormItems/items/ImagesFormItem';
// eslint-disable-next-line no-unused-vars
import FilesFormItem from 'components/FormItems/items/FilesFormItem';
// eslint-disable-next-line no-unused-vars
import TextAreaFormItem from 'components/FormItems/items/TextAreaFormItem';
// eslint-disable-next-line no-unused-vars

import recordsFields from 'pages/CRUD/Records/helpers/recordsFields';
import IniValues from 'components/FormItems/iniValues';
import PreparedValues from 'components/FormItems/preparedValues';
import FormValidations from 'components/FormItems/formValidations';
import Widget from 'components/Widget';

import UsersSelectItem from 'pages/CRUD/Users/helpers/UsersSelectItem';

import ProjectsSelectItem from 'pages/CRUD/Projects/helpers/ProjectsSelectItem';

const RecordsForm = (props) => {
  const {
    isEditing,
    isProfile,
    findLoading,
    saveLoading,
    record,
    onSubmit,
    onCancel,
    modal,
  } = props;

  const iniValues = () => {
    return IniValues(recordsFields, record || {});
  };

  const formValidations = () => {
    return FormValidations(recordsFields, record || {});
  };

  const handleSubmit = (values) => {
    const { id, ...data } = PreparedValues(recordsFields, values || {});
    onSubmit(id, data);
  };

  const title = () => {
    if (isProfile) {
      return 'Edit My Profile';
    }

    return isEditing ? 'Edit Records' : 'Add Records';
  };

  const renderForm = () => (
    <Widget title={<h4>{title()}</h4>} collapse close>
      <Formik
        onSubmit={handleSubmit}
        initialValues={iniValues()}
        validationSchema={formValidations()}
      >
        {(form) => (
          <form onSubmit={form.handleSubmit}>
            <InputFormItem name={'task'} schema={recordsFields} autoFocus />

            <InputFormItem name={'hours'} schema={recordsFields} />

            <UsersSelectItem
              name={'user'}
              schema={recordsFields}
              showCreate={!modal}
              form={form}
            />

            <SwitchFormItem name={'submitted'} schema={recordsFields} />

            <ProjectsSelectItem
              name={'project'}
              schema={recordsFields}
              showCreate={!modal}
              form={form}
            />

            <RadioFormItem name={'record_type'} schema={recordsFields} />

            <div className='form-buttons'>
              <button
                className='btn btn-primary'
                disabled={saveLoading}
                type='button'
                onClick={form.handleSubmit}
              >
                Save
              </button>{' '}
              <button
                className='btn btn-light'
                type='button'
                disabled={saveLoading}
                onClick={form.handleReset}
              >
                Reset
              </button>{' '}
              <button
                className='btn btn-light'
                type='button'
                disabled={saveLoading}
                onClick={() => onCancel()}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </Formik>
    </Widget>
  );

  if (findLoading) {
    return <Loader />;
  }

  if (isEditing && !record) {
    return <Loader />;
  }

  return renderForm();
};

export default RecordsForm;
