import Container from "@/components/Container";
import Link from "next/link";
import React from "react";

const SuccessPage = () => {
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
