import BpmnModeler from 'bpmn-js/lib/Modeler';
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
} from 'bpmn-js-properties-panel';

// 导入样式
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import 'bpmn-js-properties-panel/dist/assets/properties-panel.css';
import './styles.css';

// 初始化建模器
const modeler = new BpmnModeler({
  container: '#canvas',
  propertiesPanel: {
    parent: '#properties-panel'
  },
  additionalModules: [
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule
  ]
});

// 工具函数
const utils = {
  // 导出BPMN文件
  async exportBpmn() {
    try {
      const { xml } = await modeler.saveXML({ format: true });
      const blob = new Blob([xml], { type: 'application/xml' });
      const link = document.createElement('a');
      link.download = `process_${Date.now()}.bpmn`;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('导出失败:', err);
    }
  },

  // 保存到服务器
  async saveDiagram() {
    try {
      const { xml } = await modeler.saveXML({ format: true });
      const res = await fetch('/api/bpmn/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xml })
      });
      if (!res.ok) throw new Error(res.statusText);
    } catch (err) {
      console.error('保存失败:', err);
    }
  },

  // 缩放画布
  zoom(delta) {
    const canvas = modeler.get('canvas');
    canvas.zoom(delta ? canvas.zoom() + delta : 1.0);
  }
};

// 初始化
(async () => {
  try {
    await modeler.createDiagram();
    
    // 绑定事件
    ['exportBtn', 'saveBtn'].forEach(id => 
      document.getElementById(id)?.addEventListener('click', utils[id === 'exportBtn' ? 'exportBpmn' : 'saveDiagram']));
    
    ['zoomIn', 'zoomOut', 'resetZoom'].forEach(id => 
      document.getElementById(`${id}Btn`)?.addEventListener('click', () => 
        utils.zoom(id === 'zoomIn' ? 0.1 : id === 'zoomOut' ? -0.1 : null)));
    
    ['undo', 'redo'].forEach(id => 
      document.getElementById(`${id}Btn`)?.addEventListener('click', () => 
        modeler.get('commandStack')[id]()));  // This line binds the redo button to the redo function of the command stack
  } catch (err) {
    console.error('初始化失败:', err);
  }
})();