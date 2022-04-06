// eslint-disable-next-line
import * as dataFormat from 'pages/CRUD/Users/table/UsersDataFormatters';

import actions from 'actions/users/usersListActions';
import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { uniqueId } from 'lodash';
import { useHistory } from 'react-router';
import withStyles from '@material-ui/core/styles/withStyles';

import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import {
  Form,
  FormGroup,
  Input,
  Label,
  Col,
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';

import { DataGrid } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import Widget from 'components/Widget';
import { makeStyles } from '@material-ui/styles';

let styles = makeStyles((theme) => ({}));

const UsersTable = ({ classes }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [width, setWidth] = React.useState(window.innerWidth);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const [filters, setFilters] = React.useState([
    { label: 'First Name', title: 'firstName' },
    { label: 'Last Name', title: 'lastName' },
    { label: 'Phone Number', title: 'phoneNumber' },
    { label: 'E-mail', title: 'email' },
  ]);

  const [filterItems, setFilterItems] = React.useState([]);
  const [filterUrl, setFilterUrl] = React.useState('');

  const [loading, setLoading] = React.useState(false);
  const [sortModel, setSortModel] = React.useState([]);
  const [selectionModel, setSelectionModel] = React.useState([]);

  const count = useSelector((store) => store.users.list.count);
  const modalOpen = useSelector((store) => store.users.list.modalOpen);
  const rows = useSelector((store) => store.users.list.rows);
  const idToDelete = useSelector((store) => store.users.list.idToDelete);

  const [rowsState, setRowsState] = React.useState({
    page: 0,
    pageSize: 5,
  });

  React.useEffect(async () => {
    setLoading(true);
    await dispatch(
      actions.doFetch({
        limit: rowsState.pageSize,
        page: rowsState.page,
        orderBy: sortModel[0],
        request: filterUrl,
      }),
    );
    setLoading(false);
  }, [sortModel, rowsState]);

  React.useEffect(() => {
    updateWindowDimensions();
    window.addEventListener('resize', updateWindowDimensions);
    return () => window.removeEventListener('resize', updateWindowDimensions);
  }, []);

  const handleSortModelChange = (newModel) => {
    setSortModel(newModel);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const updateWindowDimensions = () => {
    setWidth(window.innerWidth);
  };

  const handleChange = (id) => (e) => {
    const value = e.target.value;
    const name = e.target.name;

    const index = filterItems.findIndex((item) => item.id === id);
    let obj = filterItems[index];
    obj.fields[name] = value;
    obj.id = id;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let request = '&';
    filterItems.forEach((item) => {
      filters[
        filters.map((filter) => filter.title).indexOf(item.fields.selectedField)
      ].hasOwnProperty('number')
        ? (request += `${item.fields.selectedField}Range=${item.fields.filterValueFrom}&${item.fields.selectedField}Range=${item.fields.filterValueTo}&`)
        : (request += `${item.fields.selectedField}=${item.fields.filterValue}&`);
    });

    dispatch(
      actions.doFetch({
        limit: rowsState.pageSize,
        page: 0,
        orderBy: sortModel[0],
        request,
      }),
    );
    setFilterUrl(request);
  };

  const handleReset = () => {
    setFilterItems([]);
    setFilterUrl('');
    dispatch(
      actions.doFetch({ limit: rowsState.pageSize, page: 0, request: '' }),
    );
  };

  const addFilter = () => {
    let newItem = {
      id: uniqueId(),
      fields: {
        filterValue: '',
        filterValueFrom: '',
        filterValueTo: '',
      },
    };
    newItem.fields.selectedField = filters[0].title;
    setFilterItems([...filterItems, newItem]);
  };

  const deleteFilter = (value) => (e) => {
    e.preventDefault();
    const newItems = filterItems.filter((item) => item.id !== value);
    if (newItems.length) {
      setFilterItems(newItems);
    } else {
      dispatch(actions.doFetch({ limit: 10, page: 1 }));
      setFilterItems(newItems);
    }
  };

  const handleDelete = () => {
    const id = idToDelete;
    dispatch(actions.doDelete({ limit: 10, page: 1 }, id));
  };

  const openModal = (event, cell) => {
    const id = cell;
    event.stopPropagation();
    dispatch(actions.doOpenConfirm(id));
  };

  const closeModal = () => {
    dispatch(actions.doCloseConfirm());
  };

  const columns = [
    {
      field: 'firstName',
      flex: 1,

      headerName: 'First Name',
    },

    {
      field: 'lastName',
      flex: 1,

      headerName: 'Last Name',
    },

    {
      field: 'phoneNumber',
      flex: 1,

      headerName: 'Phone Number',
    },

    {
      field: 'email',
      flex: 1,

      headerName: 'E-mail',
    },

    {
      field: 'role',
      flex: 1,

      headerName: 'Role',
    },

    {
      field: 'disabled',
      flex: 1,

      renderCell: (params) => dataFormat.booleanFormatter(params.row),

      headerName: 'Disabled',
    },

    {
      field: 'avatar',
      flex: 1,

      renderCell: (params) => dataFormat.imageFormatter(params.row),

      headerName: 'Avatar',
    },

    {
      field: 'id',
      headerName: 'Actions',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => actionFormatter(params),
    },
  ];

  const actionFormatter = (cell) => {
    return (
      <div>
        <IconButton onClick={handleClick}>
          <MoreVertIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          classes={classes}
        >
          <MenuItem
            classes={classes}
            onClick={() => {
              history.push(`/admin/users/${cell.id}/edit`);
              handleClose();
            }}
          >
            <EditIcon />
            Edit
          </MenuItem>
          <MenuItem
            classes={classes}
            onClick={(event) => {
              openModal(event, cell.id);
              handleClose();
            }}
          >
            <DeleteIcon />
            Delete
          </MenuItem>
        </Menu>
      </div>
    );
  };

  return (
    <div>
      <Widget title={<h4>Users</h4>} disableWidgetMenu>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            className='btn btn-primary ml-3'
            type='button'
            onClick={addFilter}
          >
            Add Filter
          </button>
          <Link to='/admin/users/new'>
            <Button variant='contained'>New</Button>
          </Link>
        </Box>

        <Form onSubmit={(e) => handleSubmit(e)}>
          {filterItems.map((item) => (
            <Row form className='mt-3' key={item.id}>
              <Col xs={4} md={4} lg={3}>
                <FormGroup>
                  <Label for='selectedField'>Field</Label>
                  <Input
                    type='select'
                    name='selectedField'
                    id='selectedField'
                    defaultValue={item.fields.selectedField}
                    onChange={handleChange(item.id)}
                  >
                    {filters.map((selectOption) => (
                      <option
                        key={selectOption.title}
                        value={`${selectOption.title}`}
                      >
                        {selectOption.label}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>

              <Col xs={4} md={4} lg={3} className='ml-0 ml-md-4'>
                {filters[
                  filters
                    .map((filter) => filter.title)
                    .indexOf(item.fields.selectedField)
                ].hasOwnProperty('number') ? (
                  <Row>
                    <Col>
                      <FormGroup>
                        <Label for='filterValueFrom'>From</Label>
                        <Input
                          type='text'
                          defaultValue={item.fields.filterValueFrom}
                          name='filterValueFrom'
                          id='filterValueFrom'
                          onChange={handleChange(item.id)}
                        />
                      </FormGroup>
                    </Col>
                    <Col>
                      <FormGroup>
                        <Label for='filterValueTo'>To</Label>
                        <Input
                          type='text'
                          defaultValue={item.fields.filterValueTo}
                          name='filterValueTo'
                          id='filterValueTo'
                          onChange={handleChange(item.id)}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                ) : (
                  <>
                    <FormGroup>
                      <Label for='filterValue'>Contains</Label>
                      <Input
                        type='text'
                        defaultValue={item.fields.filterValue}
                        name='filterValue'
                        id='filterValue'
                        onChange={handleChange(item.id)}
                      />
                    </FormGroup>
                  </>
                )}
              </Col>
              <Col xs={3} md={3} lg={2} className='align-self-center'>
                <button
                  className='btn btn-danger ml-3 mt-2'
                  onClick={deleteFilter(item.id)}
                >
                  Delete
                </button>
              </Col>
            </Row>
          ))}
          {filterItems.length > 0 && (
            <Row>
              <Col xs={12} lg={3} className='align-self-end mb-3'>
                <button
                  type='submit'
                  className='btn btn-primary'
                  value='Submit'
                >
                  Apply
                </button>
                <button
                  type='reset'
                  className='btn btn-danger ml-3'
                  value='Reset'
                  onClick={handleReset}
                >
                  Clear
                </button>
              </Col>
            </Row>
          )}
        </Form>

        <div
          style={{
            height: 500,
            width: '100%',
            paddingTop: 20,
            paddingBottom: 20,
          }}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            sortingMode='server'
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            rowsPerPageOptions={[5, 10, 20]}
            pageSize={5}
            pagination
            {...rowsState}
            rowCount={count}
            paginationMode='server'
            onPageChange={(page) => {
              setRowsState((prev) => ({ ...prev, page }));
            }}
            onPageSizeChange={(pageSize) => {
              setRowsState((prev) => ({ ...prev, pageSize }));
            }}
            onSelectionModelChange={(newSelectionModel) => {
              setSelectionModel(newSelectionModel);
            }}
            selectionModel={selectionModel}
            checkboxSelection
            disableSelectionOnClick
            disableColumnMenu
            loading={loading}
          />
        </div>

        <div>
          <a
            href={
              process.env.NODE_ENV === 'production'
                ? window.location.origin + '/api-docs/#/Users'
                : 'http://localhost:8080/api-docs/#/Users'
            }
          >
            API documentation for users
          </a>
        </div>
      </Widget>

      <Modal size='sm' isOpen={modalOpen} toggle={() => closeModal()}>
        <ModalHeader toggle={() => closeModal()}>Confirm delete</ModalHeader>
        <ModalBody>Are you sure you want to delete this item?</ModalBody>
        <ModalFooter>
          <Button color='primary' onClick={() => closeModal()}>
            Cancel
          </Button>
          <Button color='error' onClick={() => handleDelete()}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default withStyles(styles)(UsersTable);
