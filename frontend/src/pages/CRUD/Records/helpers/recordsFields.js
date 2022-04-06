const recordsFields = {
  id: { type: 'id', label: 'ID' },

  task: { type: 'string', label: 'Task' },

  hours: { type: 'decimal', label: 'Hours' },

  user: { type: 'relation_one', label: 'User' },

  submitted: { type: 'boolean', label: 'Submitted' },

  project: { type: 'relation_one', label: 'Project' },

  record_type: {
    type: 'enum',
    label: 'Record Type',

    options: [
      { value: 'marketing', label: 'marketing' },

      { value: 'development', label: 'development' },

      { value: 'research', label: 'research' },
    ],
  },
};

export default recordsFields;
