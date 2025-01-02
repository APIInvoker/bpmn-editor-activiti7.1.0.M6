import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';

export function UserTaskProperties(element, translate) {
  return [
    {
      id: 'assignee',
      element,
      component: Assignee,
      isEdited: isTextFieldEntryEdited
    },
    {
      id: 'candidateUsers',
      element, 
      component: CandidateUsers,
      isEdited: isTextFieldEntryEdited
    },
    {
      id: 'candidateGroups',
      element,
      component: CandidateGroups, 
      isEdited: isTextFieldEntryEdited
    },
    {
      id: 'candidates',
      description: 'Specify the candidates for the user task',
      label: 'Candidates',
      modelProperty: 'candidates'
    }
  ];
}

function Assignee(props) {
  const { element, id } = props;

  return TextFieldEntry({
    id: id,
    element: element,
    label: translate('Assignee'),
    getValue: (el) => {
      return el.businessObject.assignee;
    },
    setValue: (el, value) => {
      el.businessObject.assignee = value;
    }
  });
}

function CandidateUsers(props) {
  const { element, id } = props;
  
  return TextFieldEntry({
    id: id,
    element: element,
    label: translate('Candidate Users'),
    getValue: (el) => {
      return el.businessObject.candidateUsers;
    },
    setValue: (el, value) => {
      el.businessObject.candidateUsers = value;
    }
  });
}

function CandidateGroups(props) {
  const { element, id } = props;

  return TextFieldEntry({
    id: id, 
    element: element,
    label: translate('Candidate Groups'),
    getValue: (el) => {
      return el.businessObject.candidateGroups;  
    },
    setValue: (el, value) => {
      el.businessObject.candidateGroups = value;
    }
  });
}
