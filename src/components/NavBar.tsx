import React, { useEffect, useState, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { query, collection, getDocs, where } from "firebase/firestore";
import { FiPlus, FiShare } from "react-icons/fi";
import { FunctionComponent } from "react";
// style
import "../styles/NavBar.scss";
// internal
import { auth, db, logout } from "../utils/firebase";
import { Dropdown } from "./Dropdown";
import { hostname } from "../utils/helper";

export default function NavBar() {
  const [user, loading, error] = useAuthState(auth);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const fetchUserName = async () => {
    if (user) {
      try {
        const q = query(collection(db, "users"), where("uid", "==", user?.uid));
        const doc = await getDocs(q);
        const data = doc.docs[0].data();
        setName(data.name);
        setUserId(data.uid);
      } catch (error) {
        console.log(
          "%cerror Dashboard.jsx line:23 ",
          "color: red; display: block; width: 100%;",
          error
        );
      }
    }
  };

  useEffect(() => {
    fetchUserName();
  }, [user, loading]);

  return (
    <div className="navbar">
      <div
        className="logo"
        onClick={() => {
          if (hostname === "") navigate(`/`);
          else navigate(`/${hostname}/`);
        }}
      >
        menu-ap
      </div>
      {/* COMMENT CODE HERE */}
    </div>
  );

  interface DropdownItemProps {
    onClick: () => void;
    children: any;
  }

  function DropdownMenu() {
    function DropdownItem({ onClick, children }: DropdownItemProps) {
      return (
        <div className="dd-list-item" onClick={onClick}>
          {children}
        </div>
      );
    }
    return (
      <div className="dd-list">
        <DropdownItem
          onClick={() => {
            if (hostname === "") navigate(`/user/${userId}`);
            else navigate(`/${hostname}/user/${userId}`);
          }}
        >
          Home
        </DropdownItem>
        <DropdownItem onClick={logout}>Logout</DropdownItem>
      </div>
    );
  }
}

// {!user ? (
  // <div className="links">
  //   <button
  //     className="navbar-button"
  //     onClick={() => {
  //       if (hostname === "") navigate(`/login`);
  //       else navigate(`/${hostname}/login`);
  //     }}
  //   >
  //     sign in
  //   </button>
  //   <button
  //     className="navbar-button"
  //     onClick={() => {
  //       if (hostname === "") navigate(`/register`);
  //       else navigate(`/${hostname}/register`);
  //     }}
  //   >
  //     sign up
  //   </button>
  // </div>
// ) : (
  // <div className="links">
  //   {/* <div
  //     className="navbar-account-icon-container"
  //     onClick={() => {
  //       navigate("/ck3-dna/upload");
  //     }}
  //   >
  //     <FiShare className="navbar-account-icon" />
  //   </div> */}
  //    <Dropdown
  //     title={name != "" ? `${name}` : "..."}
  //     showArrow={false}
  //     className=""
  //   >
  //     <DropdownMenu />
  //   </Dropdown>
  // </div> 
// )}
// </div>