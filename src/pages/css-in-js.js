import React, { useState } from "react";
import styled from "@emotion/styled";

const NUMBER_OF_ELEMENTS = process.env.NEXT_PUBLIC_NUMBER_OF_ELEMENTS;

const StyledDiv = styled.div``;
const StyledButton = styled.button``;

export default function CssInJs() {
  const [, setCount] = useState(0);

  return (
    <React.Fragment>
      <StyledButton onClick={() => setCount((prev) => prev + 1)}>
        ForceUpdate
      </StyledButton>
      {Array.from({ length: NUMBER_OF_ELEMENTS }).map((_, index) => (
        <StyledDiv key={index}>Hello World</StyledDiv>
      ))}
    </React.Fragment>
  );
}
