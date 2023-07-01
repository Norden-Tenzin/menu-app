import { useState, useRef, useEffect } from "react";
import * as uuid from "uuid";
import { FiEdit2 } from "react-icons/fi";
import { IoIosSave } from "react-icons/io";
import { IoClose, IoAdd, IoImage } from "react-icons/io5";
import { MdImage } from "react-icons/md";
import { useForm, SubmitHandler } from "react-hook-form";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";
import ReactFileReader from "react-file-reader";
import Papa from "papaparse";
import {
  query,
  collection,
  doc,
  getDocs,
  where,
  addDoc,
  setDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
// styles
import "../styles/MenuGen.scss";
// internal
import { auth, db, storage } from "../utils/firebase";
import { setInputFilter } from "../utils/helper";
import { Dropdown } from "./Dropdown";
import { FormDropdown } from "./FormDropdown";

import QuantityButton from "./QuantityButton";
import nonveg from "../assets/nonveg.svg";
import veg from "../assets/veg.svg";

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
  img?: File | string;
  menu: MenuList;
  onDelete?(mid: string): void;
  onUpdate?(mid: string, key: string, value: string | boolean): void;
}

const MenuItem = ({ menu }: MenuItemProps) => {
  return (
    <div className="menu-container">
      <div className="menu-row-container-header">
        <span className="menu-item-title">mid:</span>
        <span className="menu-item">{menu.mid}</span>
      </div>
      <div className="menu-item-row-container">
        <div className="menu-item-column-container">
          <div className="title-row-container">
            <span className="menu-item-title">{menu.name}</span>
            {menu.diet === "veg" && <img src={veg} className="menu-item-tag" />}
            {menu.diet === "nonveg" && (
              <img src={nonveg} className="menu-item-tag" />
            )}
            {menu.diet === "" && (
              <span className="menu-item-tag">undefined</span>
            )}
          </div>
          <span className="menu-item-price">Rs.{menu.price}</span>
          <span className="menu-item-desc">{menu.desc}</span>
        </div>
        <div className="menu-item-column-img-container">
          {menu.img !== null && menu.img instanceof File && (
            <img
              src={URL.createObjectURL(menu.img)}
              className="menu-item-img"
            />
          )}
          {menu.img !== null && typeof menu.img === "string" && (
            <img src={menu.img} className="menu-item-img" />
          )}
          {menu.img === "" && <img className="menu-item-img" />}
          {menu.img === null && <img className="menu-item-img" />}

          {/* <img src={menu.img} className="menu-item-img" /> */}
          {/* <button className="menu-item-button">Add</button> */}
          {/* <QuantityButton className="menu-item-button-container" /> */}
          {/* <button>Add</button> */}

          {menu.isCustom && (
            <span className="menu-item-custom">customizable*</span>
          )}
        </div>
      </div>
    </div>
  );
};

