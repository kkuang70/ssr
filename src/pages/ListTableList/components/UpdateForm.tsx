import React from 'react';
import { Modal } from 'antd';
import {
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  StepsForm,
  ProFormRadio,
  ProFormDateTimePicker,
} from '@ant-design/pro-form';

import { TableListItem } from '../data.d';

export interface FormValueType extends Partial<TableListItem> {
  target?: string;
  template?: string;
  type?: string;
  time?: string;
  frequency?: string;
}

export interface UpdateFormProps {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalVisible: boolean;
  values: Partial<TableListItem>;
}

const UpdateForm: React.FC<UpdateFormProps> = (props) => (
  <StepsForm
    stepsProps={{
      size: 'small',
    }}
    stepsFormRender={(dom, submitter) => {
      return (
        <Modal
          width={640}
          bodyStyle={{ padding: '32px 40px 48px' }}
          destroyOnClose
          title="Rule configuration"
          visible={props.updateModalVisible}
          footer={submitter}
          onCancel={() => props.onCancel()}
        >
          {dom}
        </Modal>
      );
    }}
    onFinish={props.onSubmit}
  >
    <StepsForm.StepForm
      initialValues={{
        name: props.values.name,
        desc: props.values.desc,
      }}
      title="Basic Information"
    >
      <ProFormText
        name="name"
        label="Rule name"
        width="m"
        rules={[{ required: true, message: 'Please enter the rule name!' }]}
      />
      <ProFormTextArea
        name="desc"
        width="m"
        label="Rule description"
        placeholder="Please enter at least five characters"
        rules={[{ required: true, message: 'Please enter a rule description of at least five characters!', min: 5 }]}
      />
    </StepsForm.StepForm>
    <StepsForm.StepForm
      initialValues={{
        target: '0',
        template: '0',
      }}
      title="Configure rule properties"
    >
      <ProFormSelect
        name="target"
        width="m"
        label="Monitoring object"
        valueEnum={{
          0: 'Table I',
          1: 'Table II',
        }}
      />
      <ProFormSelect
        width="m"
        name="template"
        label="Rule template"
        valueEnum={{
          0: 'Rule template one',
          1: 'Rule template two',
        }}
      />
      <ProFormRadio.Group
        name="type"
        label="Rule type"
        options={[
          {
            value: '0',
            label: 'Strong',
          },
          {
            value: '1',
            label: 'Weak',
          },
        ]}
      />
    </StepsForm.StepForm>
    <StepsForm.StepForm
      initialValues={{
        type: '1',
        frequency: 'month',
      }}
      title="Set scheduling period"
    >
      <ProFormDateTimePicker
        name="time"
        label="Starting time"
        rules={[{ required: true, message: 'Please choose a start time!' }]}
      />
      <ProFormSelect
        name="frequency"
        label="监控对象"
        width="xs"
        valueEnum={{
          month: 'month',
          week: 'week',
        }}
      />
    </StepsForm.StepForm>
  </StepsForm>
);

export default UpdateForm;
