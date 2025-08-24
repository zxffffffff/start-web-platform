import React, { useState, useRef } from 'react';
import {
  PageContainer,
  ProTable,
  ActionType,
  ProColumns,
} from '@ant-design/pro-components';
import { useIntl, FormattedMessage } from '@umijs/max';
import { Button, message, Modal, Form, Input } from 'antd';
import { PlusOutlined, DeleteOutlined, DownloadOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import { getDataList, createData, getData, updateData, deleteData } from '@/services/datas';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const Datas: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const intl = useIntl();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [viewModalVisible, setViewModalVisible] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [viewContent, setViewContent] = useState<string>('');
  const [viewName, setViewName] = useState<string>('');
  const [viewId, setViewId] = useState<string>('');
  const [editingId, setEditingId] = useState<string>('');
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // 获取数据列表
  const fetchDataList = async (params: {
    current?: number;
    pageSize?: number;
  }) => {
    try {
      const result = await getDataList({
        pageNo: params.current,
        pageSize: params.pageSize,
      });

      if (result?.ok) {
        return {
          data: result.data?.dataList.map((item) => ({
            id: item.id,
            name: item.name,
            content: item.content,
          })) || [],
          success: true,
          total: result.data?.totalCount || 0,
        };
      } else {
        message.error(intl.formatMessage({
          id: 'pages.datas.fetchFailed',
          defaultMessage: '获取数据列表失败'
        }));
        return {
          data: [],
          success: false,
          total: 0,
        };
      }
    } catch (error) {
      message.error(intl.formatMessage({
        id: 'pages.datas.fetchFailed',
        defaultMessage: '获取数据列表失败'
      }));
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  // 删除数据
  const handleDelete = async (id: string, name: string) => {
    try {
      const result = await deleteData(id);
      if (result?.ok) {
        message.success(intl.formatMessage({
          id: 'pages.datas.deleteSuccess',
          defaultMessage: '删除成功'
        }));
        actionRef.current?.reload();
      } else {
        message.error(intl.formatMessage({
          id: 'pages.datas.deleteFailed',
          defaultMessage: '删除失败'
        }));
      }
    } catch (error) {
      message.error(intl.formatMessage({
        id: 'pages.datas.deleteFailed',
        defaultMessage: '删除失败'
      }));
    }
  };

  // 下载数据
  const handleDownload = async (record: API.DataItem) => {
    try {
      // 创建完整数据对象
      const dataObject = {
        id: record.id,
        name: record.name,
        content: record.content
      };

      // 将对象转换为格式化的JSON字符串
      const jsonString = JSON.stringify(dataObject, null, 2);

      // 创建Blob对象，使用application/json类型
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });

      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${record.name}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      message.error(intl.formatMessage({
        id: 'pages.datas.downloadFailed',
        defaultMessage: '下载失败'
      }));
    }
  };

  // 查看数据
  const handleView = async (id: string) => {
    try {
      const result = await getData(id);
      if (result?.ok && result.data) {
        setViewContent(result.data.content || '');
        setViewName(result.data.name);
        setViewId(result.data.id);
        setViewModalVisible(true);
      } else {
        message.error(intl.formatMessage({
          id: 'pages.datas.viewFailed',
          defaultMessage: '查看数据失败'
        }));
      }
    } catch (error) {
      message.error(intl.formatMessage({
        id: 'pages.datas.viewFailed',
        defaultMessage: '查看数据失败'
      }));
    }
  };

  // 编辑数据 - 打开编辑弹窗
  const handleEdit = async (id: string) => {
    try {
      const result = await getData(id);
      if (result?.ok && result.data) {
        setEditingId(result.data.id);
        editForm.setFieldsValue({
          name: result.data.name,
          content: result.data.content
        });
        setEditModalVisible(true);
      } else {
        message.error(intl.formatMessage({
          id: 'pages.datas.fetchDetailFailed',
          defaultMessage: '获取数据内容失败'
        }));
      }
    } catch (error) {
      message.error(intl.formatMessage({
        id: 'pages.datas.fetchDetailFailed',
        defaultMessage: '获取数据内容失败'
      }));
    }
  };

  // 更新数据
  const handleUpdate = async (values: any) => {
    try {
      const result = await updateData(editingId, {
        name: values.name,
        content: values.content || ''
      });

      if (result?.ok && result.data) {
        message.success(intl.formatMessage({
          id: 'pages.datas.updateSuccess',
          defaultMessage: '更新成功'
        }));
        setEditModalVisible(false);
        editForm.resetFields();
        actionRef.current?.reload();
      } else {
        message.error(intl.formatMessage({
          id: 'pages.datas.updateFailed',
          defaultMessage: '更新失败'
        }));
      }
    } catch (error: any) {
      message.error(error.message || intl.formatMessage({
        id: 'pages.datas.updateFailed',
        defaultMessage: '更新失败'
      }));
    }
  };

  // 创建数据
  const handleCreate = async (values: any) => {
    try {
      const result = await createData({
        name: values.name,
        content: values.content || ''
      });

      if (result?.ok && result.data) {
        message.success(intl.formatMessage({
          id: 'pages.datas.createSuccess',
          defaultMessage: '创建成功'
        }));
        setModalVisible(false);
        form.resetFields();
        actionRef.current?.reload();
      } else {
        message.error(intl.formatMessage({
          id: 'pages.datas.createFailed',
          defaultMessage: '创建失败'
        }));
      }
    } catch (error: any) {
      message.error(error.message || intl.formatMessage({
        id: 'pages.datas.createFailed',
        defaultMessage: '创建失败'
      }));
    }
  };

  const columns: ProColumns<API.DataItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.datas.id"
          defaultMessage="ID"
        />
      ),
      dataIndex: 'id',
      key: 'data-id',
    },
    {
      title: (
        <FormattedMessage
          id="pages.datas.name"
          defaultMessage="名称"
        />
      ),
      dataIndex: 'name',
      key: 'data-name',
    },
    {
      title: (
        <FormattedMessage
          id="pages.datas.content"
          defaultMessage="内容"
        />
      ),
      dataIndex: 'content',
      key: 'data-content',
      ellipsis: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.datas.option"
          defaultMessage="操作"
        />
      ),
      valueType: 'option',
      key: 'data-option',
      render: (_, record) => (
        <>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record.id)}
          >
            <FormattedMessage
              id="pages.datas.view"
              defaultMessage="查看"
            />
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.id)}
          >
            <FormattedMessage
              id="pages.datas.edit"
              defaultMessage="编辑"
            />
          </Button>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record)}
          >
            <FormattedMessage
              id="pages.datas.download"
              defaultMessage="下载"
            />
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: intl.formatMessage({
                  id: 'pages.datas.deleteConfirm',
                  defaultMessage: '确认删除'
                }),
                content: intl.formatMessage({
                  id: 'pages.datas.deleteConfirmContent',
                  defaultMessage: '确定要删除该数据吗？'
                }),
                onOk: () => handleDelete(record.id, record.name),
              });
            }}
          >
            <FormattedMessage
              id="pages.datas.delete"
              defaultMessage="删除"
            />
          </Button>
        </>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.DataItem>
        headerTitle={intl.formatMessage({
          id: 'pages.datas.title',
          defaultMessage: '数据管理'
        })}
        actionRef={actionRef}
        rowKey="id"
        search={false}
        request={fetchDataList}
        columns={columns}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            onClick={() => setModalVisible(true)}
          >
            <PlusOutlined />
            <FormattedMessage
              id="pages.datas.create"
              defaultMessage="新建数据"
            />
          </Button>,
        ]}
      />

      {/* 查看数据弹窗 */}
      <Modal
        title={intl.formatMessage({
          id: 'pages.datas.view',
          defaultMessage: '查看数据'
        })}
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        width={800}
        footer={null}
      >
        <h3>{viewName}</h3>
        <div style={{ marginBottom: 16 }}>
          <strong>
            <FormattedMessage
              id="pages.datas.id"
              defaultMessage="ID"
            />:
          </strong> {viewId}
        </div>
        <div style={{ marginBottom: 16 }}>
          <strong>
            <FormattedMessage
              id="pages.datas.content"
              defaultMessage="内容"
            />:
          </strong>
        </div>
        <SyntaxHighlighter language="text" style={docco}>
          {viewContent}
        </SyntaxHighlighter>
      </Modal>

      {/* 编辑数据弹窗 */}
      <Modal
        title={intl.formatMessage({
          id: 'pages.datas.edit',
          defaultMessage: '编辑数据'
        })}
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          editForm.resetFields();
        }}
        onOk={() => editForm.submit()}
      >
        <Form
          form={editForm}
          onFinish={handleUpdate}
        >
          <Form.Item
            label={intl.formatMessage({
              id: 'pages.datas.name',
              defaultMessage: '名称'
            })}
            name="name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({
              id: 'pages.datas.content',
              defaultMessage: '内容'
            })}
            name="content"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 创建数据弹窗 */}
      <Modal
        title={intl.formatMessage({
          id: 'pages.datas.create',
          defaultMessage: '新建数据'
        })}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          onFinish={handleCreate}
        >
          <Form.Item
            label={intl.formatMessage({
              id: 'pages.datas.name',
              defaultMessage: '名称'
            })}
            name="name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({
              id: 'pages.datas.content',
              defaultMessage: '内容'
            })}
            name="content"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Datas;