const MenuItemEdit = ({ menu, onDelete, onUpdate }: MenuItemProps) => {
  const [displayImage, setDisplayImage] = useState(null);
  const hiddenDisplayImageInput = useRef<HTMLInputElement>(null);

  const [isCustom, setIsCustom] = useState(menu.isCustom);
  const [isVeg, setIsVeg] = useState(menu.diet === "veg" ? true : false);
  const [isNonVeg, setIsNonVeg] = useState(
    menu.diet === "nonveg" ? true : false
  );

  function validateInput(event) {
    const input = event.target;
    const inputValue = input.value;
    const regex = /^\d*\.?\d{0,2}$/;
    // if (!regex.test(inputValue)) {
    //   input.value = inputValue.slice(0, -1);
    // } else {
    //   onUpdate!(menu.mid, "name", )}
    // }
    if (!regex.test(inputValue)) {
      input.value = inputValue.slice(0, -1);
    } else {
      onUpdate!(menu.mid, "price", inputValue);
    }
  }

  function handleMenuTitle(event) {
    event.target.style.height = "inherit";
    event.target.style.height = `${event.target.scrollHeight}px`;
  }

  function handleMenuDesc(event) {
    event.target.style.height = "inherit";
    event.target.style.height = `${event.target.scrollHeight}px`;
  }

  const handleChangeDisplayImage = (e) => {
    setDisplayImage(e.target.files[0]);
    console.log(e.target.files[0]);
    onUpdate!(menu.mid, "img", e.target.files[0]);
  };

  const handleDisplayClick = (event) => {
    if (hiddenDisplayImageInput.current) {
      hiddenDisplayImageInput.current.click();
    }
  };

  const getDietIcon = (diet) => {
    if (diet === "veg") {
      return <img src={veg} style={{ height: "1.5rem" }} />;
    }
    if (diet === "nonveg") {
      return <img src={nonveg} style={{ height: "1.5rem" }} />;
    }
  };

  // onChange={(event) => {
  //   onUpdate!(menu.mid, "isCustom", event.target.value);
  // }}

  function handleVeg() {
    console.log(menu);
    if (isNonVeg) {
      setIsNonVeg(false);
      setIsVeg(true);
      onUpdate!(menu.mid, "diet", "veg");
    } else if (isVeg) {
      setIsVeg(false);
      onUpdate!(menu.mid, "diet", "");
    } else if (!isVeg) {
      setIsVeg(true);
      onUpdate!(menu.mid, "diet", "veg");
    }
  }

  function handleNonVeg() {
    console.log(menu);
    console.log(isNonVeg);
    if (isVeg) {
      setIsVeg(false);
      setIsNonVeg(true);
      onUpdate!(menu.mid, "diet", "nonveg");
    } else if (isNonVeg) {
      setIsNonVeg(false);
      onUpdate!(menu.mid, "diet", "");
    } else if (!isNonVeg) {
      setIsNonVeg(true);
      onUpdate!(menu.mid, "diet", "nonveg");
    }
  }

  function handleCustom() {
    if (isCustom) {
      setIsCustom(false);
      onUpdate!(menu.mid, "isCustom", false);
    } else {
      setIsCustom(true);
      onUpdate!(menu.mid, "isCustom", true);
    }
  }

  return (
    <div className="menu-container">
      <div>
        <input
          required
          type="file"
          ref={hiddenDisplayImageInput}
          onChange={handleChangeDisplayImage}
          style={{ display: "none" }}
        />
      </div>
      <div className="menu-row-container-header">
        <span className="menu-item-title">mid:</span>
        <span className="menu-item">{menu.mid}</span>
        <div
          className="button-container"
          onClick={() => onDelete!(menu.mid ?? "")}
        >
          <IoClose className="button" />
        </div>
      </div>
      <div className="menu-item-row-container">
        <div className="menu-item-column-container">
          <div className="title-row-container">
            <textarea
              className="menu-item-title"
              rows={1}
              onKeyDown={(event) => {
                handleMenuTitle(event);
              }}
              defaultValue={menu.name}
              onChange={(event) => {
                onUpdate!(menu.mid, "name", event.target.value);
              }}
              placeholder="Name"
            />
            <FormDropdown
              showArrow={true}
              className="dd-wrapper-menu-item"
              title={menu.diet === "" ? "Diet" : getDietIcon(menu.diet)}
            >
              <div className="dd-list">
                <div className="menu-item-diet-container">
                  <img src={nonveg} className="menu-item-diet" />
                  <input
                    type="checkbox"
                    checked={isNonVeg}
                    onChange={handleNonVeg}
                    className="menu-item-diet-text"
                  />
                </div>
                <div className="menu-item-diet-container">
                  <img src={veg} className="menu-item-diet" />
                  <input
                    type="checkbox"
                    checked={isVeg}
                    onChange={handleVeg}
                    className="menu-item-diet-text"
                  />
                </div>
              </div>
            </FormDropdown>
          </div>
          <div className="title-row-container">
            <span className="menu-item-currency"> Rs.</span>
            <input
              id="numericInput"
              type="text"
              placeholder="Enter numbers only"
              defaultValue={menu.price}
              onInput={(event) => {
                validateInput(event);
              }}
              className="menu-item-price"
            />
          </div>
          <textarea
            className="menu-item-desc"
            rows={2}
            defaultValue={menu.desc}
            onKeyDown={(event) => {
              handleMenuDesc(event);
            }}
            onChange={(event) => {
              onUpdate!(menu.mid, "desc", event.target.value);
            }}
            placeholder="Description..."
          />
        </div>
        <div className="menu-item-column-img-container">
          {displayImage === null ? (
            <div onClick={handleDisplayClick} className="menu-item-img">
              <MdImage className="menu-item-img-icon" />
            </div>
          ) : (
            <img
              src={URL.createObjectURL(displayImage)}
              onClick={handleDisplayClick}
              className="menu-item-img"
            />
          )}
          <div className="menu-item-row-custom">
            <span className="menu-item-custom">customizable*</span>
            <input
              type="checkbox"
              defaultChecked={menu.isCustom}
              onChange={handleCustom}
              className="menu-item-checkbox"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MenuGen() {
  const [user, loading, error] = useAuthState(auth);
  const hiddenMenuCSVInput = useRef<HTMLInputElement>(null);
  const [menuCSV, setMenuCSV] = useState(null);
  const navigate = useNavigate();
  const [menuList, setMenuList] = useState([] as Array<MenuList>);
  const [enableEdit, setEnableEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      return navigate("/");
    } else {
      getData();
    }
  }, [user, loading, navigate]);

  async function getData() {
    if (user) {
      // TODO based on the uid gets all the tables.setIsLoading(true);
      try {
        // interface MenuList {
        //   mid: string;
        //   img: null;
        //   name: string;
        //   price: number;
        //   diet: Diet | null;
        //   desc: string;
        //   isCustom: boolean;
        // }

        const res: MenuList[] = [];
        const ref = collection(db, "menu");
        const q = query(ref, where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
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
  }

  function addMenuItem() {
    try {
      const data: MenuList = {
        mid: uuid.v4(),
        img: null,
        name: "",
        diet: "",
        price: 0,
        desc: "",
        isCustom: false,
      };
      setMenuList(menuList.concat(data));
    } catch (error) {
      console.log(
        "%cerror UserPage.tsx line:192 ",
        "color: red; display: block; width: 100%;",
        error
      );
    }
  }

  function deleteMenuItem(mid) {
    setMenuList(
      menuList.filter((menuItem) => {
        return menuItem.mid !== mid;
      })
    );
  }

  function updateItem(mid: string, key: string, value: string | boolean) {
    const index = menuList.findIndex((item) => {
      return item.mid === mid;
    });
    if (index >= 0) {
      menuList[index][key] = value;
      setMenuList(menuList);
      console.log(menuList);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const path = `${user?.uid}/`;
    setIsLoading(true);
    // if (!isFormValid()) {
    //   setReqFail(true);
    //   setIsLoading(false);
    //   window.scrollTo({
    //     top: 0,
    //     behavior: "smooth",
    //   });
    //   return;
    // }

    const getType = (name: string) => {
      console.log(name);
      const type = name.split(".")[1].toLowerCase();
      const types = {
        jpg: "jpeg",
        jpeg: "jpeg",
        png: "png",
      };
      return types[type] || "jpeg";
    };

    // NOTE: Image Resize
    const resizeImage = async (imageFile) => {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1080,
        useWebWorker: true,
      };
      try {
        const compressedFile = await imageCompression(imageFile, options);
        return compressedFile;
      } catch (error) {
        console.log(
          "%cerror MenuGen.tsx line:442 ",
          "color: red; display: block; width: 100%;",
          error
        );
      }
    };

    // NOTE: Image Upload
    const uploadImage = async (mid: string, image) => {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (resolve, reject) => {
        const resizedImage: any = await resizeImage(image);
        const StorageRef = ref(storage, path + mid + "." + getType(image.name));
        try {
          const snapshot = await uploadBytesResumable(StorageRef, resizedImage);
          const downloadURL = await getDownloadURL(snapshot.ref);
          // console.log("Image uploaded successfully:", downloadURL);
          resolve({ mid: mid, url: downloadURL });
        } catch (error) {
          console.log(
            "%cerror MenuGen.tsx line:458 ",
            "color: red; display: block; width: 100%;",
            error
          );
        }
      });
    };

    const uploadImages = async () => {
      interface ImageList {
        mid: string;
        file: File | string | null;
      }
      const imgList: ImageList[] = [];

      console.log(menuList);
      for (const item of menuList) {
        console.log(typeof item);
        if (item.img !== null && item.img instanceof File) {
          const data: ImageList = {
            mid: item.mid,
            file: item.img,
          };
          imgList.push(data);
        }
      }
      console.log(imgList);
      const imagePromises = imgList.map((img) => {
        return uploadImage(img.mid, img.file);
      });

      try {
        // let urlList: { mid: string; url: string }[] | unknown = [];
        const urlList = await Promise.all(imagePromises);
        // console.log(urlList)

        // console.log("All URLs updated:", urls);
        // setImageUrls(urls);
        return urlList;
      } catch (error) {
        console.log(
          "%cerror MenuGen.tsx line:494 ",
          "color: red; display: block; width: 100%;",
          error
        );
      }
    };

    uploadImages().then((urlList) => {
      uploadData(urlList);
      setIsLoading(false);
    });
  }

  function csvmaker(data: MenuList[]): void {
    const csvRows: string[] = [];
    if (data.length > 0) {
      const headers: string[] = Object.keys(data[0]);
      csvRows.push(headers.join(","));
      for (const row of data) {
        const values = headers.map((e) => {
          return row[e];
        });
        csvRows.push(values.join(","));
      }
      const csvString = csvRows.join("\n");
      const a = document.createElement("a");
      a.href = "data:attachment/csv," + encodeURIComponent(csvString);
      a.target = "_blank";
      a.download = `${user?.uid}.csv`;
      document.body.appendChild(a);
      a.click();
    }
  }

  async function uploadData(urls) {
    console.log("INSIDE UPLOADDATA");
    console.log(menuList);
    console.log(urls);
    try {
      for (const item of menuList) {
        const index = urls.findIndex((urlItem) => {
          return urlItem.mid === item.mid;
        });
        if (index >= 0) {
          setDoc(doc(db, "menu", item.mid), {
            mid: item.mid,
            uid: user?.uid,
            name: item.name,
            desc: item.desc,
            diet: item.diet,
            custom: item.isCustom,
            img: urls[index].url,
            price: item.price,
            date: new Date(Date.now()),
          });
        } else {
          setDoc(doc(db, "menu", item.mid), {
            mid: item.mid,
            uid: user?.uid,
            name: item.name,
            desc: item.desc,
            diet: item.diet,
            custom: item.isCustom,
            img: item.img,
            price: item.price,
            date: new Date(Date.now()),
          });
        }
      }
    } catch (error) {
      console.log(
        "%cerror MenuGen.tsx line:538 ",
        "color: red; display: block; width: 100%;",
        error
      );
    }
  }

  function handleFiles(files) {
    const reader = new FileReader();
    let header: string[] = [];
    let value: string[] = [];
    const data: MenuList[] = [];
    reader.onload = function (e) {
      const text = e.target?.result;
      if (typeof text === "string") {
        const splitText = text.split("\n");
        header = splitText.splice(0, 1);
        value = splitText.splice(0);
        value.map((row) => {
          const splitRow = row.split(",");
          data.push({
            mid: splitRow[0],
            img: splitRow[1],
            name: splitRow[2],
            price: parseInt(splitRow[3]),
            diet: splitRow[4],
            desc: splitRow[5],
            isCustom: splitRow[6] === "true" ? true : false,
          });
        });
        console.log(data);
        setMenuList(data);
      }
    };
    reader.readAsText(files[0]);
  }

  return (
    <Dropdown showArrow={true} className="dd-wrapper-menu" title="Menu">
      {/* <input
        required
        type="file"
        ref={hiddenMenuCSVInput}
        onChange={handleChangeMenuCSVInput}
        style={{ display: "none" }}
        accept=".csv"
      /> */}
      <div className="dd-list">
        {menuList.map((menu, index) => {
          return !enableEdit ? (
            <MenuItem key={index} menu={menu} />
          ) : (
            <MenuItemEdit
              key={index}
              menu={menu}
              onDelete={deleteMenuItem}
              onUpdate={updateItem}
            />
          );
        })}
      </div>
      <div className="button-row-container">
        <div className="button-row-left">
          <ReactFileReader handleFiles={handleFiles} fileTypes={".csv"}>
            <button className="button-text">import CSV</button>
          </ReactFileReader>
          {/* <button
            className="button-text"
            onClick={() => {
              handleImportClick();
            }}
          >
            import
          </button> */}
          <button
            className="button-text"
            onClick={() => {
              csvmaker(menuList);
            }}
          >
            export CSV
          </button>
        </div>
        <div className="button-row-right">
          {!enableEdit && (
            <div
              className="button-container"
              onClick={(event) => {
                setEnableEdit(false);
                handleSubmit(event);
              }}
            >
              <IoIosSave className="button" />
            </div>
          )}
          {enableEdit ? (
            <div
              className="button-container"
              onClick={(event) => {
                setEnableEdit(false);
                handleSubmit(event);
              }}
            >
              <IoIosSave className="button" />
            </div>
          ) : (
            <div
              className="button-container"
              onClick={() => {
                setEnableEdit(true);
                console.log(menuList);
              }}
            >
              <FiEdit2 className="button" />
            </div>
          )}
          <div className="button-container" onClick={addMenuItem}>
            <IoAdd className="button" />
          </div>
        </div>
      </div>
    </Dropdown>
  );
}
