"use client";
import React, { useEffect, useState, useRef } from "react";
import Container from "./Container";
import Logo from "./Logo";
import { IoMdCart } from "react-icons/io";
import { FiSearch, FiLogOut } from "react-icons/fi";
import { AiOutlineUser } from "react-icons/ai";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { Products, StateProps } from "../../type";
import FormattedPrice from "./FormattedPrice";
import Link from "next/link";
import { addUser, deleteUser, setSearchQuery } from "@/redux/shoppingSlice";
import { BsBookmarks } from "react-icons/bs";
import { logEvent, saveUserToFirestore } from "@/lib/firebase";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useFirestoreUser } from "@/hooks/useFirestoreUser";

const Header = () => {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const { productData, orderData } = useSelector(
    (state: StateProps) => state.shopping
  );
  const loginTracked = useRef<string | null>(null);
  
  // Firebase Auth user data
  const { user: firebaseUser, loading: firebaseLoading } = useFirebaseAuth();
  
  // Get user data from Firestore (using email as userId)
  const firestoreUserId = session?.user?.email || firebaseUser?.email || null;
  const { userData: firestoreUserData, loading: firestoreLoading } = useFirestoreUser(firestoreUserId);

  useEffect(() => {
    if (session) {
      const userEmail = session.user?.email || "";
      const userId = userEmail || session.user?.name || "";
      
      // Save user data to Firestore
      if (userId) {
        saveUserToFirestore(userId, {
          name: session.user?.name || null,
          email: session.user?.email || null,
          image: session.user?.image || null,
          provider: "next-auth-google",
        }).catch((error) => {
          console.error("Failed to save user to Firestore:", error);
        });
      }

      dispatch(
        addUser({
          name: session?.user?.name,
          email: session?.user?.email,
          image: session?.user?.image,
        })
      );
      
      // Track login event to Firebase Analytics (only once per session)
      if (loginTracked.current !== userEmail) {
        try {
          logEvent("login", {
            method: "google",
            user_id: userEmail,
            user_email: userEmail,
          });
          loginTracked.current = userEmail;
        } catch (error) {
          console.error("Failed to log login event:", error);
        }
      }
    } else {
      dispatch(deleteUser());
      loginTracked.current = null;
    }
  }, [session, dispatch]);

  // Monitor Firebase Auth user data
  useEffect(() => {
    if (firebaseUser) {
      console.log("Firebase Auth User Data:", {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        emailVerified: firebaseUser.emailVerified,
      });
      
      // Save Firebase Auth user to Firestore
      if (firebaseUser.email || firebaseUser.uid) {
        const userId = firebaseUser.email || firebaseUser.uid;
        saveUserToFirestore(userId, {
          name: firebaseUser.displayName || null,
          email: firebaseUser.email || null,
          image: firebaseUser.photoURL || null,
          provider: "firebase-auth-google",
        }).catch((error) => {
          console.error("Failed to save Firebase Auth user to Firestore:", error);
        });
      }
      
      // Optionally sync Firebase Auth user to Redux
      // You can use this data alongside or instead of NextAuth
      if (!session) {
        dispatch(
          addUser({
            name: firebaseUser.displayName || firebaseUser.email || "",
            email: firebaseUser.email || "",
            image: firebaseUser.photoURL || "",
          })
        );
      }
    } else if (!firebaseLoading && !firebaseUser) {
      // User is not authenticated with Firebase Auth
      console.log("No Firebase Auth user found");
      if (!session) {
        dispatch(deleteUser());
      }
    }
  }, [firebaseUser, firebaseLoading, session, dispatch]);

  // Log Firestore user data when available
  useEffect(() => {
    if (firestoreUserData) {
      console.log("User data from Firestore:", firestoreUserData);
    } else if (!firestoreLoading && firestoreUserId && !firestoreUserData) {
      console.log("No user data found in Firestore for:", firestoreUserId);
    }
  }, [firestoreUserData, firestoreLoading, firestoreUserId]);

  const [totalAmt, setTotalAmt] = useState(0);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    let amt = 0;
    productData.map((item: Products) => {
      amt += item.price * item.quantity;
      return;
    });
    setTotalAmt(amt);
  }, [productData]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    dispatch(setSearchQuery(value));
  };

  // Clear search on Escape key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setSearchInput("");
      dispatch(setSearchQuery(""));
    }
  };

  return (
    <div className="bg-bodyColor h-20 top-0 sticky z-50">
      <Container className="h-full flex items-center md:gap-x-5 justify-between md:justify-start">
        <Logo />
        {/* Search Field */}
        <div className="w-full bg-white hidden md:flex items-center gap-x-1 border-[1px] border-lightText/50 rounded-full px-4 py-1.5 focus-within:border-orange-600 group">
          <FiSearch className="text-gray-500 group-focus-within:text-darkText duration-200" />
          <input
            type="text"
            placeholder="Search for products"
            className="placeholder:text-sm flex-1 outline-none"
            value={searchInput}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />
        </div>
        {/* Login/Register */}
        {!session && (
          <div onClick={() => signIn()} className="headerDiv cursor-pointer">
            <AiOutlineUser className="text-2xl" />
            <p className="text-sm font-semibold">Login/Register</p>
          </div>
        )}
        {/* Cart button */}
        <Link href={"/cart"}>
          <div className="bg-black hover:bg-slate-950 rounded-full text-slate-100 hover:text-white flex items-center justify-center gap-x-1 px-3 py-1.5 border-[1px] border-black hover:border-orange-600 duration-200 relative">
            <IoMdCart className="text-xl" />
            <p className="text-sm font-semibold">
              <FormattedPrice amount={totalAmt ? totalAmt : 0} />
            </p>
            <span className="bg-white text-orange-600 rounded-full text-xs font-semibold absolute -right-2 -top-1 w-5 h-5 flex items-center justify-center shadow-xl shadow-black">
              {productData ? productData?.length : 0}
            </span>
          </div>
        </Link>
        {/* user Image */}
        {session && (
          <Image
            src={session?.user?.image as string}
            alt="user image"
            width={50}
            height={50}
            className="rounded-full object-cover"
          />
        )}
        {/* Order button */}
        {orderData?.order?.length > 0 && session && (
          <Link
            href={"/order"}
            className="headerDiv px-2 gap-x-1 cursor-pointer"
          >
            <BsBookmarks className="text-2xl" />
            <p className="text-sm font-semibold">Orders</p>
          </Link>
        )}
        {/* Logout button */}
        {session && (
          <div
            onClick={() => signOut()}
            className="headerDiv px-2 gap-x-1 cursor-pointer"
          >
            <FiLogOut className="text-2xl" />
            <p className="text-sm font-semibold">Logout</p>
          </div>
        )}
      </Container>
    </div>
  );
};

export default Header;
