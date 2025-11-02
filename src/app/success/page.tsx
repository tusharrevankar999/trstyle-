"use client";
import Container from "@/components/Container";
import Link from "next/link";
import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { logEvent } from "@/lib/firebase";

const SuccessPage = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Track payment event to Firebase Analytics
    if (sessionId) {
      try {
        logEvent("purchase", {
          transaction_id: sessionId,
          value: 0, // You can calculate the actual value from order data if available
          currency: "USD",
        });
      } catch (error) {
        console.error("Failed to log payment event:", error);
      }
    }
  }, [sessionId]);

  return (
    <Container className="flex items-center justify-center py-20">
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-y-5">
        <h2 className="text-4xl font-bold">
          Your Payment Accepted by TRStyle
        </h2>
        <p>Now you can view your Orders or continue Shopping with us</p>
       
      </div>
    </Container>
  );
};

export default SuccessPage;
