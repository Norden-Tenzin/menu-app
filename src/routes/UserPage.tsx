import React, { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
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
import "../styles/UserPage.scss";
// internal
import NavBar from "../components/NavBar";
import MenuGen from "../components/MenuGen";
import TableGen from "../components/TableGen";
import { auth, db } from "../utils/firebase";

export default function UserPage() {
  const [user, loading, error] = useAuthState(auth);
  const navigate = useNavigate();
  const params = useParams();

  const isAuthorized = async () => {
    try {
      const q = query(
        collection(db, "users"),
        where("uid", "==", user?.uid),
        where("name", "==", params.bname)
      );
      const doc = (await getDocs(q)).docs;
      if (doc.length === 1) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(
        "%cerror Dashboard.jsx line:23 ",
        "color: red; display: block; width: 100%;",
        error
      );
    }
  };

  useEffect(() => {
    console.log("USERPAGE");
    if (loading) return;
    if (!user) {
      return navigate("/");
    } else {
      console.log(params.bname);
      if (!isAuthorized()) {
        return navigate("/");
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="page-container">
      <div className="page">
        <NavBar />
        <div className="generator-container">
          <TableGen />
          <MenuGen />
        </div>
      </div>
    </div>
  );
}
