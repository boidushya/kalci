import { ImageResponse } from "next/og";
import React from "react";
export const runtime = "edge";

const GET = async () => {
  return new ImageResponse(
    (
      <div
        style={{
          letterSpacing: "-.02em",
          fontWeight: 700,
          height: "100%",
          width: "100%",
          display: "flex",
          textAlign: "center",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          flexWrap: "nowrap",
          backgroundColor: "black",
          backgroundImage:
            "linear-gradient(135deg, rgb(60,60,0,0.75) 0%, rgb(40,40,40,0.05) 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            padding: "20px 50px",
            margin: "0 42px",
            fontSize: 40,
            width: "10000px",
            textAlign: "center",
            backgroundColor: "white",
            fontWeight: "bold",
            color: "rgb(20, 20, 20, 1)",
            lineHeight: 1.4,
            transform: "rotate(-6deg)",
          }}
        >
          ⚖️ Kalc - A Kamino Playground
        </div>
      </div>
    ) as React.ReactElement,
    {
      width: 1200,
      height: 600,
    }
  );
};

export default GET;
