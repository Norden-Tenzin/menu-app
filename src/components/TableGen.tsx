import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import * as uuid from "uuid";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import { FiEdit2 } from "react-icons/fi";
import { IoIosSave } from "react-icons/io";
import { IoClose, IoAdd, IoImage, IoDownloadOutline } from "react-icons/io5";
import { MdImage } from "react-icons/md";
import {
  query,
  getDocs,
  collection,
  where,
  orderBy,
  addDoc,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";
// styles
import "../styles/TableGen.scss";
// internal
import { Dropdown } from "../components/Dropdown";
import { auth, db } from "../utils/firebase";

const host = window.location.host;
const Examplehost = "172.20.10.4:3000";
const qrURL = `http://${Examplehost}/menu/`;

interface TableProps {
  tid: string;
  bname: string;
  name: string;
  did?: string;
  // index: number;
  onDelete(did: string);
  onUpdate(tid: string, name: string);
}

const Table = ({ tid, bname, name, onUpdate }: TableProps) => {
  const container = useRef(null);
  const [tableName, setTableName] = useState(name);
  const [qrWidth, setQrWidth] = useState(0);
  const [enableEdit, setEnableEdit] = useState(false);
  // useLayoutEffect(() => {}, []);
  useEffect(() => {
    if (container.current) {
      // @ts-expect-error: Property 'offsetWidth' does not exist on type 'never'.ts(2339)
      setQrWidth(container.current.offsetWidth);
    }
  }, []);

  const download = () => {
    const canvas = document.getElementById("qr");
    if (canvas) {
      const link = document.createElement("a");
      link.download = `${tid}-QR.png`;
      // @ts-expect-error: Property 'toDataURL' does not exist on type 'HTMLElement'.
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="table-container">
      <div className="table-row-container-header">
        <span className="table-item-title">tid:</span>
        <span className="table-item">{tid}</span>
      </div>
      <div className="table-row-container">
        <div className="table-column-container">
          <div className="table-row-container-header">
            <span className="table-item-title">table name:</span>
          </div>
          {enableEdit ? (
            <input
              type="text"
              className="table-item-input"
              value={tableName}
              onChange={(e) => {
                setTableName(e.target.value);
              }}
            />
          ) : (
            <span className="table-item">{tableName}</span>
          )}
          {enableEdit && (
            <button
              className="table-item-button"
              onClick={() => {
                setEnableEdit(false);
                onUpdate(tid, tableName);
              }}
            >
              save
            </button>
          )}
        </div>
        <div className="table-column-img-container" ref={container}>
          <QRCodeSVG
            value={qrURL + `${bname}/${tid}`}
            size={qrWidth}
            level={"H"}
            className="table-qr-code"
          />
          <QRCodeCanvas
            value={qrURL + `${bname}/${tid}`}
            size={720}
            level={"H"}
            id="qr"
            style={{ display: "none" }}
          />
          <button onClick={download} className="table-item-button">
            <IoDownloadOutline className="table-item-button-icon" />
            QR
          </button>
        </div>
      </div>
    </div>
  );
};

const TableEdit = ({
  tid,
  name,
  bname,
  did,
  onUpdate,
  onDelete,
}: TableProps) => {
  const container = useRef(null);
  // const [tableName, setTableName] = useState(name);
  const [qrWidth, setQrWidth] = useState(0);
  const [enableEdit, setEnableEdit] = useState(false);
  // useLayoutEffect(() => {}, []);
  useEffect(() => {
    if (container.current) {
      // @ts-expect-error: Property 'offsetWidth' does not exist on type 'never'.ts(2339)
      setQrWidth(container.current.offsetWidth);
    }
  }, []);

  // const download = () => {
  //   const canvas = document.getElementById("qr");
  //   if (canvas) {
  //     const link = document.createElement("a");
  //     link.download = `${tid}-QR.png`;
  //     // @ts-expect-error: Property 'toDataURL' does not exist on type 'HTMLElement'.
  //     link.href = canvas.toDataURL();
  //     link.click();
  //   }
  // };

  function handleTableTitle(event) {
    event.target.style.height = "inherit";
    event.target.style.height = `${event.target.scrollHeight}px`;
  }

  return (
    <div className="table-container">
      <div className="table-row-container-header">
        <span className="table-item-title">tid:</span>
        <span className="table-item">{tid}</span>
        <div
          className="button-container"
          onClick={() => {
            onDelete(tid);
          }}
        >
          <IoClose className="button" />
        </div>
      </div>
      <div className="table-row-container">
        <div className="table-column-container">
          <div className="table-row-container-header">
            <span className="table-item-title">table name:</span>
          </div>
          <textarea
            className="table-item-input"
            rows={1}
            onKeyDown={(event) => {
              handleTableTitle(event);
            }}
            defaultValue={name}
            onChange={(event) => {
              onUpdate!(tid, event.target.value);
            }}
            placeholder="Name"
          />
          {/* <input
            type="text"
            className="table-item-input"
            value={tableName}
            onChange={(e) => {
              setTableName(e.target.value);
            }}
          /> */}
          {enableEdit && (
            <button
              className="table-item-button"
              onClick={() => {
                setEnableEdit(false);
                // onUpdate(tid, tableName);
              }}
            >
              save
            </button>
          )}
        </div>
        <div className="table-column-img-container" ref={container}>
          <QRCodeSVG
            value={qrURL + `${bname}/${tid}`}
            size={qrWidth}
            level={"H"}
            className="table-qr-code"
          />
          <QRCodeCanvas
            value={qrURL + `${bname}/${tid}`}
            size={720}
            level={"H"}
            id="qr"
            style={{ display: "none" }}
          />
        </div>
      </div>
    </div>
  );
};

const TableGen = () => {
  interface TableList {
    tid: string;
    bname: string;
    name: string;
    uid?: string;
  }
  const navigate = useNavigate();
  const [user, loading, error] = useAuthState(auth);
  const [tableList, setTableList] = useState<Array<TableList>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [enableEdit, setEnableEdit] = useState(false);
  const [bName, setBName] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      return navigate("/");
    } else {
      getData();
      getBusinessName();
    }
  }, [user, loading, navigate]);

  const getBusinessName = async () => {
    if (user) {
      try {
        const q = query(collection(db, "users"), where("uid", "==", user?.uid));
        const doc = await getDocs(q);
        const data = doc.docs[0].data();
        setBName(data.name);
      } catch (error) {
        console.log(
          "%cerror Dashboard.jsx line:23 ",
          "color: red; display: block; width: 100%;",
          error
        );
      }
    }
  };

  const getData = async () => {
    if (user) {
      // TODO based on the uid gets all the tables.setIsLoading(true);
      try {
        const res: TableList[] = [];
        const ref = collection(db, "tables");
        const q = query(ref, where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          res.push({
            tid: docData.tid,
            bname: bName,
            name: docData.name,
            uid: docData.uid,
          });
        });
        setTableList(res);
      } catch (error) {
        console.log(
          "%cerror CardPage.jsx line:31 ",
          "color: red; display: block; width: 100%;",
          error
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const addTable = async () => {
    const data: TableList = {
      tid: uuid.v4(),
      bname: bName,
      name: tableList.length.toString(),
    };
    try {
      await setDoc(doc(db, "tables", data.tid), {
        tid: data.tid,
        name: data.name,
        // TODO add user id
        uid: user?.uid,
      });
      setTableList(tableList.concat(data));
    } catch (error) {
      console.log(
        "%cerror UserPage.tsx line:192 ",
        "color: red; display: block; width: 100%;",
        error
      );
    }
  };

  const deleteTable = async (deleteTid) => {
    try {
      await deleteDoc(doc(db, "tables", deleteTid));
      setTableList(tableList.filter((table) => table.tid !== table.tid));
    } catch (error) {
      console.log(
        "%cerror CustomCard.jsx line:24 ",
        "color: red; display: block; width: 100%;",
        error
      );
    }
  };

  const updateTable = (tid, name) => {
    const index = tableList.findIndex((table) => {
      return table.tid === tid;
    });
    if (index >= 0) {
      tableList[index].name = name;
      setTableList(tableList);
      console.log(tableList);
    }
  };

  async function uploadData() {
    console.log(tableList);
    try {
      for (const item of tableList) {
        console.log(item.name);
        setDoc(doc(db, "tables", item.tid), {
          tid: item.tid,
          name: item.name,
          uid: user?.uid,
          date: new Date(Date.now()),
        });
      }
    } catch (error) {
      console.log(
        "%cerror TableGen.tsx line:332 ",
        "color: red; display: block; width: 100%;",
        error
      );
    }
  }

  return (
    <Dropdown showArrow={true} className="dd-wrapper-menu" title="Tables">
      <div className="dd-list">
        {tableList.map((table, index) => {
          return !enableEdit ? (
            <Table
              key={index}
              tid={table.tid}
              bname={bName}
              name={table.name}
              onDelete={deleteTable}
              onUpdate={updateTable}
            />
          ) : (
            <TableEdit
              key={index}
              tid={table.tid}
              bname={bName}
              name={table.name}
              onDelete={deleteTable}
              onUpdate={updateTable}
            />
          );
        })}
      </div>
      <div className="table-button-row-container">
        <div className="table-button-row-right">
          {!enableEdit && (
            <div
              className="table-button-container"
              onClick={(event) => {
                setEnableEdit(false);
                uploadData();
              }}
            >
              <IoIosSave className="table-button" />
            </div>
          )}
          {enableEdit ? (
            <div
              className="table-button-container"
              onClick={(event) => {
                setEnableEdit(false);
                uploadData();
              }}
            >
              <IoIosSave className="table-button" />
            </div>
          ) : (
            <div
              className="table-button-container"
              onClick={() => {
                setEnableEdit(true);
              }}
            >
              <FiEdit2 className="table-button" />
            </div>
          )}
          <div className="table-button-container" onClick={addTable}>
            <IoAdd className="table-button" />
          </div>
        </div>
      </div>
    </Dropdown>
  );
};

export default TableGen;
