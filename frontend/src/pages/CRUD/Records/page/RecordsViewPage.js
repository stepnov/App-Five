import React, { useEffect } from 'react';
import RecordsWidget from 'pages/CRUD/Records/page/RecordsWidget';
import actions from 'actions/records/recordsFormActions';
import { connect } from 'react-redux';

const RecordsViewPage = (props) => {
  const { dispatch, match, loading, record } = props;

  useEffect(() => {
    dispatch(actions.doFind(match.params.id));
  }, [match]);

  return (
    <React.Fragment>
      <RecordsWidget loading={loading} record={record} />
    </React.Fragment>
  );
};

function mapStateToProps(store) {
  return {
    loading: store.users.form.loading,
    record: store.users.form.record,
  };
}

export default connect(mapStateToProps)(RecordsViewPage);
