import BpmnModeler from 'bpmn-js/lib/Modeler';
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
} from 'bpmn-js-properties-panel';
import activitiModdleDescriptor from './moddle/activiti.json';
import xmlFormatter from 'xml-formatter';

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
  ],
  moddleExtensions: {
    activiti: activitiModdleDescriptor
  }
});

let isTextView = false;
let textViewContent = '';

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
      const urlParams = new URLSearchParams(window.location.search);
      const modelId = urlParams.get('modelId');
      const formData = new FormData();
      formData.append('modelId', modelId);

      let content;
      if (isTextView) {
        // 在文本视图中保存文本编辑器里的内容
        content = document.getElementById('bpmnTextView').value;
      } else {
        // 在图形视图中保存图形编辑器产生的内容
        const { xml } = await modeler.saveXML({ format: true });
        content = xml;
      }

      formData.append('content', content);
      const res = await fetch('http://localhost:7001/workflow/procModel/save/modelConfig', {
        method: 'POST',
        body: formData
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
  },

  // 切换视图
  async toggleView() {
    const canvas = document.getElementById('canvas');
    const propertiesPanel = document.getElementById('properties-panel');
    const textView = document.getElementById('bpmnTextView');

    if (isTextView) {
      // 从文本视图切换到模型视图
      const xml = textView.value;
      try {
        await modeler.importXML(xml);
        textView.style.display = 'none';
        canvas.style.display = 'block';
        propertiesPanel.style.display = 'block';
      } catch (err) {
        console.error('XML 导入失败:', err);
        alert('XML 导入失败，请检查 XML 格式是否正确。');
      }
    } else {
      // 从模型视图切换到文本视图
      const { xml } = await modeler.saveXML({ format: true });
      textView.value = textViewContent || xmlFormatter(xml);
      textView.style.display = 'block';
      canvas.style.display = 'none';
      propertiesPanel.style.display = 'none';
    }

    isTextView = !isTextView;
  }
};

// 默认流程XML
const defaultProcessXML = `
<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1"/>
    <bpmn:userTask id="UserTask_1" name="User Task"/>
    <bpmn:endEvent id="EndEvent_1"/>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="UserTask_1"/>
    <bpmn:sequenceFlow id="Flow_2" sourceRef="UserTask_1" targetRef="EndEvent_1"/>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="173" y="102" width="36" height="36"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="UserTask_1_di" bpmnElement="UserTask_1">
        <dc:Bounds x="259" y="80" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="409" y="102" width="36" height="36"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="209" y="120"/>
        <di:waypoint x="259" y="120"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="359" y="120"/>
        <di:waypoint x="409" y="120"/>
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
`;

// 初始化
(async () => {
  try {
    // 获取URL参数中的modelId
    const urlParams = new URLSearchParams(window.location.search);
    const modelId = urlParams.get('modelId');

    let xml;
    if (modelId) {
      // 请求接口获取BPMN配置内容
      const res = await fetch(`http://localhost:7001/workflow/procModel/loadXML/${modelId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        xml = data.data.content;
      }
    }

    // 如果没有获取到内容，则使用默认流程
    if (!xml) {
      xml = defaultProcessXML;
    }

    // 加载BPMN配置内容
    await modeler.importXML(xml);
    
    // 绑定事件
    ['exportBtn', 'saveBtn', 'toggleViewBtn'].forEach(id => 
      document.getElementById(id)?.addEventListener('click', utils[id === 'exportBtn' ? 'exportBpmn' : id === 'saveBtn' ? 'saveDiagram' : 'toggleView']));
    
    ['zoomIn', 'zoomOut', 'resetZoom'].forEach(id => 
      document.getElementById(`${id}Btn`)?.addEventListener('click', () => 
        utils.zoom(id === 'zoomIn' ? 0.1 : id === 'zoomOut' ? -0.1 : null)));
    
    ['undo', 'redo'].forEach(id => 
      document.getElementById(`${id}Btn`)?.addEventListener('click', () => 
        modeler.get('commandStack')[id]()));
  } catch (err) {
    console.error('初始化失败:', err);
  }
})();