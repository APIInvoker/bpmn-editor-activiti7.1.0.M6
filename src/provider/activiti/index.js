import { UserTaskProperties } from './parts/UserTaskProperties';

export default function ActivitiPropertiesProvider(propertiesPanel, translate) {
  // 提供属性组
  this.getGroups = function(element) {
    return function(groups) {
      // 添加用户任务相关属性组
      if(element.type === 'bpmn:UserTask') {
        groups.push(createUserTaskGroup(element, translate));
      }
      
      return groups;
    }
  };

  function createUserTaskGroup(element, translate) {
    const userTaskGroup = {
      id: 'userTask',
      label: translate('User Task'),
      entries: [
        ...UserTaskProperties(element, translate)
      ]
    };

    return userTaskGroup;
  }

  propertiesPanel.registerProvider(500, UserTaskProperties);
}

ActivitiPropertiesProvider.$inject = [ 'propertiesPanel', 'translate' ];
