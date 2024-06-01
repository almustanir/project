import React, { useEffect } from "react";
import { message, Tabs, Table } from "antd";
import PageTitle from "../../components/PageTitle";
import NewRequestModal from "./NewRequestModal";
import Modals from "../../components/Modal-Transcation/ForRequestsPage";


import {
  GetAllRequestsByUser,
  UpdateRequestStatus,
} from "../../apicalls/requests";
import { useDispatch, useSelector } from "react-redux";
import { HideLoading, ShowLoading } from "../../redux/loadersSlice";
import moment from "moment";
import { ReloadUser } from "../../redux/usersSlice";

const { TabPane } = Tabs;


function Requests() {
  const [data, setData] = React.useState([]);
  const [showNewRequestModal, setShowNewRequestModal] = React.useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.users);

  const getData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetAllRequestsByUser();
      console.log("response",response)
      if (response.success) {
        const sendData = response.data.filter(
          (item) => item.sender._id === user.id
        );         

        const receivedData = response.data.filter(
          (item) => item.receiver._id === user.id
        );

        setData({
          sent: sendData,
          received: receivedData,
        });
      }

      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const updateStatus = async (record, status) => {
    try {
      // console.log(record.amount,"user balance",user.balance)
      if (status === "accepted" && record.amount > user.convertedAmount) {
        
        message.error("Insufficient funds");
        return;
      } else {
        dispatch(ShowLoading());
        const response = await UpdateRequestStatus({
          ...record,
          status,
        });
        dispatch(HideLoading());
        if (response.success) {
          message.success(response.message);
          getData();
          dispatch(ReloadUser(true));
        } else {
          message.error(response.message);
        }
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const columns = [
    {
      title: "Request ID",
      dataIndex: "_id",
    },
    {
      title: "Sender",
      dataIndex: "sender",
      render(sender) {
        return sender.firstName + " " + sender.lastName;
      },
    },
    {
      title: "Receiver",
      dataIndex: "receiver",
      render(receiver) {
        return receiver.firstName + " " + receiver.lastName;
      },
    },
    {
      title: "Amount",
      dataIndex: "convertedAmount",
      render(convertedAmount,record){
        return convertedAmount+record.currency
      }
    },
    {
      title: "Date",
      dataIndex: "date",
      render(text, record) {
        return moment(record.createdAt).format("DD-MM-YYYY hh:mm:ss A");
      },
    },
    {
      title: "Status",
      dataIndex: "status",
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (text, record) => {
        if (record.status === "pending" && record.receiver._id === user.id) {
          return (
            <div className="flex gap-1">
              <h1
                className="text-sm underline p-2 br bg-secondary"
                onClick={() => updateStatus(record, "rejected")}
              >
                Reject
              </h1>
              <h1
                className="text-sm underline p-2 br bg-secondary"
                onClick={() => {updateStatus(record, "accepted")}}
              >
                Accept
              </h1>
            </div>
          );
        }
      },
    },
  ];

  useEffect(() => {
    getData();
  }, []);

  const viewport_width = window.innerWidth;

  return (
    <div>
      <div className="flex m-2 justify-around items-center request-header">
        <PageTitle title="Requests" />
      </div>
       <Tabs defaultActiveKey="1">
         <TabPane tab="Sent" key="1">
          {(viewport_width > 850) ? <Table columns={columns} dataSource={data.sent} />:<Modals dataSource={data.sent || []} items={columns}></Modals>}
         </TabPane>
         <TabPane tab="Received" key="2">
         {(viewport_width > 850) ? <Table columns={columns} dataSource={data.received} />:<Modals dataSource={data.received || []} items={columns}></Modals>}
         </TabPane>
       </Tabs>

      {showNewRequestModal && (
        <NewRequestModal
          showNewRequestModal={showNewRequestModal}
          setShowNewRequestModal={setShowNewRequestModal}
          reloadData={getData}
        />
      )}
    </div>
  );
}

export default Requests;
