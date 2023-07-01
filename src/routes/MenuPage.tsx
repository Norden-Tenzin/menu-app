import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  query,
  collection,
  doc,
  getDocs,
  where,
  addDoc,
  setDoc,
} from "firebase/firestore";
// styles
import "../styles/Menu.scss";
// internal
import { auth, db } from "../utils/firebase";
import NavBar from "../components/NavBar";
import img1 from "../assets/img1.avif";
import img2 from "../assets/img2.avif";
import img3 from "../assets/img3.avif";
import { Dropdown } from "../components/Dropdown";
import QuantityButton from "../components/QuantityButton";

const tags = ["Pizza", "Fast Food", "Deserts"];
const imgs = [img1, img2, img3];

interface MenuList {
  mid: string;
  img: File | string | null;
  name: string;
  price: number;
  diet: string;
  desc: string;
  isCustom: boolean;
}
interface MenuItemProps {
  item: MenuList;
}

const MenuItem = ({ item }: MenuItemProps) => {
  return (
    <div>
      <div className="menu-item-row-container">
        <div className="menu-item-column-container">
          <div className="title-row-container">
            <span className="menu-item-title">{item.name}</span>
            <span className="menu-item-tag">{item.diet}</span>
          </div>
          <span className="menu-item-price">1000 rs.</span>
          <span className="menu-item-desc">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Placeat,
            debitis quam maiores laudantium expedita porro qui ex repellendus
            nisi cupiditate? Officia perspiciatis inventore sit asperiores amet
            quo consequatur labore nam.
          </span>
        </div>
        <div className="menu-item-column-img-container">
          {/* <img src={item.img ?? ""} className="menu-item-img" /> */}
          {item.img !== null && item.img instanceof File && (
            <img
              src={URL.createObjectURL(item.img)}
              className="menu-item-img"
            />
          )}
          {item.img !== null && typeof item.img === "string" && (
            <img src={item.img} className="menu-item-img" />
          )}
          {item.img === "" && <img className="menu-item-img" />}
          {item.img === null && <img className="menu-item-img" />}
          {/* <button className="menu-item-button">Add</button> */}
          <QuantityButton className="menu-item-button-container" />
          <span className="menu-item-custom">customizable*</span>
        </div>
      </div>
    </div>
  );
};

export default function MenuPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [uid, setUid] = useState("");
  const [menuList, setMenuList] = useState([] as Array<MenuList>);

  useEffect(() => {
    console.log("MENUPAGE");
    if (!authenticateTable()) {
      return navigate("/");
    }
  }, []);

  useEffect(() => {
    console.log("UIDUPDATE");
    if (uid !== "") {
      getData();
    }
  }, [uid]);

  const authenticateTable = async () => {
    try {
      const queryTables = query(
        collection(db, "tables"),
        where("tid", "==", params.tid)
      );
      getDocs(queryTables).then((tableDocs) => {
        setUid(tableDocs.docs[0].data().uid);
        const uid = tableDocs.docs[0].data().uid;
        const queryUsers = query(
          collection(db, "users"),
          where("uid", "==", uid),
          where("name", "==", params.bname)
        );
        getDocs(queryUsers).then((userDocs) => {
          if (userDocs.docs.length === 1) {
            return true;
          } else {
            return false;
          }
        });
      });
    } catch (error) {
      console.log(
        "%cerror Dashboard.jsx line:23 ",
        "color: red; display: block; width: 100%;",
        error
      );
    }
  };

  function getData() {
    console.log(uid);
    const queryTables = query(collection(db, "menu"), where("uid", "==", uid));
    getDocs(queryTables).then((menuDocs) => {
      const res: MenuList[] = [];
      menuDocs.forEach((doc) => {
        const docData = doc.data();
        console.log(docData);
        res.push({
          mid: docData.mid,
          img: docData.img,
          name: docData.name,
          price: docData.price,
          diet: docData.diet,
          desc: docData.desc,
          isCustom: docData.custom,
        });
      });
      setMenuList(res);
    });
  }

  return (
    <div className="page-container">
      <div className="page">
        <NavBar />
        {/* Header */}
        <div className="header-container">
          <span className="header-text">Pizza Hut</span>
          <div className="header-tag-container">
            {tags.map((item, index) => {
              return (
                <span key={index} className="header-tag-text">
                  {item}
                </span>
              );
            })}
          </div>
        </div>
        {/* Filters */}
        <div className="filters-container">
          <div className="filters-tag-container">
            <button className="filters-tag-button">Veg</button>
            <button className="filters-tag-button">Non-Veg</button>
            <button className="filters-tag-button">Bestseller</button>
            <button className="filters-tag-button">Top Rated</button>
          </div>
        </div>
        {/* Menu */}
        <div className="menu-container">
          <Dropdown
            showArrow={true}
            className="dd-wrapper-menu"
            title="Newly Launched"
          >
            <div className="dd-list">
              {menuList.map((menuItem, index) => {
                return (
                  <div>
                    <MenuItem key={index} item={menuItem} />
                    {/* <div className="divider"></div> */}
                  </div>
                );
              })}
            </div>
          </Dropdown>
        </div>
      </div>
    </div>
  );
}
