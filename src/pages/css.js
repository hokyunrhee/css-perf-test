import React, { useState } from "react";

const NUMBER_OF_ELEMENTS = process.env.NEXT_PUBLIC_NUMBER_OF_ELEMENTS;

const NormalDiv = (props) => <div {...props} />;

export default function Css() {
  const [_, setCount] = useState(0);

  return (
    <React.Fragment>
      <button onClick={() => setCount((prev) => prev + 1)}>ForceUpdate</button>
      {Array.from({ length: NUMBER_OF_ELEMENTS }).map((_, index) => (
        <NormalDiv key={index}>Hello World</NormalDiv>
      ))}
    </React.Fragment>
  );
}
