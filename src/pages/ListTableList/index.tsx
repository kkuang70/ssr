import { PlusOutlined } from '@ant-design/icons';
import { Button, Divider, message, Input, Drawer } from 'antd';
import React, { useState, useRef } from 'react';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import ProDescriptions from '@ant-design/pro-descriptions';
import CreateForm from './components/CreateForm';
import UpdateForm, { FormValueType } from './components/UpdateForm';
import { TableListItem } from './data.d';
import { queryRule, updateRule, addRule, removeRule } from './service';

/**
 * Add node
 * @param fields
 */
const handleAdd = async (fields: TableListItem) => {
  const hide = message.loading('正在添加');
  try {
    await addRule({ ...fields });
    hide();
    message.success('添加成功');
    return true;
  } catch (error) {
    hide();
    message.error('添加失败请重试！');
    return false;
  }
};

/**
 * Update node
 * @param fields
 */
const handleUpdate = async (fields: FormValueType) => {
  const hide = message.loading('正在配置');
  try {
    await updateRule({
      name: fields.name,
      desc: fields.desc,
      key: fields.key,
    });
    hide();

    message.success('配置成功');
    return true;
  } catch (error) {
    hide();
    message.error('配置失败请重试！');
    return false;
  }
};

/**
 *  Delete node
 * @param selectedRows
 */
const handleRemove = async (selectedRows: TableListItem[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await removeRule({
      key: selectedRows.map((row) => row.key),
    });
    hide();
    message.success('删除成功，即将刷新');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};

const TableList: React.FC<{}> = () => {
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [stepFormValues, setStepFormValues] = useState({});
  const actionRef = useRef<ActionType>();
  const [row, setRow] = useState<TableListItem>();
  const [selectedRowsState, setSelectedRows] = useState<TableListItem[]>([]);
  const columns: ProColumns<TableListItem>[] = [
    {
      title: 'Rule name',
      dataIndex: 'name',
      tip: 'The rule name is the unique key',
      formItemProps: {
        rules: [
          {
            required: true,
            message: 'Rule name is required',
          },
        ],
      },
      render: (dom, entity) => {
        return <a onClick={() => setRow(entity)}>{dom}</a>;
      },
    },
    {
      title: 'description',
      dataIndex: 'desc',
      valueType: 'textarea',
    },
    {
      title: 'Number of service calls',
      dataIndex: 'callNo',
      sorter: true,
      hideInForm: true,
      renderText: (val: string) => `${val} 万`,
    },
    {
      title: 'status',
      dataIndex: 'status',
      hideInForm: true,
      valueEnum: {
        0: { text: 'Default', status: 'Default' },
        1: { text: 'Processing', status: 'Processing' },
        2: { text: 'Success', status: 'Success' },
        3: { text: 'Error', status: 'Error' },
      },
    },
    {
      title: 'Last scheduled time',
      dataIndex: 'updatedAt',
      sorter: true,
      valueType: 'dateTime',
      hideInForm: true,
      renderFormItem: (item, { defaultRender, ...rest }, form) => {
        const status = form.getFieldValue('status');
        if (`${status}` === '0') {
          return false;
        }
        if (`${status}` === '3') {
          return <Input {...rest} placeholder="Please enter the reason for the exception!" />;
        }
        return defaultRender(item);
      },
    },
    {
      title: 'operating',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <>
          <a
            onClick={() => {
              handleUpdateModalVisible(true);
              setStepFormValues(record);
            }}
          >
            Configuration
          </a>
          <Divider type="vertical" />
          <a href="">Subscribe to alerts</a>
        </>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<TableListItem>
        headerTitle="Enquiry form"
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button key="1" type="primary" onClick={() => handleModalVisible(true)}>
            <PlusOutlined /> New
          </Button>,
        ]}
        request={(params, sorter, filter) => queryRule({ ...params, sorter, filter })}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => setSelectedRows(selectedRows),
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              chosen <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a> 项&nbsp;&nbsp;
              <span>
              Total number of service calls {selectedRowsState.reduce((pre, item) => pre + item.callNo, 0)} 万
              </span>
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            batch deletion
          </Button>
          <Button type="primary">Batch approval</Button>
        </FooterToolbar>
      )}
      <CreateForm onCancel={() => handleModalVisible(false)} modalVisible={createModalVisible}>
        <ProTable<TableListItem, TableListItem>
          onSubmit={async (value) => {
            const success = await handleAdd(value);
            if (success) {
              handleModalVisible(false);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          rowKey="key"
          type="form"
          columns={columns}
        />
      </CreateForm>
      {stepFormValues && Object.keys(stepFormValues).length ? (
        <UpdateForm
          onSubmit={async (value) => {
            const success = await handleUpdate(value);
            if (success) {
              handleUpdateModalVisible(false);
              setStepFormValues({});
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          onCancel={() => {
            handleUpdateModalVisible(false);
            setStepFormValues({});
          }}
          updateModalVisible={updateModalVisible}
          values={stepFormValues}
        />
      ) : null}

      <Drawer
        width={600}
        visible={!!row}
        onClose={() => {
          setRow(undefined);
        }}
        closable={false}
      >
        {row?.name && (
          <ProDescriptions<TableListItem>
            column={2}
            title={row?.name}
            request={async () => ({
              data: row || {},
            })}
            params={{
              id: row?.name,
            }}
            columns={columns}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
