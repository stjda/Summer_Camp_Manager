import React from "react";
import styled from "styled-components";

export const SignUpImage = () => {
  return (
    <StyledImage>

        <img className="rectangle1" alt="Rectangle" src="https://imgur.com/PvCNTCs.png" />

    </StyledImage>
  );
};

const StyledImage = styled.div`
  // height: 100%;
  
  // width:100%;

  & .rectangle1 {
    height: 100%;
    width: 100%;
    bottom: 0;    
    // height: inherit;
    left: 0;
    object-fit: contain;
    position: fixed;
    object-position: center;
    top: 0;
    
    filter: brightness(1.1); // Brighten the image by 10%
  }
`;