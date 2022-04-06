import React, { useEffect } from 'react';
import ProjectsWidget from 'pages/CRUD/Projects/page/ProjectsWidget';
import actions from 'actions/projects/projectsFormActions';
import { connect } from 'react-redux';

const ProjectsViewPage = (props) => {
  const { dispatch, match, loading, record } = props;

  useEffect(() => {
    dispatch(actions.doFind(match.params.id));
  }, [match]);

  return (
    <React.Fragment>
      <ProjectsWidget loading={loading} record={record} />
    </React.Fragment>
  );
};

function mapStateToProps(store) {
  return {
    loading: store.users.form.loading,
    record: store.users.form.record,
  };
}

export default connect(mapStateToProps)(ProjectsViewPage);
